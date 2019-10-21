import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { Box, Button, Heading } from "grommet";
import { db } from "../../firebase";

class FinishedGame extends Component {
  state = {};

  componentDidMount = () => {
    this.getWinners();
  };

  getWinners = () => {
    // connect to firebase
    db.collection("finishedMatches")
      .doc(this.props.matchId)
      .get()
      .then(doc => {
        if (doc.data().winner) {
          this.setState({
            winner: doc.data().winner
          });

          // increment winners wins
          if (doc.data().winner.id === this.props.user.UID) {
            this.updateWinTotal();
          }
        } else if (doc.data().draw) {
          this.setState({
            draw: doc.data().draw
          });

          const Iwon = doc.data().draw.find(p => p.id === this.props.user.UID);

          if (Iwon) this.updateWinTotal();
        }
      });
  };

  updateWinTotal = () => {
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
  };
  render() {
    const { winner, draw } = this.state;
    return (
      <Box>
        {winner && (
          <Box
            justify="center"
            align="center"
            style={{ paddingLeft: "1em", paddingRight: "1em" }}
          >
            {winner && <Heading>{winner.name} won!</Heading>}
            {draw && (
              <div>
                <Heading>Its a draw!</Heading>
                {draw.map(p => {
                  return <Heading>{p.name} won!</Heading>;
                })}
              </div>
            )}
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
