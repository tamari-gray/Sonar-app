import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { Box, Button } from "grommet";
import { db } from "../../firebase";

class FinishedGame extends Component {
  state = {};

  componentDidMount = () => {
    this.getWinners();
  };

  getWinners = () => {
    // connect to firebase
    const username = this.props.user.username;
    db.collection("finishedMatches")
      .doc(this.props.matchId)
      .get()
      .then(doc => {
        if (doc.data().winners) {
          this.setState({
            winners: doc.data().winners
          });
          const userWon = doc
            .data()
            .winners.find(winner => winner === username);

          if (userWon) {
            let playerWins = 0;
            db.collection("users")
              .doc(this.props.user.UID)
              .get()
              .then(doc => {
                if (doc.data().wins) {
                  playerWins = doc.data().wins;
                }
              })
              .then(() => {
                db.collection("users")
                  .doc(this.props.user.UID)
                  .update({
                    wins: playerWins + 1
                  })
                  .then(function() {
                    console.log("updated user stats");
                  })
                  .catch(function(error) {
                    // The document probably doesn't exist.
                    console.error("Error updating user stats ", error);
                  });
              });
          }
        }
      });
  };
  render() {
    const { winners } = this.state;
    return (
      <Box>
        {winners && (
          <Box
            justify="center"
            align="center"
            style={{ paddingLeft: "1em", paddingRight: "1em" }}
          >
            <h1>Winners: </h1> <br />
            {winners.map(winner => {
              return <h3 key={winner}>{winner}</h3>;
            })}
          </Box>
        )}
        <Button as={Link} to="/profile" primary label="go home" />
      </Box>
    );
  }
}

const mapStateToProps = ({ user }) => ({
  user
});

export default connect(mapStateToProps)(FinishedGame);
