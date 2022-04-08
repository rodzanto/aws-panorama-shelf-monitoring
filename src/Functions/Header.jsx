/* eslint-disable react/react-in-jsx-scope */
import { Paper } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";

function Header() {
  return (
    <Grid item xs={4}>
      <Paper style={{ margin: 10, backgroundColor: "#ee6002"}}>
        <Typography variant="h4" style={{ textAlign: "center", color: "white"}}>
          The Store of the Future
        </Typography>
      </Paper>
    </Grid>
  );
}

export default Header;
