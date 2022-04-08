/* eslint-disable react/react-in-jsx-scope */
import { Paper } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";

function Header() {
  return (
    <Grid item xs={8}>
      <Paper style={{ margin: 10 }}>
        <Typography variant="h4" style={{ textAlign: "center" }}>
          The Store of the Future - {" "}
          <span style={{ color: "#FF9900" }}>Retail Inventory Monitoring</span>
        </Typography>
      </Paper>
    </Grid>
  );
}

export default Header;
