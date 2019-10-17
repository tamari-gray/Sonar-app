import React, { Component } from "react";
import { connect } from "react-redux";
import { Link, Redirect } from "react-router-dom";
import { Box, Text, Button, Heading } from "grommet";
import { Attraction, Car } from "grommet-icons";
import { geoDb } from "../../firebase";

class ClassSelect extends Component {
  state = {
    redirect: false,
    classes: [
      {
        name: "Joker",
        description:
          "Can give away a fake position for up to 90 seconds. can use it 2 times per game"
      },
      {
        name: "Snitch",
        description:
          "Can give other players position away to tagger 3 times per game"
      },
      {
        name: "Defuser",
        description: "Can cancel 5 sonars per game"
      }
    ]
  };

  componentDidMount = () => {
    // check if player has already chosen class
    geoDb
      .collection("matches")
      .doc(this.props.matchId)
      .collection("players")
      .doc(this.props.user.UID)
      .get()
      .then(doc => {
        if (doc.data().playerQuirk) {
          this.setState({
            redirect: true
          });
        }
      });
  };

  selectClass = selectedClass => {
    let player = {};
    if (selectedClass === "Defuser") {
      player = {
        playerQuirk: selectedClass,
        abilityUse: 5
      };
    } else if (selectedClass === "Joker") {
      player = {
        playerQuirk: selectedClass,
        abilityUse: 2
      };
    } else if (selectedClass === "Snitch") {
      player = {
        playerQuirk: selectedClass,
        abilityUse: 3
      };
    }
    geoDb
      .collection("matches")
      .doc(this.props.matchId)
      .collection("players")
      .doc(this.props.user.UID)
      .update(player)
      .then(() => {
        this.setState({ redirect: true });
        console.log("updated user class");
      })
      .catch(error => `error updating user class, ${error}`);
  };

  render() {
    if (this.state.redirect) {
      return <Redirect to={`/game/${this.props.matchId}`} />;
    } else {
      return (
        <Box
          direction="column"
          justify="center"
          align="center"
          pad="xlarge"
          gap="medium"
        >
          <Heading>Choose your class</Heading>
          <Box pad="large" align="center" background="dark-2" round gap="small">
            <Car size="large" color="light-2" />
            <Text>Tagger</Text>
            <Text size="small">
              Tag anyone within 20m of you. You have the power to send a sonar
              which shows everyones latest position. If you tag everyone within
              10 minutes you win!
            </Text>
          </Box>
          {this.state.classes.map(type => {
            return (
              <Box
                pad="large"
                align="center"
                background={{ color: "light-2", opacity: "strong" }}
                round
                gap="small"
                key={type.name}
              >
                <Attraction size="large" />
                <Text>{type.name}</Text>
                <Text size="small">{type.description}</Text>
                <Button
                  onClick={() => this.selectClass(type.name)}
                  primary
                  label="Select"
                />
              </Box>
            );
          })}
        </Box>
      );
    }
  }
}

const mapStateToProps = ({ user }) => ({
  user
});

export default connect(mapStateToProps)(ClassSelect);
