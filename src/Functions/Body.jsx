/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/prop-types */
/* eslint-disable react/react-in-jsx-scope */
/*import Grid from "@material-ui/core/Grid";*/
/*import Paper from "@material-ui/core/Paper";*/
/*import Typography from "@material-ui/core/Typography";*/
/*import { makeStyles } from "@material-ui/core/styles";*/
import React, { useEffect, useState, useRef } from "react";
import Typography from "@material-ui/core/Typography";

import Amplify, { API, graphqlOperation } from "aws-amplify";
import awsconfig from "../aws-exports";
import { onUpdateShelfMonitor } from "../graphql/subscriptions";
/*import { Container } from "@material-ui/core";*/

import lays from "../static/media/lays.png";
import kinder from "../static/media/kinder.png";
import mm from "../static/media/mm.png";
import sticker from "../static/media/sticker.png";
import pen from "../static/media/pen.png";
import coke from "../static/media/coke.png";
import h2o from "../static/media/h2o.png";

Amplify.configure(awsconfig);

/*const useStyles = makeStyles(() => ({
  image: {
    width: "100%",
    height: "100%",
    margin: "auto",
  },
}));*/

function Body() {
  /*const classes = useStyles();*/

  const initialState = {
    s3UriKinder: "./default.png",
    s3UriCoke: "./default.png",
    count: "",
  };

  const prevcountLays = useRef();
  const prevcountKinder = useRef();
  const prevcountMM = useRef();
  const prevcountSticker = useRef();
  const prevcountPen = useRef();
  const prevs3UriSnacks = useRef();
  const prevs3UriBeverages = useRef();
  const prevcountCoke = useRef();
  const prevcountH2O = useRef();

  const [shelf, setShelf] = useState(initialState);
  
  useEffect((shelf) => {
    const subscriptionSnacks = API.graphql(
      graphqlOperation(onUpdateShelfMonitor),
    ).subscribe({
      next: (eventData) => {
        const dataSnacks = eventData.value.data.onUpdateShelfMonitor;
        console.log(dataSnacks);
        if (dataSnacks.s3Uri === null) {
            console.log("null");
        }
        if (dataSnacks.Product === "snacks" & dataSnacks.ProductType === "lays") {
          setShelf({
            ...shelf,
            s3UriSnacks: dataSnacks.s3Uri,
            countLays: dataSnacks.count,
            countKinder: prevcountKinder.current,
            countMM: prevcountMM.current,
            countSticker: prevcountSticker.current,
            countPen: prevcountPen.current,
            s3UriBeverages: prevs3UriBeverages.current,
            countCoke: prevcountCoke.current,
            countH2O: prevcountH2O.current,
          });
          prevcountLays.current = dataSnacks.count;
          prevs3UriSnacks.current = dataSnacks.s3Uri;
        }
        if (dataSnacks.Product === "snacks" & dataSnacks.ProductType === "kinder") {
          setShelf({
            ...shelf,
            s3UriSnacks: dataSnacks.s3Uri,
            countLays: prevcountLays.current,
            countKinder: dataSnacks.count,
            countMM: prevcountMM.current,
            countSticker: prevcountSticker.current,
            countPen: prevcountPen.current,
            s3UriBeverages: prevs3UriBeverages.current,
            countCoke: prevcountCoke.current,
            countH2O: prevcountH2O.current,
          });
          prevcountKinder.current = dataSnacks.count;
          prevs3UriSnacks.current = dataSnacks.s3Uri;
        }
        if (dataSnacks.Product === "snacks" & dataSnacks.ProductType === "mm") {
          setShelf({
            ...shelf,
            s3UriSnacks: dataSnacks.s3Uri,
            countLays: prevcountLays.count,
            countKinder: prevcountKinder.current,
            countMM: dataSnacks.count,
            countSticker: prevcountSticker.current,
            countPen: prevcountPen.current,
            s3UriBeverages: prevs3UriBeverages.current,
            countCoke: prevcountCoke.current,
            countH2O: prevcountH2O.current,
          });
          prevcountMM.current = dataSnacks.count;
          prevs3UriSnacks.current = dataSnacks.s3Uri;
        }
        if (dataSnacks.Product === "snacks" & dataSnacks.ProductType === "sticker") {
          setShelf({
            ...shelf,
            s3UriSnacks: dataSnacks.s3Uri,
            countLays: prevcountLays.current,
            countKinder: prevcountKinder.current,
            countMM: prevcountMM.current,
            countSticker: dataSnacks.count,
            countPen: prevcountPen.current,
            s3UriBeverages: prevs3UriBeverages.current,
            countCoke: prevcountCoke.current,
            countH2O: prevcountH2O.current,
          });
          prevcountSticker.current = dataSnacks.count;
          prevs3UriSnacks.current = dataSnacks.s3Uri;
        }
        if (dataSnacks.Product === "snacks" & dataSnacks.ProductType === "pen") {
          setShelf({
            ...shelf,
            s3UriSnacks: dataSnacks.s3Uri,
            countLays: prevcountLays.current,
            countKinder: prevcountKinder.current,
            countMM: prevcountMM.current,
            countSticker: prevcountSticker.current,
            countPen: dataSnacks.count,
            s3UriBeverages: prevs3UriBeverages.current,
            countCoke: prevcountCoke.current,
            countH2O: prevcountH2O.current,
          });
          prevcountPen.current = dataSnacks.count;
          prevs3UriSnacks.current = dataSnacks.s3Uri;
        }
        if (dataSnacks.Product === "beverages" & dataSnacks.ProductType === "coke") {
          setShelf({
            ...shelf,
            s3UriBeverages: dataSnacks.s3Uri,
            countLays: dataSnacks.count,
            countKinder: prevcountKinder.current,
            countMM: prevcountMM.current,
            countSticker: prevcountSticker.current,
            countPen: prevcountPen.current,
            s3UriSnacks: prevs3UriSnacks.current,
            countCoke: dataSnacks.count,
            countH2O: prevcountH2O.current,
          });
          prevcountCoke.current = dataSnacks.count;
          prevs3UriBeverages.current = dataSnacks.s3Uri;
        }
        if (dataSnacks.Product === "beverages" & dataSnacks.ProductType === "h2o") {
          setShelf({
            ...shelf,
            s3UriBeverages: dataSnacks.s3Uri,
            countLays: prevcountLays.current,
            countKinder: prevcountKinder.current,
            countMM: prevcountMM.current,
            countSticker: prevcountSticker.current,
            countPen: prevcountPen.current,
            s3UriSnacks: prevs3UriSnacks.current,
            countCoke: prevcountCoke.current,
            countH2O: dataSnacks.count,
          });
          prevcountH2O.current = dataSnacks.count;
          prevs3UriBeverages.current = dataSnacks.s3Uri;
        }

      },
    });
    return () => subscriptionSnacks.unsubscribe();
  }, []);

  return (

    <div class="float-container">

        <div class="float-child">
          <Typography variant="h6" style={{ textAlign: "center", padding: 2, color: "white", fontWeight: "bold" }}>
            Shelf Products Monitoring
          </Typography>
          <img src={shelf.s3UriSnacks} alt="Detections"  width="100%"/>
          <Typography variant="h6" style={{ textAlign: "center", padding: 2, color: "white", fontWeight: "bold"  }}>
            Beverages Monitoring
          </Typography>
          <img src={shelf.s3UriBeverages} alt="Detections" width="70%"/>        
        </div>

        <div class="float-child">
          <Typography variant="h6" style={{ textAlign: "center", padding: 2, color: "white", fontWeight: "bold"  }}>
            Real-time Inventory
          </Typography>
          <table class="styled-table">
            <thead>
                <tr>
                    <th></th>
                    <th>Product</th>
                    <th>Inventory Count</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td width="40%"><img src={lays} alt="Lays"  width="30%"/></td>
                    <td>Fries (Lays)</td>
                    <td>{shelf.countLays}</td>
                </tr>
                <tr> {/* class="active-row" */}
                    <td><img src={kinder} alt="Kinder"  width="30%"/></td>
                    <td>Kinder bar</td>
                    <td>{shelf.countKinder}</td>
                </tr>
                <tr>
                    <td><img src={mm} alt="M&M"  width="30%"/></td>
                    <td>M&Ms</td>
                    <td>{shelf.countMM}</td>
                </tr>
                <tr>
                    <td><img src={sticker} alt="Stickers"  width="30%"/></td>
                    <td>Stickers</td>
                    <td>{shelf.countSticker}</td>
                </tr>
                <tr>
                    <td><img src={pen} alt="Pens"  width="30%"/></td>
                    <td>Pen</td>
                    <td>{shelf.countPen}</td>
                </tr>
                <tr>
                    <td><img src={coke} alt="Coke"  width="30%"/></td>
                    <td>Coke</td>
                    <td>{shelf.countCoke}</td>
                </tr>
                <tr>
                    <td><img src={h2o} alt="H2O"  width="30%"/></td>
                    <td>H2O</td>
                    <td>{shelf.countH2O}</td>
                </tr>
            </tbody>
          </table>
        </div>
    </div>

          );
}

export default Body;
