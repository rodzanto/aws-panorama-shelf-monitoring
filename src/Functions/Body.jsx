/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/prop-types */
/* eslint-disable react/react-in-jsx-scope */
/*import Grid from "@material-ui/core/Grid";*/
/*import Paper from "@material-ui/core/Paper";*/
/*import Typography from "@material-ui/core/Typography";*/
/*import { makeStyles } from "@material-ui/core/styles";*/
import React, { useLayoutEffect, useState, useRef } from "react";
import Typography from "@material-ui/core/Typography";
import Card from "../Card"

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
  
  useLayoutEffect((shelf) => {
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
            countLays: prevcountLays.current,
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
            countLays: prevcountLays.current,
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
          <Typography variant="h5" style={{ textAlign: "center", padding: 2, color: "white", fontWeight: "bold" }}>
            Shelf Products Monitoring
          </Typography>
          <p></p>
          <div class="selected">
            <img src={shelf.s3UriSnacks} alt="Detections"  width="90%"/>
          </div>
          <p></p>
          <Typography variant="h5" style={{ textAlign: "center", padding: 2, color: "white", fontWeight: "bold"  }}>
            Beverages Monitoring
          </Typography>
          <p></p>
          <img src={shelf.s3UriBeverages} alt="Detections" width="40%"/>    
        </div>

        <div class="float-child">
          <Typography variant="h5" style={{ textAlign: "center", padding: 2, color: "white", fontWeight: "bold"  }}>
            Real-time Inventory
          </Typography>
          <p></p>
          <Card image={lays} title="Fries (Lays)" count={shelf.countLays}></Card>
          <Card image={kinder} title="Kinder Bar" count={shelf.countKinder}></Card>
          <Card image={mm} title="M&Ms" count={shelf.countMM}></Card>
          <Card image={sticker} title="Stickers" count={shelf.countSticker}></Card>
          <Card image={pen} title="Pens" count={shelf.countPen}></Card>
          <Card image={coke} title="Coke" count={shelf.countCoke}></Card>
          <Card image={h2o} title="Water" count={shelf.countH2O}></Card>
          <p></p>
        </div>
    </div>

          );
}

export default Body;
