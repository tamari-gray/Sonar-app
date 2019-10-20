import * as firebase from "firebase/app";
import React, { Component } from "react";
import { connect } from "react-redux";
import { Box, Button } from "grommet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { db, geoDb } from "../../firebase";
import routes from "../../routes";
import { Redirect } from "react-router-dom";
// import { location } from "grommet-icons";

let map = null;
let thisUser = null;

// firebase listeners
let DBgetMatch = null;
let DBtagged = null;
let DBcheckIfAllPlayersTagged = null;

//timers
let initTimerId = null;
let gameTimerId = null;

// user abilities
let jokerFakePosition = null;
let snitchedOnPlayers = [];

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
    playerQuirk: false,
    abilityInUse: false,
    snitchingOn: []
  };

  componentDidMount() {
    if (this.props) {
      this.initMap();
      this.getMatch(); // toggle play btn
      this.watchUserInfo();
      this.checkIfAllPlayersAreTagged();
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
  showAllPlayersLatestLocation = () => {
    // get all players from db ONCE
    let players = [];
    const userName = this.props.user.username;
    geoDb
      .collection("matches")
      .doc(this.props.matchId)
      .collection("players")
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          if (doc.data().name !== userName) {
            if (!doc.data().tagged) {
              let pos = [];
              if (doc.data().fakePos) {
                pos = [doc.data().fakePos[0], doc.data().fakePos[1]];
              } else {
                pos = [
                  doc.data().coordinates.latitude,
                  doc.data().coordinates.longitude
                ];
              }

              const marker = L.circle(pos, {
                // set player marker to black
                color: "green",
                fillColor: "green",
                fillOpacity: 0.5,
                radius: 5
              })
                .addTo(map)
                .bindPopup(doc.data().name)
                .openPopup();
              players.push(marker);
            }
          }
        });
      })
      .then(() => {
        let timer = 20;
        const intervalId = setInterval(() => {
          timer = timer - 1;
          if (timer === 0) {
            players.forEach(player => {
              if (map !== null) {
                map.removeLayer(player);
              }
            });
            clearInterval(intervalId);
          }
          this.setState({
            sonarTimer: timer
          });
        }, 1000);
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
          this.startTimer(600);
        } else if (doc.data().playing === false) {
          this.setState({ playing: false });
        }

        // check who le tagger is
        if (doc.data().tagger) {
          if (doc.data().tagger === this.props.user.username) {
            this.setState({ imTagger: true, tagger: doc.data().tagger });
            if (thisUser !== null) {
              thisUser.setRadius(20);
            }
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

        console.log(doc.data());

        // watch for players that get snitched on
        if (doc.data().snitchingOn) {
          console.log("get match", doc.data().snitchingOn);
          if (this.state.playerQuirk === "Tagger") {
            this.showSnitchedPlayers(doc.data().snitchingOn);
          } else {
            this.checkIfIGotSnitchedOn(doc.data().snitchingOn);
          }
        }
      });
  };
  checkIfIGotSnitchedOn = snitchedOn => {
    snitchedOn.forEach(player => {
      if (player.name === this.props.user.username) {
        this.setState({
          iGotSnitchedOn: true
        });
      }
    });
  };
  showSnitchedPlayers = snitchedOn => {
    // make markers with popup to remove them
    const snitchedPlayers = [];
    snitchedOn.length !== 0 &&
      snitchedOn.forEach(player => {
        const pos = [player.position.latitude, player.position.longitude];
        const popupContent = `${player.name} was snitched on!`;
        const marker = L.circle(pos, {
          // set player marker to black
          color: "green",
          fillColor: "green",
          fillOpacity: 0.5,
          radius: 5
        })
          .addTo(map)
          .bindPopup(popupContent)
          .openPopup();
        snitchedPlayers.push(marker);
        snitchedOnPlayers.push(marker);
      });
  };
  deleteMatch = () => {
    geoDb
      .collection("matches")
      .doc(this.props.matchId)
      .delete()
      .then(function() {
        console.log("game successfully deleted!");
      })
      .catch(function(error) {
        console.error("Error removing match from db: ", error);
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
  getSurvivors = () => {
    geoDb
      .collection("matches")
      .doc(this.props.matchId)
      .collection("players")
      .get()
      .then(querySnap => {
        const players = [];

        querySnap.forEach(doc => {
          players.push(doc.data().name);
        });

        const filterOutTagger = players.filter(
          player => player !== this.state.tagger
        );

        const survivors = filterOutTagger.filter(player => !player.tagged);

        if (survivors) {
          db.collection("finishedMatches")
            .doc(this.props.matchId)
            .set({
              winners: survivors
            })
            .then(() => {
              console.log("saved match data");
              geoDb
                .collection("matches")
                .doc(this.props.matchId)
                .update({
                  finished: true
                })
                .then(() => {
                  console.log("game finished");
                })
                .catch(e => console.log("error finishing game", e));
            });
        }
      });
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

    L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      detectRetina: true,
      attribution:
        '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
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
      redirecting to home screen in 5 seconds
      ${e}`);
      setTimeout(() => {
        this.setState({
          geolocationError: true
        });
      }, 5000);
    });

    map.locate({ maxZoom: 22, watch: true, enableHighAccuracy: true });
  };
  initialiseGame = () => {
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
          .update({ initialising: true, waiting: false, tagger: tagger.name })
          .catch(e => console.log(`Error initialising game. ${e}`));

        geoDb
          .collection("matches")
          .doc(this.props.matchId)
          .collection("players")
          .doc(tagger.id)
          .update({ playerQuirk: "Tagger", abilityUse: players.length * 2 })
          .then(() => console.log(` set tagger. ${tagger.name}`))
          .catch(e => console.log(`Error initialising game. ${e}`));
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
      .near({ center, radius: 20 });

    query.get().then(value => {
      // All GeoDocument returned by GeoQuery, like the GeoDocument added above
      value.docs.forEach(player => {
        geoDb
          .collection("matches")
          .doc(this.props.matchId)
          .collection("players")
          .doc(player.id)
          .update({
            tagged: true
          });
      });
    });
  };
  watchUserInfo = () => {
    DBtagged = geoDb
      .collection("matches")
      .doc(this.props.matchId)
      .collection("players")
      .doc(this.props.user.UID)
      .onSnapshot(doc => {
        if (doc.data() !== undefined || null) {
          if (doc.data().tagged) {
            this.setState({ imTagged: true });
          }
          if (doc.data().playerQuirk) {
            console.log("db quirk", doc.data().playerQuirk);
            let playerQuirk = doc.data().playerQuirk;
            let abilityUsage = doc.data().abilityUse;

            this.setState({
              playerQuirk,
              abilityUsage
            });

            if (playerQuirk === "Snitch") {
              if (thisUser !== null) {
                thisUser.setRadius(10);
              }
            }
          }
        }
      });
  };
  checkIfAllPlayersAreTagged = () => {
    DBcheckIfAllPlayersTagged = geoDb
      .collection("matches")
      .doc(this.props.matchId)
      .collection("players")
      .onSnapshot(querySnapshot => {
        const players = [];
        querySnapshot.forEach(function(doc) {
          players.push(doc.data());
        });
        const filterOutTagger = players.filter(
          player => player.name !== this.state.tagger
        );

        const allPlayersTaggged = filterOutTagger.every(
          player => player.tagged
        );

        if (allPlayersTaggged) {
          db.collection("finishedMatches")
            .doc(this.props.matchId)
            .set({
              winners: [this.state.tagger]
            })
            .then(() => {
              console.log("saved match data");
            });

          geoDb
            .collection("matches")
            .doc(this.props.matchId)
            .update({
              initialising: false,
              waiting: false,
              playing: false,
              finished: true,
              taggerWon: true
            })
            .catch(function(error) {
              console.log("Error ending game", error);
            });
        }
      });
  };

  useJokerAbility = () => {
    this.setState({
      abilityInUse: true
    });

    jokerFakePosition = new L.marker(
      [this.state.boundary.lat, this.state.boundary.lng],
      {
        draggable: true,
        icon: L.divIcon({
          iconAnchor: [10, 10],
          iconSize: [20, 20]
        })
      }
    )
      .addTo(map)
      .bindPopup("move me!")
      .openPopup();

    jokerFakePosition.on("dragend", e => {
      const fakePos = e.target.getLatLng();
      jokerFakePosition.setLatLng(fakePos).update();
      this.setState({
        fakePos: [fakePos.lat, fakePos.lng]
      });
    });
  };

  setFakePosition = () => {
    let timer = 90;
    const timerId = setInterval(() => {
      timer = timer - 1;
      this.setState({
        abilityTimer: timer
      });
      if (timer === 0) {
        if (jokerFakePosition !== null) {
          map.removeLayer(jokerFakePosition);
        }
        this.setState({
          abilityInUse: false,
          abilityTimer: 0
        });
        clearInterval(timerId);
      }
    }, 1000);

    this.DbUseAbility();
  };

  DbUseAbility = () => {
    geoDb
      .collection("matches")
      .doc(this.props.matchId)
      .collection("players")
      .doc(this.props.user.UID)
      .get()
      .then(doc => {
        let update = {};
        let newAbilityUsage = doc.data().abilityUse;

        if (newAbilityUsage) {
          newAbilityUsage = newAbilityUsage - 1;
        } else {
          newAbilityUsage = 0;
        }

        if (doc.data().playerQuirk === "Snitch") {
          update = {
            abilityUse: newAbilityUsage
          };
        } else if (doc.data().playerQuirk === "Joker") {
          update = {
            abilityUse: newAbilityUsage,
            fakePos: this.state.fakePos
          };
        }
        geoDb
          .collection("matches")
          .doc(this.props.matchId)
          .collection("players")
          .doc(this.props.user.UID)
          .update(update)
          .then(() => {
            console.log("used ability");
          })
          .catch(e => console.log(`error using ability ${e}`));
      })
      .catch(e => console.log(`error using ability ${e}`));
  };

  initSnitchAbility = () => {
    const center = new firebase.firestore.GeoPoint(
      this.state.myPosition.lat,
      this.state.myPosition.lng
    ); // this players pos

    const query = geoDb
      .collection("matches")
      .doc(this.props.matchId)
      .collection("players")
      .near({ center, radius: 10 });

    query.get().then(value => {
      // All GeoDocument returned by GeoQuery, like the GeoDocument added above
      const players = [];

      value.docs.forEach(doc => players.push(doc.data()));

      //filter out tagger
      const filterOutTagger = players.filter(
        player => player.playerQuirk !== "Tagger"
      );

      // filter out this user
      const filterOutThisUser = filterOutTagger.filter(
        player => player.id !== this.props.user.UID
      );

      const reformat = filterOutThisUser.map(player => {
        return {
          name: player.name,
          position: {
            latitude: player.coordinates.latitude,
            longitude: player.coordinates.longitude
          }
        };
      });

      this.setState({ snitchingOn: reformat, abilityInUse: true });
    });
  };

  useSnitchAbility = () => {
    let timer = 2;
    const abilityTimer = setInterval(() => {
      timer = timer - 1;
      if (timer === 0) {
        this.DbUseAbility();
        this.setState({ abilityInUse: false });
        geoDb
          .collection("matches")
          .doc(this.props.matchId)
          .update({
            snitchingOn: false
          })
          .then(() => {
            console.log(this.state);
            geoDb
              .collection("matches")
              .doc(this.props.matchId)
              .update({
                snitchingOn: this.state.snitchingOn
              })
              .then(() => console.log(`snitching successfull`))
              .catch(e => console.log(`error snitching, ${e}`));
          })
          .catch(e => console.log(`error snitching, ${e}`));

        clearInterval(abilityTimer);
      }
      this.setState({
        abilityTimer: timer
      });
    }, 1000);
  };
  componentWillUnmount() {
    // unsubscribe firestore listeners & reset global vars
    DBcheckIfAllPlayersTagged();
    DBgetMatch();
    DBtagged();
    map = null;
    thisUser = null;
    DBgetMatch = null;
    DBtagged = null;
    DBcheckIfAllPlayersTagged = null;
    initTimerId = null;
    gameTimerId = null;
    jokerFakePosition = null;
    snitchedOnPlayers = [];
  }

  testy = () => {
    setTimeout(() => {
      this.setState({ abilityInUse: false });
    }, 2000);
  };

  handleCloseAlert = () => {
    this.setState({
      hideAlert: true
    });
  };

  render() {
    const {
      gameTimer,
      finished,
      imTagged,
      imTagger,
      tagger,
      waiting,
      initialising,
      admin,
      geolocationError,
      playing,
      sonarTimer,
      initialisingTimer,
      playerQuirk,
      abilityUsage,
      abilityInUse,
      abilityTimer,
      snitchingOn,
      iGotSnitchedOn
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
              <Button onClick={this.initialiseGame} label="Play!" primary />
            </div>
          )}
          {// if waiting and not admin
          !admin && waiting && <p>waiting for more players to join...</p>}
          {initialising && !imTagger && (
            <div>
              <h2>{`${tagger} is in!`}</h2>
              <p>{`Game starts in ${initialisingTimer} seconds. GO HIDE!!!`}</p>
            </div>
          )}
          {initialising && imTagger && (
            <p>
              Your in! <br />
              {`you may hunt players in ${initialisingTimer} seconds`}
            </p>
          )}
          {imTagger && sonarTimer === 0 && playing && (
            <Button
              primary
              style={{ padding: "0.8em" }}
              onClick={this.showAllPlayersLatestLocation}
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
          {imTagged && (
            <p>{`please wait till the game has finished.. loser`}</p>
          )}

          {playing &&
            playerQuirk === "Joker" &&
            !abilityInUse &&
            abilityUsage > 0 && (
              <Button
                primary
                style={{ padding: "0.8em" }}
                onClick={this.useJokerAbility}
                label="Use fake position"
              />
            )}
          {playing &&
            playerQuirk === "Joker" &&
            abilityInUse &&
            abilityTimer === 0 && (
              <Box direction="row">
                <Button
                  primary
                  style={{ padding: "0.8em" }}
                  onClick={this.setFakePosition}
                  label="Place marker"
                />
                <Button
                  secondary
                  style={{ padding: "0.8em" }}
                  onClick={() => {
                    this.setState({ abilityInUse: false });
                    if (jokerFakePosition !== null) {
                      map.removeLayer(jokerFakePosition);
                    }
                  }}
                  label="cancel"
                />
              </Box>
            )}

          {playing &&
            playerQuirk === "Joker" &&
            abilityInUse &&
            abilityTimer > 0 && <p>fake position active for {abilityTimer}</p>}

          {playing &&
            playerQuirk === "Snitch" &&
            !abilityInUse &&
            abilityUsage > 0 && (
              <Button
                primary
                style={{ padding: "0.8em" }}
                onClick={this.initSnitchAbility}
                label="snitch"
              />
            )}

          {playing &&
            playerQuirk === "Snitch" &&
            abilityInUse &&
            snitchingOn &&
            abilityTimer === 0 &&
            (snitchingOn.length !== 0 ? (
              <Box direction="column">
                {"snitch on " +
                  snitchingOn.map(player => {
                    return `${player.name} `;
                  }) +
                  "?"}
                <Button
                  primary
                  style={{ padding: "0.8em" }}
                  onClick={this.useSnitchAbility}
                  label="confirm"
                />
              </Box>
            ) : (
              <Box>
                {this.testy()}
                <p>no one to snitch on within 10m</p>
              </Box>
            ))}

          {playing &&
            playerQuirk === "Snitch" &&
            abilityInUse &&
            abilityTimer > 0 && (
              <Box direction="column">
                {snitchingOn.map(player => {
                  return `${player.name}'s `;
                }) + `position will be revealed in ${abilityTimer} secs`}
              </Box>
            )}

          {playing && imTagger && snitchedOnPlayers.length !== 0 && (
            <Button
              primary
              style={{ padding: "0.8em" }}
              onClick={() => {
                snitchedOnPlayers.forEach(player => map.removeLayer(player));
                snitchedOnPlayers = [];
              }}
              label="remove snitched players"
            />
          )}

          {playing && iGotSnitchedOn && (
            <Box direction="row">
              <p>youve been snitched on!</p>
              <Button
                style={{ padding: "0.8em" }}
                onClick={() => {
                  this.setState({ iGotSnitchedOn: false });
                }}
                label="x"
              />
            </Box>
          )}
          {playing && abilityUsage >= 0 && (
            <p>{abilityUsage} ability uses left</p>
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
