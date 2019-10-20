import * as firebase from "firebase/app";
import React, { Component } from "react";
import { connect } from "react-redux";
import { Box, Form, FormField, Button } from "grommet";
import { Redirect } from "react-router-dom";
import { geoDb } from "../../firebase";
import Rules from "./Rules";

let DBGetMatches = null;

class Lobby extends Component {
  state = {
    password: "",
    redirect: false,
    matches: [],
    matchId: false
  };

  componentDidMount() {
    if (this.props.user.UID) {
      this.getMatches(this.props.user.UID);
    }
  }

  componentWillUnmount() {
    // cancel get matches
    DBGetMatches();
    DBGetMatches = null;
  }

  getMatches = userId => {
    DBGetMatches = geoDb.collection("matches").onSnapshot(snapshot => {
      const matches = [];
      snapshot.forEach(doc => {
        const players = [];
        geoDb
          .collection("matches")
          .doc(doc.id)
          .collection("players")
          .get()
          .then(querySnap => {
            querySnap.forEach(snap => {
              // check if user has already joined a match
              if (snap.data().id === userId) {
                this.setState({ matchId: doc.id });
              }
              players.push(snap.data());
            });
          });
        if (!doc.data().playing) {
          matches.push({
            matchId: doc.id,
            admin: doc.data().admin,
            players
          });
        }
      });
      this.setState({ matches });
    });
  };

  createMatch = (userId, username) => {
    geoDb
      .collection("matches")
      .add({
        admin: { id: userId, name: username },
        password: this.state.password,
        waiting: true,
        playing: false,
        initialising: false,
        coordinates: new firebase.firestore.GeoPoint(0, 0)
      })
      .then(docRef => {
        geoDb
          .collection("matches")
          .doc(docRef.id)
          .collection("players")
          .doc(this.props.user.UID)
          .set({
            id: userId,
            name: username,
            tagged: false,
            coordinates: new firebase.firestore.GeoPoint(0, 0)
          })
          .then(() => this.setState({ matchId: docRef.id }))
          .catch(e => console.log(`Error adding ${username} to match. ${e}`));
      })
      .catch(e =>
        console.error(`Error setting ${username} as admin of match. ${e}`)
      );
  };

  joinMatch = (matchId, userId, username) => {
    geoDb
      .collection("matches")
      .doc(matchId)
      .collection("players")
      .doc(this.props.user.UID)
      .set({
        id: userId,
        name: username,
        tagged: false,
        coordinates: new firebase.firestore.GeoPoint(0, 0)
      })
      .then(() => this.setState({ matchId }))
      .catch(e => console.log(`Error joining match. ${e}`));
  };

  handleInput = e => this.setState({ [e.target.name]: e.target.value });

  handleSubmit = e => {
    e.preventDefault();
    this.createMatch(this.props.user.UID, this.props.user.username);
  };

  render() {
    const {
      user: { UID, username }
    } = this.props;
    const { matches, matchId } = this.state;

    if (matchId) {
      return <Redirect to={`game/${matchId}`} />;
    } else {
      return (
        <Box
          direction="column"
          justify="center"
          align="center"
          pad="small"
          gap="medium"
        >
          <h1>How to play</h1>
          <Rules />
          <h1>Create a game</h1>
          <Box
            pad="medium"
            border={{ color: "brand", size: "large" }}
            elevation="medium"
            round="large"
            width="medium"
            align="center"
          >
            <Form
              style={{ margin: "1.5em 1.5em 0 1.5em " }}
              onSubmit={this.handleSubmit}
            >
              <FormField
                type="password"
                name="password"
                label="password"
                onChange={this.handleInput}
              />
              <Button type="submit" primary label="Create game" />
            </Form>
          </Box>
          <Box width="medium" align="center">
            {matches && <h1>Join a game</h1>}
            {matches &&
              matches.map(game => {
                return (
                  <Box
                    key={game.matchId}
                    pad="small"
                    border={{ color: "primary", size: "large" }}
                    elevation="small"
                    round="large"
                    width="medium"
                    align="center"
                    direction="row-responsive"
                    style={{ marginTop: "1.5em" }}
                  >
                    <h3 style={{ margin: "auto" }}>
                      {"created by " + game.admin.name} <br />
                    </h3>
                    <Button
                      onClick={() =>
                        this.joinMatch(game.matchId, UID, username)
                      }
                      primary
                      label="Join"
                    />
                  </Box>
                );
              })}
          </Box>
        </Box>
      );
    }
  }
}

const mapStateToProps = ({ user }) => ({
  user
});

export default connect(mapStateToProps)(Lobby);
