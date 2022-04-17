/* eslint-disable react/react-in-jsx-scope */
// import logo from './logo.svg';
import "./App.css";
import "./Body.css";

import "@fontsource/roboto";
// import { Button, Input, FormControl, Select, MenuItem, Link } from '@material-ui/core';
// import { withStyles, lighten } from "@material-ui/core/styles";

import Grid from "@material-ui/core/Grid";
// import GridList from '@material-ui/core/GridList';
// import GridListTile from '@material-ui/core/GridListTile';
// import LinearProgress from '@material-ui/core/LinearProgress';

import { Header, Body, /*InventoryThreshold*/ } from "./Functions";


function App() {
  return (
    <div>
      <Grid container justify="center" alignItems="stretch" spacing={3} xs={12}>
        <Header />
        <Body />
        {/*<InventoryThreshold />*/}
      </Grid>
      <h1>                   </h1>
    </div>
  );
}

export default App;
