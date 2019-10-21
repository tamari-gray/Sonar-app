import * as firebase from "firebase/app";
import React, { Component } from "react";
import { connect } from "react-redux";
import { Box, Button } from "grommet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { db, geoDb } from "../../firebase";
import routes from "../../routes";
import { Redirect } from "react-router-dom";

let map = null;
let thisUser = null;
let taggers = [];
let taggedPlayersMarkers = [];

// firebase listeners
let DBgetMatch = null;
let DBwatchAllPlayers = null;

//timers
let initTimerId = null;
let gameTimerId = null;

class InGame extends Component {
  state = {
    boundary: {
      lat: -39.637652, // mayfair primary location
      lng: 176.860973
    },
    position: null,
    zoom: 18,
    admin: false,
    initialising: false,
    players: null,
    userLocationFound: false,
    sonarTimer: 0,
    playing: false,
    initialisingTimer: 30,
    geolocationError: false,
    waiting: false,
    tagger: false,
    imTagger: false,
    allPlayersTagged: false,
    finished: false,
    gameTimer: false,
    abilityUsage: 0,
    abilityTimer: 0,
    quirk: false,
    abilityInUse: false,
    snitchingOn: [],
    remainingPlayers: []
  };
  componentDidMount() {
    if (this.props) {
      this.initMap();
      this.getMatch(); // toggle play btn
    }
  }
  putPlayersMarkersOnMap = players => {
    const markers = [];
    players.forEach(player => {
      const pos = [
        player.position.geopoint.latitude,
        player.position.geopoint.longitude
      ];
      const marker = L.circle(pos, {
        // set player marker to black
        color: "red",
        fillColor: "green",
        fillOpacity: 0.5,
        radius: 5
      })
        .addTo(map)
        .bindPopup(`you've tagged ${player.name}`)
        .openPopup();
      markers.push(marker);
    });
    let timer = 3;
    const intervalId = setInterval(() => {
      timer = timer - 1;
      if (timer === 0) {
        markers.forEach(marker => {
          map.removeLayer(marker);
        });
        clearInterval(intervalId);
      }
    }, 1000);
  };
  sendSonar = () => {
    // get all players from db ONCE
    geoDb
      .collection("matches")
      .doc(this.props.matchId)
      .collection("players")
      .where("tagger", "==", true)
      .get()
      .then(querySnapshot => {
        //remove prev sonar
        taggers.forEach(tagger => {
          map.removeLayer(tagger);
        });

        //put taggers on map
        const newTaggers = [];
        querySnapshot.forEach(doc => {
          let pos = [
            doc.data().coordinates.latitude,
            doc.data().coordinates.longitude
          ];
          const marker = L.circle(pos, {
            color: "green",
            fillColor: "green",
            fillOpacity: 0.5,
            radius: 2.5
          })
            .addTo(map)
            .bindPopup(doc.data().name)
            .openPopup();
          newTaggers.push(marker);
        });

        // set new taggers
        taggers = newTaggers;
      })
      .then(() => {
        // notify taggers i used sonar
        geoDb
          .collection("matches")
          .doc(this.props.matchId)
          .collection("players")
          .doc(this.props.user.UID)
          .update({
            sonar: false
          })
          .then(() => {
            console.log("set sonar to false to remove prev marker");
          })
          .then(() => {
            geoDb
              .collection("matches")
              .doc(this.props.matchId)
              .collection("players")
              .doc(this.props.user.UID)
              .update({
                sonar: true
              })
              .then(() => console.log("updated sonar usage"))
              .catch(e => console.log(`error updating sonar usage, ${e}`));
          })
          .then(() => console.log("updated sonar usage"))
          .catch(e => console.log(`error updating sonar usage, ${e}`));
      });
  };
  getMatch = () => {
    DBgetMatch = geoDb
      .collection("matches")
      .doc(this.props.matchId)
      .onSnapshot(doc => {
        // check if user is admin
        if (doc.data().admin.id === this.props.user.UID) {
          this.setState({ admin: doc.data().admin });
        }

        // check if game is in waiting phase
        if (doc.data().waiting === true) {
          this.setState({ waiting: true });
        } else if (doc.data().waiting === false) {
          this.setState({ waiting: false });
        }

        // check if game is initialising
        if (doc.data().initialising) {
          this.setState({ initialising: true });
          this.startInitialiseTimer();
        } else if (doc.data().initialising === false) {
          this.setState({ initialising: false });
        }

        // check if game is in play
        if (doc.data().playing) {
          clearInterval(initTimerId);
          this.setState({ playing: true });
          this.watchAllPlayers();
        } else if (doc.data().playing === false) {
          this.setState({ playing: false });
        }

        // check who le tagger is
        if (doc.data().tagger) {
          if (doc.data().tagger.id === this.props.user.UID) {
            this.setState({ imTagger: true, tagger: doc.data().tagger });
          } else {
            this.setState({ tagger: doc.data().tagger });
          }
        }

        // if game is finished
        if (doc.data().finished) {
          clearInterval(gameTimerId);
          if (this.state.admin) {
            this.deleteMatch();
          }
          this.setState({ finished: true });
        }

        console.log("match data", doc.data());
      });
  };
  deleteMatch = () => {
    geoDb
      .collection("matches")
      .doc(this.props.matchId)
      .delete()
      .then(() => {
        console.log("game successfully deleted!");
      })
      .catch(e => {
        console.error("Error removing match from db: ", e);
      });
  };
  startTimer = duration => {
    var timer = duration,
      minutes,
      seconds;
    gameTimerId = setInterval(() => {
      minutes = parseInt(timer / 60, 10);
      seconds = parseInt(timer % 60, 10);

      minutes = minutes < 10 ? "0" + minutes : minutes;
      seconds = seconds < 10 ? "0" + seconds : seconds;

      if (timer === 0) {
        clearInterval(gameTimerId);
        if (this.state.admin) {
          this.getSurvivors();
        }
      }

      let clock = minutes + ":" + seconds;
      this.setState({ gameTimer: clock });
      if (--timer < 0) {
      }
    }, 1000);
  };
  startInitialiseTimer = () => {
    let timer = 5;
    initTimerId = setInterval(() => {
      timer = timer - 1;
      this.setState({
        initialisingTimer: timer
      });
      if (timer === 0) {
        this.setState({
          initialisingTimer: 0
        });
        geoDb
          .collection("matches")
          .doc(this.props.matchId) // move to playing phase in firebase
          .update({ initialising: false, playing: true })
          .catch(e => console.log(`Error initialising game. ${e}`));
      }
    }, 1000);
  };
  initMap = () => {
    map = L.map("map", {
      zoom: 22,
      maxZoomLevel: 22,
      maxNativeZoom: 22,
      zoomControl: true
    })
      .fitWorld()
      .setView([this.state.boundary.lat, this.state.boundary.lng], 19);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      detectRetina: true,
      attribution:
        '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const boundary = L.circle(
      [this.state.boundary.lat, this.state.boundary.lng],
      {
        color: "blue",
        fillColor: "#f03",
        fillOpacity: 0.3,
        radius: 100
      }
    ).addTo(map);

