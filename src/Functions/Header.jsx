/* eslint-disable react/react-in-jsx-scope */
import { Paper } from "@material-ui/core";
/*import Grid from "@material-ui/core/Grid";*/
import Typography from "@material-ui/core/Typography";
import logo from "../static/media/aws.png";

function Header() {
  return (
    <div>
      <div>
        <img src={logo} alt="AWS" style={{ width: "10%", position: "relative", left: "-100px", top: "60px", padding: "10px, 10px"}}/>
      </div>
      <div>
        <Paper style={{ margin: 10, width: "600px", backgroundColor: "white"}}>
          <Typography variant="h3" style={{ fontWeight: 600, textAlign: "center", color: "black"}}>
          The Store of the Future
          </Typography>
        </Paper>
        <p></p>
      </div>
    </div>
  );
}

export default Header;
