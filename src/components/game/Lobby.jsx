import * as firebase from "firebase/app";
import React, { Component } from "react";
import { connect } from "react-redux";
import { Box, Form, FormField, Button, DropButton } from "grommet";
import { Redirect } from "react-router-dom";
import { geoDb } from "../../firebase";
import Rules from "./Rules";

let DBGetMatches = null;

class Lobby extends Component {
  state = {
    password: "",
    redirect: false,
    matches: false,
    matchId: false
  };

  componentDidMount() {
    navigator.geolocation.getCurrentPosition((position) => {
      console.log('got position', position)
      if (this.props.user.UID && position) {
        this.setState({ position })
        this.getMatches(this.props.user.UID, position);
      }
    });

  }

  componentWillUnmount() {
    // cancel get matches
    DBGetMatches && DBGetMatches();
    DBGetMatches = null;
  }

  getMatches = (userId, pos) => {

    const radius = 1

    const query = geoDb.collection("matches").near({
      center: new firebase.firestore.GeoPoint(pos.coords.latitude, pos.coords.longitude),
      radius
    });


    DBGetMatches = query.onSnapshot(snapshot => {
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
      console.log("matches within 1km ", matches)
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
        coordinates: new firebase.firestore.GeoPoint(this.state.position.coords.latitude, this.state.position.coords.longitude)
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
            sonar: false,
            coordinates: new firebase.firestore.GeoPoint(this.state.position.coords.latitude, this.state.position.coords.longitude)
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
        sonar: false,
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
          
          {this.state.position && (
            <>
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
                {matches.length >= 1 ? <h1>Join a game</h1> : <p>No other games within 1km</p>}
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
            </>
          )}
        </Box>
      );
    }
  }
}

const mapStateToProps = ({ user }) => ({
  user
});

export default connect(mapStateToProps)(Lobby);
