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
          {this.props.user.wins && <p>games won: {this.props.user.wins}</p>}
          {!this.props.user.wins && <p>go win some games!</p>}

          <Button as={Link} to="/lobby" primary label="play" />

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
