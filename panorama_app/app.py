import json
import logging
import time
import os
from datetime import datetime
from logging.handlers import RotatingFileHandler

import boto3
from botocore.exceptions import ClientError
import cv2
import numpy as np
import panoramasdk
#from graph import build_detection_graph, is_isomorphic, largest_common_subgraph
import math

s3 = boto3.client('s3', region_name='eu-west-1')
sqs = boto3.client('sqs', region_name='eu-west-1')
# Change the commented when testing in the Panorama simulator:
base_dir = os.getenv("BASE_DIR", "/panorama/")
#base_dir = '/home/ubuntu/aws-panorama-samples/samples/people_counter/people_counter_app/packages/102895080962-PEOPLE_COUNTER_CODE-1.0/src/'

class Application(panoramasdk.node):
    def __init__(self):
        """Initializes the application's attributes with parameters from the interface, and default values."""
        self.MODEL_NODE = "model_node"
        self.MODEL_DIM = 512
        self.frame_num = 0
        self.threshold = 40.
        
        try:
            # Parameters
            logger.info('Getting parameters')
            self.threshold = self.inputs.threshold.get()
            with open(base_dir + 'classes.json','r') as f:
                self.classes=json.load(f)
            self.sqs_url = self.inputs.sqs_url.get()
            self.s3_bucket = self.inputs.s3_bucket.get()
            self.s3_bucket = "aws-panorama-booth-images-102895080962"
            self.sqs_url = "https://sqs.eu-west-1.amazonaws.com/102895080962/ShelfMonitor.fifo"
            # Init reference planogram items
            self.reference_graph = None
            self.reference_detections = None
            self.reference_image = None
        except:
            logger.exception('Error during initialization.')
        finally:
            logger.info('Initialiation complete.')
            logger.info('Threshold: {}'.format(self.threshold))
            

    def process_streams(self):
        """Processes one frame of video from one or more video streams."""
        self.frame_num += 1
        #logger.debug(self.frame_num)

        # Loop through attached video streams
        streams = self.inputs.video_in.get()
        for stream in streams:
            self.process_media(stream)
        self.outputs.video_out.put(streams)

    def process_media(self, stream):
        """Runs inference on a frame of video."""
        image_data = preprocess(stream.image, self.MODEL_DIM)
        #logger.debug(image_data.shape)
        # Run inference
        inference_results = self.call({"data":image_data}, self.MODEL_NODE)
        # logger.info(inference_results)
        # Process results (object deteciton)
        self.process_results(inference_results, stream)

        
    def process_results(self, inference_results, stream):
        """Processes output tensors from a computer vision model and annotates a video frame."""
        if inference_results is None:
            logger.warning("Inference results are None.")
            return

        # Make a copy image to overlay bounding box
        h,w,c = stream.image.shape
        detected = 0
        
        class_data = None # Class Data
        bbox_data = None # Bounding Box Data
        conf_data = None # Confidence Data

        detections = []
        scores = []

        items = []
        for i in range(len(self.classes)):
            items.append(0)
        
        # Pulls data from the class holding the results
        # inference_results is a class, which can be iterated through
        # but inference_results has no index accessors (cannot do inference_results[0])

        k = 0
        for det_data in inference_results:
            if k == 0:
                class_data = det_data[0]
            if k == 1:
                conf_data = det_data[0]
            if k == 2:
                bbox_data = det_data[0]
                for a in range(len(conf_data)):
                    if conf_data[a][0] * 100 > self.threshold:
                        items[int(float(class_data[a]))] += 1
                        (left, top, right, bottom) = np.clip(det_data[0][a]/self.MODEL_DIM,0,1)
                        detections.append((int(float(class_data[a])), [left, top, right, bottom]))
                        scores.append(round(conf_data[a][0] * 100))
                        detected += 1
                    else:
                        continue
            k += 1
        
        # Get count of detected items:
        uri = stream.stream_uri
        detected_count = {}
        if 'stream1' in uri:
            product_type = 'beverages'
            for k, l in enumerate(items):
                detected_count[self.classes[k]] = l
            cv2.putText(stream.image,'Total beverages: {}'.format(str(detected)), (int(w-(w*0.97)), int(h-(h*0.95))), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
        else:
            product_type = 'snacks'
            for k, l in enumerate(items):
                detected_count[self.classes[k]] = l
            cv2.putText(stream.image,'Total products: {}'.format(str(detected)), (int(w-(w*0.97)), int(h-(h*0.95))), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)

        # Perform planogram validation if something is detected:
        if detected >= 1:
            image_to_s3 = self.planogram_validation(detections, stream.image, product_type, scores)
        else:
            image_to_s3 = stream.image
        # Sending predicted frame to S3 and metadata to SQS - Only once every 2 seconds:
        if datetime.now().second%2 == 0:
            self.push_to_cloud(image_to_s3, detected_count, product_type, uri)

            
    def planogram_validation(self, detections, live_image, product_type, scores):
        if product_type == 'snacks':

            # First time we define the reference array...
            if (self.reference_detections is None) or (datetime.now().minute%2 == 0):
                logger.info("Setting reference planogram...")
                self.reference_detections = detections
                self.reference_image = live_image.copy()
                # Highlight detections in reference frame in blue...
                cv2.putText(self.reference_image,'Reference Planogram', (20, 20), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
                for obs in range(len(detections)):
                    cls, bbox = detections[obs]
                    cls_name = self.classes[cls]
                    put_bbox(img=self.reference_image, bbox=bbox, color=(0, 0, 255), text='{} - {}%'.format(cls_name, scores[obs]))
                # Store the reference planogram frame in S3
                ref_key = self.store_planogram_frame(self.reference_image, 'snacks', 'ref')
            

            # Highlight detections on the live frame which match the planogram in green...
            ref_match = [0] * len(self.reference_detections)
            for obs in range(len(detections)):
                found_match = 0
                cls, bbox = detections[obs]
                cls_name = self.classes[cls]
                for idx in range(len(self.reference_detections)):
                    r_cls, r_bbox = self.reference_detections[idx]
                    centre = get_bbox_centre(bbox)
                    r_centre = get_bbox_centre(r_bbox)
                    distance =  math.sqrt((centre[0] - r_centre[0])**2 + (centre[1] - r_centre[1])**2)
                    #logger.info("centre r_centre distance: {} {} {}".format(centre, r_centre, distance))
                    if (abs(distance) <= 0.1) and (cls == r_cls):
                        #logger.info("match bbox cls_name idx obs: {} {} {} {}".format(bbox, cls_name, idx, obs))
                        put_bbox(img=live_image, bbox=bbox, color=(0, 255, 0), text='{} - {}%'.format(cls_name, scores[obs]))
                        ref_match[idx] = 1
                        found_match = 1
                        break
                if (found_match == 0):
                    # Flag any detections in the live frame which weren't contained in the planogram (or are displaced) in yellow...
                    #logger.info("misplaced: {} {}".format(bbox, cls_name))
                    put_bbox(img=live_image, bbox=bbox, color=(0, 255, 255), text='{} - {}% misplaced'.format(cls_name, scores[obs]))
            
            #logger.info("ref_match: {}".format(ref_match))
            
            # Flag any detections in the ref frame which weren't found. These are missing so are in red...
            for idx in range(len(self.reference_detections)):
                if (ref_match[idx] == 0):
                    r_cls, r_bbox = self.reference_detections[idx]
                    cls_name = self.classes[r_cls]
                    #logger.info("missing: {} {}".format(r_bbox, cls_name))
                    put_bbox(img=live_image, bbox=r_bbox, color=(0, 0, 255), text='{} missing'.format(cls_name))

        else:
            # Highlight all detections in beverages:
            for obs in range(len(detections)):
                cls, bbox = detections[obs]
                cls_name = self.classes[cls]
                put_bbox(img=live_image, bbox=bbox, color=(0, 255, 0), text='{} - {}%'.format(cls_name, scores[obs]))

        return live_image

        
    def push_to_cloud(self, image_to_send, detected_count, product_type, uri):
        try:
            #logger.info('Entering into push_to_cloud block...')
            index = 0
            timestamp = int(time.time())
            now = datetime.now()
            
            if product_type == 'snacks':
                key = "frames_snacks/booth_{}_{}_{}_{}_{}_{}.jpg".format(now.month, now.day,
                                                   now.hour, now.minute,
                                                   timestamp, index)
            else:
                key = "frames_beverages/booth_{}_{}_{}_{}_{}_{}.jpg".format(now.month, now.day,
                                                   now.hour, now.minute,
                                                   timestamp, index)
                
            jpg_data = cv2.imencode('.jpg', image_to_send)[1].tostring()

            # Writing predection frame to S3
            response = s3.put_object(ACL='private',
                                    Body=jpg_data,
                                    Bucket=self.s3_bucket,
                                    Key=key,
                                    ContentType='image/JPG')

            #Sending S3 metadata to SQS
            if response['ResponseMetadata']['HTTPStatusCode'] == 200:
                # dd/mm/YY H:M:S
                dt_string = now.strftime("%Y-%m-%d %H:%M:%S")

                data = {
                        "ProductType": product_type,
                        "StockCount": detected_count,
                        "TimeStamp": dt_string,
                        "S3Uri": 's3://' + self.s3_bucket +'/' + key
                        }
                
                logger.info('data: {}'.format(data))
                
                res = sqs.send_message(
                    QueueUrl=self.sqs_url,
                    MessageBody=json.dumps(data),
                    MessageGroupId='BottleCounterGroup'
                    )                
            else:
                logger.info('Unable to write {} to S3 bucket: {}'.format (key, bucket))

            return True

        except Exception as e:
            logger.info("Exception: {}".format(e))
            return False

    def store_planogram_frame(self, frame, camera_id, suffix="live"):
        try:
            #logger.info('Entering into push_to_cloud block...')
            index = 0
            timestamp = int(time.time())
            now = datetime.now()
            key = "frames_planogram/booth_{}_{}_{}_{}_{}_{}_{}.jpg".format(now.month, now.day,
                                                   now.hour, now.minute,
                                                   timestamp, index, suffix)

            # Writing planogram frames to S3
            jpg_data = cv2.imencode('.jpg', frame)[1].tobytes()
            response = s3.put_object(ACL='private',
                                    Body=jpg_data,
                                    Bucket=self.s3_bucket,
                                    Key=key,
                                    ContentType='image/JPG')
            
            logger.info("Storing planogram {} frame in S3 as: {}".format(suffix, key))
            return key
        except ClientError:
            logger.exception("Couldn't store frame")
        except AttributeError:
            logger.exception("S3 client is not available.")


def preprocess(img, size):
    """Resizes and normalizes a frame of video."""
    resized = cv2.resize(img, (size, size))
    mean = [0.485, 0.456, 0.406]  # RGB
    std = [0.229, 0.224, 0.225]  # RGB
    img = resized.astype(np.float32) / 255.  # converting array of ints to floats
    r, g, b = cv2.split(img) 
    # normalizing per channel data:
    r = (r - mean[0]) / std[0]
    g = (g - mean[1]) / std[1]
    b = (b - mean[2]) / std[2]
    # putting the 3 channels back together:
    x1 = [[[], [], []]]
    x1[0][0] = r
    x1[0][1] = g
    x1[0][2] = b
    return np.asarray(x1)

def get_logger(name=__name__,level=logging.INFO):
    logger = logging.getLogger(name)
    logger.setLevel(level)
    handler = RotatingFileHandler("/opt/aws/panorama/logs/app.log", maxBytes=100000000, backupCount=2)
    formatter = logging.Formatter(fmt='%(asctime)s %(levelname)-8s %(message)s',
                                    datefmt='%Y-%m-%d %H:%M:%S')
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    return logger

def put_bbox(img, bbox, color=(255, 0, 0), text=None, thickness=2, font=cv2.FONT_HERSHEY_SIMPLEX, fontScale=0.8):
    h, w, _ = img.shape
    x1, y1, x2, y2 = bbox
    start_point = (int(x1 * w), int(y1 * h))
    end_point = (int(x2 * w), int(y2 * h))
    cv2.rectangle(
        img,
        start_point,
        end_point,
        color,
        thickness)
    if text:
        #org = (int(x1 * w), int(y2 * h))
        org = (start_point[0]+10, start_point[1]+30)
        #logger.info('h {}, w {}, x1 {}, y1 {}, x2 {}, y2 {}, org_x org_y {}, text {}'.format(h, w, x1, y1, x2, y2, org, text))
        cv2.putText(img, text, org, font, fontScale, color, thickness, cv2.LINE_AA)

def get_bbox_centre(bbox):
    x_min, y_min, x_max, y_max = bbox
    width = x_max - x_min
    height = y_max - y_min
    return (x_min + width/2, y_min + height/2)

def main():
    try:
        logger.info("INITIALIZING APPLICATION")
        app = Application()
        logger.info("PROCESSING STREAMS")
        while True:
            app.process_streams()
    except:
        logger.exception('Exception during processing loop.')

logger = get_logger(level=logging.INFO)
main()
