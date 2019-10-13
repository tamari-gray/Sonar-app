import React, { Component } from "react";
import { Box, Button } from "grommet";
import { connect } from "react-redux";
import { getUser, logoutUser } from "../actions/user";
import { Link, Redirect } from "react-router-dom";
import routes from "../routes";

class Profile extends Component {
  state = {
    redirect: false
  };

  componentDidMount() {
    if (this.props.user) {
      this.props.dispatch(getUser(this.props.user.UID));
    } else {
      this.setState({ redirect: true });
    }
  }

  logout = () => {
    this.props.dispatch(logoutUser());
  };

  render() {
    if (this.props.user) {
      return (
        <Box
          justify="center"
          align="center"
          style={{ paddingLeft: "1em", paddingRight: "1em" }}
        >
          <h1> {`Welcome ${this.props.user.username}`} </h1>
          <Box
            round="small"
            border={{ color: "brand", size: "large" }}
            pad="medium"
            style={{ paddingLeft: "1em", paddingRight: "1em" }}
          >
            <div>
              <h2>How to play</h2>
              <p>
                Its hide and go seek!.. <br />
                Choose your class and use your abilities to survive from the
                tagger for 10 minutes to win!
              </p>
            </div>
            <p>
              <span style={{ fontWeight: "bold" }}>Tagger: </span> <br /> Can
              use a sonar to see everyones latest position. <br />
              TAG ANYONE WITHIN 15m of you
            </p>
            <p>
              {" "}
              <span style={{ fontWeight: "bold" }}>Defuser: </span> <br /> Can
              cancel 5 sonars per game
            </p>
            <p>
              {" "}
              <span style={{ fontWeight: "bold" }}>Snitch: </span> <br /> Can
              give other players position away to tagger 3 times per game{" "}
            </p>
            <p>
              {" "}
              <span style={{ fontWeight: "bold" }}>Joker: </span> <br /> Can
              give away a fake position for up to 90 seconds. can use it 2 times
              per game{" "}
            </p>
            <Button as={Link} to="/lobby" primary label="play" />
          </Box>
          <Box justify="end">
            <Button
              style={{ margin: "1em" }}
              secondary
              onClick={this.logout}
              label="logout"
            />
          </Box>
        </Box>
      );
    } else {
      return <Redirect to={routes.HOME} />;
    }
  }
}
const mapStateToProps = ({ user }) => ({
  user
});

export default connect(mapStateToProps)(Profile);
