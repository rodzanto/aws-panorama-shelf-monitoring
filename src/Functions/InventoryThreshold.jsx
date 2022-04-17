/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/prop-types */
/* eslint-disable no-console */
import React, { useEffect } from "react";
/*import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import Typography from "@material-ui/core/Typography";*/
/*import { makeStyles } from "@material-ui/core/styles";*/
/*import { Box, InputLabel } from "@material-ui/core";*/
import Amplify, { API, graphqlOperation } from "aws-amplify";
import awsconfig from "../aws-exports";
import { getShelfMonitor } from "../graphql/queries";
import { updateShelfMonitor, createShelfMonitor } from "../graphql/mutations";

Amplify.configure(awsconfig);

/*const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 140,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));*/

function InventoryThreshold() {
  /*const classes = useStyles();*/
  const productType = "lays";
  const product = "snacks";

  /*const [thresholdState, setThreshold] = React.useState({ threshold: "" });*/

  async function getThreshold() {
    try {
      const threshold = await API.graphql(
        graphqlOperation(getShelfMonitor, {
          ProductType: productType,
          Product: product
        }),
      );
      if (threshold.data.getShelfMonitor == null) {
        setThreshold({ threshold: "" });
        return;
      }

      const thresholdResult = threshold.data.getShelfMonitor.Threshold;
      console.log("current threshold: ", thresholdResult);
      setThreshold({ threshold: thresholdResult });
    } catch (err) {
      console.log("error fetching data: ", err);
    }
  }

  async function putThreshold(threshold) {
    console.log(threshold);
    try {
      await API.graphql(
        graphqlOperation(updateShelfMonitor, {
          input: {
            ProductType: productType,
            Product: product,
            Threshold: threshold,
            s3Uri: "./default.png",
            count: 9000,
          },
        }),
      );
    } catch (err) {
      if (
        err.errors[0].errorType === "DynamoDB:ConditionalCheckFailedException"
      ) {
        await API.graphql(
          graphqlOperation(createShelfMonitor, {
            input: {
              ProductType: productType,
              Product: product,
              Threshold: threshold,
            },
          }),
        );
      } else {
        console.log(err);
      }
    }
  }

  useEffect(() => {
    getThreshold();
  }, []);

  const handleChange = (event) => {
    setThreshold({ threshold: event.target.value });

    putThreshold(event.target.value);
  };

  return (
    <div>
{/*
      <Typography variant="h6" style={{ textAlign: "center", padding: 5 }}>
        Inventory threshold
      </Typography>
      <Box display="flex" justifyContent="center">
        <FormControl className={classes.formControl}>
          <InputLabel style={{ fontSize: 18, color: "#FF9900" }}>
            <em>Alert Threshold</em>
          </InputLabel>
          <Select id="select-threshold" value={thresholdState.threshold} onChange={handleChange}>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <MenuItem value={num}>Threshold: {num}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
            */}
    </div>
  );

}

export default InventoryThreshold;
