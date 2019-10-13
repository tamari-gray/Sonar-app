import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import routes from "../../routes";
import { Box } from "grommet";
import { db, geo } from "../../firebase";
import { Button } from "grommet";

export class FinishedGame extends Component {
  state = {
    winners: []
  };

  getWinners = () => {
    // connect to firebase
    // db.collection(this.props.matchId)
    // check if everyone was tagged
    // tagger = winner
  };
  render() {
    return (
      <Box>
        finished! <br />
        <Button as={Link} to="/profile" primary label="go home" />
      </Box>
    );
  }
}

const mapStateToProps = state => ({});

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FinishedGame);