    map.on("locationfound", e => {
      this.setState({ myPosition: e.latlng });
      // const point = geo.point(e.latlng.lat, e.latlng.lng)
      const pos = new firebase.firestore.GeoPoint(e.latlng.lat, e.latlng.lng);
      const matchId = this.props.matchId;
      if (thisUser === null && map !== null) {
        thisUser = L.circle(e.latlng, {
          // set player marker to black
          color: "black",
          fillColor: "#f03",
          fillOpacity: 0.5,
          radius: 5
        })
          .addTo(map)
          .bindPopup(this.props.user.username)
          .openPopup();
      } else if (thisUser) {
        let newLatLng = new L.LatLng(e.latlng.lat, e.latlng.lng);
        thisUser.setLatLng(newLatLng);
      }
      geoDb
        .collection("matches")
        .doc(matchId)
        .collection("players")
        .doc(this.props.user.UID)
        .update({
          // update users location in DB
          coordinates: pos
        })
        .catch(e => console.log("error adding user to db", e));
    });

    map.on("locationerror", e => {
      alert(`Please enable geolocation access to play game. 
      redirecting in 2 seconds`);
      setTimeout(() => {
        this.setState({
          geolocationError: true
        });
      }, 2500);
    });

    map.locate({ maxZoom: 22, watch: true, enableHighAccuracy: true });
  };
  chooseTagger = () => {
    let players = [];
    // choose tagger
    geoDb
      .collection("matches")
      .doc(this.props.matchId)
      .collection("players")
      .get()
      .then(querySnap => {
        querySnap.forEach(snap => {
          players.push({ id: snap.data().id, name: snap.data().name });
        });
      })
      .then(() => {
        const tagger = players[Math.floor(Math.random() * players.length)];
        geoDb
          .collection("matches")
          .doc(this.props.matchId)
          .update({ initialising: true, waiting: false, tagger })
          .catch(e => console.log(`Error choosing tagger. ${e}`));

        geoDb
          .collection("matches")
          .doc(this.props.matchId)
          .collection("players")
          .doc(tagger.id)
          .update({ tagger: true })
          .then(() => console.log(` set tagger. ${tagger.name}`))
          .catch(e => console.log(`Error choosing tagger. ${e}`));
      });
  };
  tagPlayer = () => {
    const center = new firebase.firestore.GeoPoint(
      this.state.myPosition.lat,
      this.state.myPosition.lng
    ); // this players pos

    const query = geoDb
      .collection("matches")
      .doc(this.props.matchId)
      .collection("players")
      .near({ center, radius: 2.5 });

    query.get().then(value => {
      //check if they are last players
      if (query.length === this.state.remainingPlayers.length) {
        db.collection("finishedMatches")
          .doc(this.props.matchId)
          .set({
            draw: query
          })
          .then(() => console.log("match drew"))
          .catch(e => console.log(`error when setting match draw ${e}`));
      } else {
        value.docs.forEach(player => {
          geoDb
            .collection("matches")
            .doc(this.props.matchId)
            .collection("players")
            .doc(player.id)
            .update({
              tagger: true
            });
        });
      }
    });
  };
  watchAllPlayers = () => {
    DBwatchAllPlayers = geoDb
      .collection("matches")
      .doc(this.props.matchId)
      .collection("players")
      .onSnapshot(querySnapshot => {
        const players = [];
        querySnapshot.forEach(doc => {
          players.push(doc.data());
        });

        //work out remaining players
        const remainingPlayers = players.filter(p => !p.tagger);
        this.setState({
          remainingPlayers
        });

        console.log("remaining", remainingPlayers);

        //watch: check when someone is tagged
        this.checkForPlayerTag(players);

        // watch: check if im tagged
        players.forEach(player => {
          if (player.id === this.props.user.UID) {
            if (player.tagger) {
              this.setState({ imTagger: true });
            }
          }
        });

        // watch: check for sonar use
        this.checkForSonars(players);

        //watch: check for winner
        this.checkForWinner(players);

        //watch: check if all players tagged
        this.checkIfAllPlayersAreTagged(players);
      });
  };
  checkForPlayerTag = players => {
    const filterOutOriginalTagger = players.filter(
      p => p.id !== this.state.tagger.id
    );
    const justTagged = filterOutOriginalTagger.filter(p => p.tagged);
    console.log("just tagged", justTagged);

    justTagged.forEach(p => {
      let pos = [p.coordinates.latitude, p.coordinates.longitude];
      const marker = L.circle(pos, {
        color: "orange",
        fillColor: "orange",
        fillOpacity: 0.5,
        radius: 2.5
      })
        .addTo(map)
        .bindPopup(`${p.name} was tagged`)
        .openPopup();
      setTimeout(() => {
        if (!this.state.finished) {
          console.log("removing just tagged player marker");
          map.removeLayer(marker);
        }
      }, 3000);
    });
  };
  checkForWinner = players => {
    const notTagged = players.filter(p => !p.tagger);

    if (notTagged.length === 1) {
      const winner = notTagged[0];
      console.log("winner:", winner);
      db.collection("finishedMatches")
        .doc(this.props.matchId)
        .set({
          winner
        })
        .then(() => console.log(`set winner ${winner.name}`))
        .catch(error => {
          console.log("Error setting winner", error);
        });
    }
  };
  checkForSonars = players => {
    let sonarActivePlayers = [];

    if (this.state.imTagger) {
      players.forEach(player => {
        if (player.sonar === true) {
          // add marker && add to sonarActivePlayers array ***************
          let pos = [player.coordinates.latitude, player.coordinates.longitude];
          const marker = L.circle(pos, {
            color: "green",
            fillColor: "green",
            fillOpacity: 0.5,
            radius: 2.5
          })
            .addTo(map)
            .bindPopup(`${player.name} used their sonar`)
            .openPopup();
          sonarActivePlayers.push({ id: player.id, marker: marker });
        } else if (player.sonar === false) {
          const oldSonar = sonarActivePlayers.find(p => p.id === player.id);
          if (oldSonar) {
            map.remove(oldSonar.marker);
            sonarActivePlayers = sonarActivePlayers.filter(p => p !== oldSonar);
          }
        }
      });
    }
  };
  checkIfAllPlayersAreTagged = players => {
    const allPlayersTaggged = players.every(player => player.tagger);

    if (allPlayersTaggged) {
      geoDb
        .collection("matches")
        .doc(this.props.matchId)
        .get()
        .then(doc => {
          if (doc.exists) {
            this.endGame();
          }
        });
    }
  };
  endGame = () => {
    geoDb
      .collection("matches")
      .doc(this.props.matchId)
      .update({
        initialising: false,
        waiting: false,
        playing: false,
        finished: true
      })
      .then(() => console.log("game finished"))
      .catch(error => {
        console.log("Error ending game", error);
      });
  };
  componentWillUnmount() {
    // unsubscribe firestore listeners & reset global vars
    DBwatchAllPlayers && DBwatchAllPlayers();
    DBgetMatch && DBgetMatch();

    map = null;
    thisUser = null;
    DBgetMatch = null;
    DBwatchAllPlayers = null;
    initTimerId = null;
    gameTimerId = null;
  }

  render() {
    const {
      gameTimer,
      finished,
      tagger,
      imTagger,
      waiting,
      initialising,
      admin,
      geolocationError,
      playing,
      sonarTimer,
      initialisingTimer,
      remainingPlayers
    } = this.state;
    if (geolocationError) {
      return <Redirect to={routes.PROFILE} />;
    } else if (finished) {
      return <Redirect to={`${this.props.matchId}/finished`} />;
    } else {
      return (
        <Box align="center">
          <Box id="map" style={{ height: "60vh", width: "100%" }}></Box>
          {playing && (
            <div>
              <p style={{ color: "red" }}>{gameTimer}</p>
            </div>
          )}
          {// if waiting and admin
          admin && waiting && (
            <div>
              <p>press play when all players have joined game.</p>
              <Button onClick={this.chooseTagger} label="Play!" primary />
            </div>
          )}
          {// if waiting and not admin
          !admin && waiting && <p>waiting for more players to join...</p>}

          {initialising && !imTagger && (
            <div>
              <h2>{`${tagger.name} is in!`}</h2>
              <p>{`Game starts in ${initialisingTimer} seconds. GO HIDE!!!`}</p>
            </div>
          )}
          {initialising && imTagger && (
            <p>
              Your in! <br />
              {`you may hunt players in ${initialisingTimer} seconds`}
            </p>
          )}
          {!imTagger && playing && (
            <Button
              primary
              style={{ padding: "0.8em" }}
              onClick={this.sendSonar}
              label="send sonar"
            />
          )}
          {sonarTimer !== 0 && "sonar active for " + sonarTimer + " seconds"}
          {imTagger && playing && (
            <Button
              primary
              style={{ padding: "0.8em" }}
              onClick={this.tagPlayer}
              label="tag"
            />
          )}
          {imTagger && playing && remainingPlayers.length > 0 && (
            <p> {remainingPlayers.length} players left! </p>
          )}
        </Box>
      );
    }
  }
}

const mapStateToProps = ({ user }) => ({
  user
});

export default connect(mapStateToProps)(InGame);
