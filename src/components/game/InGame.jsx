import * as firebase from "firebase/app";
import React, { Component } from "react";
import { connect } from "react-redux";
import { Box, Button } from "grommet";
import { Close } from "grommet-icons";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  playerRef,
  matchRef,
  playersRef,
  sonardPlayersRef,
  taggedPlayersRef,
  finishedMatchRef,
  playerRefExists
} from "../../firebase";
import routes from "../../routes";
import { Redirect } from "react-router-dom";

let map = null;
let thisUser = null;
let boundary = null;

// firebase listeners
let DBgetMatch = null;
let DBwatchAllPlayers = null;
let DBwatchTaggedPlayers = null;
let DBwatchPlayersJoin = null;

//timers
let initTimerId = null;
let gameTimerId = null;

class InGame extends Component {
  state = {
    boundary: null,
    position: null,
    zoom: 18,
    admin: false,
    initialising: false,
    players: null,
    userLocationFound: false,
    sonarTimer: 0,
    playing: false,
    initialisingTimer: 60,
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
    window.addEventListener("beforeunload", () => {
      setTimeout(() => {
        console.log(
          "player hasnt been active for more then 10 seconds => removed from game"
        );
        this.handlePlayerQuit();
      }, 10000);
    });
    if (this.props) {
      matchRef(this.props.matchId)
        .get()
        .then(doc => {
          if (doc.data().admin.id === this.props.user.UID) {
            this.setState({ admin: true })
          }
        })
        .then(() => {
          this.initMap();
        })

        this.getMatch(); // toggle play btn
    }
  }
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
        matchRef(this.props.matchId) // move to playing phase in firebase
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
    }).fitWorld();

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      detectRetina: true,
      attribution:
        '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);



    map.on("locationfound", e => {
      this.setState({ myPosition: e.latlng });
      const pos = new firebase.firestore.GeoPoint(e.latlng.lat, e.latlng.lng);
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
        map.setView(e.latlng, 17);
      } else if (thisUser) {
        let newLatLng = new L.LatLng(e.latlng.lat, e.latlng.lng);
        thisUser.setLatLng(newLatLng);
      }

      if (boundary === null && map !== null && this.state.admin ) {
        console.log("setting default boundary pos")
        // set default boundary
        boundary = L.circle(
          e.latlng,
          {
            color: "blue",
            fillColor: "#f03",
            fillOpacity: 0.3,
            radius: 100
          }
        ).addTo(map)

        this.setState({ boundary: e.latlng })

        map.setView(e.latlng, 17);

        this.adminSetBoundary()
      }


      // update users location in DB
      // playerRefExists(this.props.matchId, this.props.user.UID) &&
        playerRef(this.props.matchId, this.props.user.UID)
          .update({
            coordinates: pos
          })
          .catch(e => console.log("error watching user position", e));
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
  handlePlayerQuit = () => {
    console.log("quitting", this.state.remainingPlayers.length);
    if (this.state.remainingPlayers.length === 1) {
      this.endGame();
    } else {
      playerRef(this.props.matchId, this.props.user.UID)
        .delete()
        .then(() => {
          this.setState({ quit: true });
          console.log("succesfully left game");
          matchRef(this.props.matchId)
            .update({
              quitter: this.props.user.username
            })
            .then(() => {
              console.log(
                `updated game that ${this.props.user.username} has quit`
              );
            })
            .catch(e =>
              console.log(
                `error updating game that ${this.props.user.username} has quit`
              )
            );
        })
        .catch(e => console.log(`error removing player from match `));
    }
  };
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
  getMatch = () => {
    DBgetMatch = matchRef(this.props.matchId).onSnapshot(doc => {
      if (doc.exists) {
        this.setState({ gotMatch: true })
        // check if user is admin
        if (doc.data().admin.id === this.props.user.UID) {
          this.setState({ admin: doc.data().admin });
        }

        // check if game is in waiting phase
        if (doc.data().waiting === true) {
          this.setState({ waiting: true });
          if (doc.data().admin.id === this.props.user.UID) {
            this.watchPlayersJoin();
            // this.setBoundary()
          }
        } else if (doc.data().waiting === false) {
          this.setState({ waiting: false });
        }

        // check if game is initialising
        if (doc.data().initialising) {
          this.setState({ initialising: true });
          this.startInitialiseTimer();
          doc.data().boundary && this.setBoundary(doc.data().boundary)

        } else if (doc.data().initialising === false) {
          this.setState({ initialising: false });
        }

        // check if game is in play
        if (doc.data().playing) {
          clearInterval(initTimerId);
          this.setState({ playing: true });

          this.watchForTaggedPlayers();
          this.watchForPlayerSonars();

          //if user refreshes tab reset boundary
          this.state.boundary === null && doc.data().boundary && this.setBoundary(doc.data().boundary)

        } else if (doc.data().playing === false) {
          this.setState({ playing: false });
        }

        // check who le tagger is
        if (doc.data().tagger) {
          if (doc.data().tagger.id === this.props.user.UID) {
            this.setState({
              imTagger: true,
              tagger: doc.data().tagger
            });
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

          //stop watching user postion
          map && map.stopLocate()
          this.setState({ finished: true });
        }

        // if game is finished
        if (doc.data().quit) {
          clearInterval(gameTimerId);
          if (this.state.admin) {
            this.deleteMatch();
          }
          this.setState({ quit: true });
        }

        if (doc.data().quitter) {
          console.log("we got a quitter", doc.data().quitter);
          this.setState({
            quitter: doc.data().quitter
          });

          if (doc.data().quitter === doc.data().tagger.name) {
            if (this.state.taggerHasTaggedSomeone) {
              console.log("setting draw..");
              this.setDraw();
            }
          }
        }

        console.log("match data", doc.data());
      }
    });
  };
  adminSetBoundary = () => {
    // if (this.state.waiting) {
    console.log("setting boundary")
    let boundaryMoving = false
    boundary.on({
      'mousedown': () => {
        map.removeEventListener('mousedown')
        console.log('mousedown')
        boundaryMoving = !boundaryMoving

        boundaryMoving ? map.on('mousemove', (e) => {
          boundary.setLatLng(e.latlng);
          this.setState({ boundary: e.latlng })
        }) : (
            map.removeEventListener('mousemove')
          )
      }
    });

    // }
  }
  setBoundary = (pos) => {
    this.setState({boundary: pos})

    console.log("setting boundary from db", pos)
    boundary && map.removeLayer(boundary)
    boundary = L.circle(
      pos,
      {
        color: "blue",
        fillColor: "#f03",
        fillOpacity: 0.3,
        radius: 100
      }
    ).addTo(map)

    map.setView(pos, 17);
  }
  watchPlayersJoin = () => {
    DBwatchPlayersJoin = playersRef(this.props.matchId).onSnapshot(snap => {
      const size = snap.size; // will return the collection size
      console.log("player joined, total = ", size);
      if (size > 1) {
        this.setState({
          playersJoined: size,
          showPlayBtn: true
        });
      }
    });

    if (this.state.playing) {
      DBwatchPlayersJoin && DBwatchPlayersJoin();
      DBwatchPlayersJoin = null;
    }
  };
  deleteMatch = () => {
    matchRef(this.props.matchId)
      .delete()
      .then(() => {
        console.log("game successfully deleted!");
      })
      .catch(e => {
        console.error("Error removing match from db: ", e);
      });
  };
  initGame = () => { // choose tagger and set boundary location

    // set boundary in db
    matchRef(this.props.matchId).get().then(doc => {
      if (doc.exists) {
        matchRef(this.props.matchId).update({
          boundary: [this.state.boundary.lat, this.state.boundary.lng]
        })
          .then(() => console.log('set boundary position in db'))
          .catch(e => console.log(`error setting boundary position in db ${e}`))
      }
    })

    let players = [];
    // choose tagger
    playersRef(this.props.matchId)
      .get()
      .then(querySnap => {
        querySnap.forEach(snap => {
          players.push({ id: snap.data().id, name: snap.data().name });
        });
      })
      .then(() => {
        const tagger = players[Math.floor(Math.random() * players.length)];
        matchRef(this.props.matchId)
          .update({ initialising: true, waiting: false, tagger })
          .catch(e => console.log(`Error choosing tagger. ${e}`));

        playersRef(this.props.matchId)
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

    // let center = new firebase.firestore.GeoPoint(
    //   -39.637449,
    //   176.861232
    //   )

    // get player location
    // playerRef(this.props.matchId, this.props.user.UID)
    //   .get()
    //   .then(doc => {
    //     // center = [doc.data().coordinates.latitude, doc.data().coordinates.longitude]
    //     console.log("got player location")
    //   })

    const query = playersRef(this.props.matchId).near({ center, radius: 0.02 });

    query.get().then(value => {
      const geoQuery = []
      value.docs.forEach(doc => {
        if (doc.exists) {
          geoQuery.push(doc.data())
        }
      });
      console.log("geoQuery ", geoQuery)
      const notTaggedPlayers = geoQuery.filter(p => !p.tagger)
      console.log("not tagged query", notTaggedPlayers)

      //check if they are last players
      notTaggedPlayers.length >= 1 && (
        playersRef(this.props.matchId)
          .get()
          .then(snapShot => {

            //get remaining players
            const players = []
            snapShot.forEach(p => players.push(p.data()))
            const remainingPlayers = players.filter(p => !p.tagger)
            console.log("remaining players = ", remainingPlayers.length)

            // check for win
            let win = false
            notTaggedPlayers.length === remainingPlayers.length && (win = true)

            win ? (
              //check for draw || single winner
              notTaggedPlayers.length > 1 ? this.setDraw(notTaggedPlayers) : this.setWinner(notTaggedPlayers[0])
            ) : (
                this.setPlayersAsTagged(notTaggedPlayers)
              )

          })
          .catch(e => console.log(`error checking for remaining players`))
      )
    });
  };
  setPlayersAsTagged = players => {
    // set players as tagged
    players.forEach((player) => {

      // do i need to update player doc????????????????????????????????????????????????????????????????
      // just listen to on add taggedPlayers coll => filter out if its me (to check if im tagged)
      // hmmm idk yet
      playerRef(this.props.matchId, player.id)
        .update({
          tagger: true,
          sonar: false
        })
        .then(console.log(`updated ${player.name} doc to tagger: true`))
        .catch(e => console.log(`error updating player to tagger ${e}`));

      playerRef(this.props.matchId, player.id)
        .get()
        .then((doc) => {
          let pos
          if (doc.exists) {
            pos = [doc.data().coordinates.latitude, doc.data().coordinates.longitude]
          }
          return pos
        })
        .then(pos => {
          pos && taggedPlayersRef(this.props.matchId)
            .doc(player.id)
            .set({
              name: player.name,
              id: player.id,
              coordinates: new firebase.firestore.GeoPoint(pos[0], pos[1])
            })
            .then(() =>
              console.log(`added ${player.name} to tagged players doc`)
            )
            .catch(e => console.log(`error adding ${player.name} to tagged players doc ${e}`));
        })
        .catch(e => console.log(`error getting ${player.name}'s position ${e}`));
    })
  }
  setDraw = (winners) => {
    finishedMatchRef(this.props.matchId)
      .set({
        draw: winners
      })
      .then(() => console.log("match drew, winners are: ", winners))
      .then(() => this.endGame())
      .catch(e => console.log(`error when setting match draw ${e}`));
  }
  setWinner = (winner) => {
    finishedMatchRef(this.props.matchId)
      .set({
        winner
      })
      .then(() => console.log(`set winner ${winner.name}`))
      .then(() => this.endGame())
      .catch(error => {
        console.log("Error setting winner", error);
      });
  }
  watchForTaggedPlayers = () => {
    DBwatchTaggedPlayers = taggedPlayersRef(this.props.matchId).onSnapshot(
      snapShot => {
        snapShot.docChanges().forEach(change => {
          if (change.type === "added") {
            this.setState({ taggerHasTaggedSomeone: true });
            const player = change.doc.data();
            this.setTaggedPlayerMarker(player);

            // check if im tagged
            if (player.id === this.props.user.UID) {
              this.setState({ imTagger: true, iGotTagged: true });
            }
          }
          if (change.type === "modified") {
          }
          if (change.type === "removed") {
            console.log("removed", change.doc.data());
          }
        });
      }
    );
  };
  setTaggedPlayerMarker = player => {
    console.log(player.name + "was tagged");
    let pos = [player.coordinates.latitude, player.coordinates.longitude];
    const marker = L.circle(pos, {
      color: "orange",
      fillColor: "orange",
      fillOpacity: 0.5,
      radius: 2.5
    })
      .addTo(map)
      .bindPopup(`${player.name} was tagged`)
      .openPopup();
    setTimeout(() => {
      if (!this.state.finished && marker) {
        console.log("removing just tagged player marker");
        map.removeLayer(marker);
        map.setView([this.state.boundary.lat, this.state.boundary.lng], 17);
      }
    }, 3000);
  };
  sendSonar = () => {
    playersRef(this.props.matchId)
      .where("tagger", "==", true)
      .get()
      .then(querySnapshot => {
        console.log("got taggers")
        querySnapshot.forEach(doc => {
          let pos = [
            doc.data().coordinates.latitude,
            doc.data().coordinates.longitude
          ];
          console.log("tagger pos", pos)
          const marker = L.circle(pos, {
            color: "green",
            fillColor: "green",
            fillOpacity: 0.5,
            radius: 2.5
          })
            .addTo(map)
            .bindPopup("Tagger")
            .openPopup();
          map.setView(this.state.boundary, 17);
          setTimeout(() => {
            if (!this.state.finished && marker) {
              map.removeLayer(marker);
            }
          }, 5000);
        });
      })
      .then(() => {
        playerRef(this.props.matchId, this.props.user.UID)
          .get()
          .then(doc => {
            const pos = [doc.data().coordinates.latitude, doc.data().coordinates.longitude]

            console.log(`got ${this.props.user.username}'s position. ${pos}`)

            return pos
          })
          .then(pos => {
            // notify taggers i used sonar
            pos && sonardPlayersRef(this.props.matchId)
              .doc(this.props.user.UID)
              .set({
                name: this.props.user.username,
                id: this.props.user.UID,
                coordinates: new firebase.firestore.GeoPoint(pos[0], pos[1]) // set to current position
              })
              .then(() => {
                console.log("added player to sonard players coll");
                // setTimeout(() => {
                sonardPlayersRef(this.props.matchId)
                  .doc(this.props.user.UID)
                  .delete()
                  .then(() => console.log(`removed player from sonard coll`))
                  .catch(e =>
                    console.log(`error deleting player from sonard coll ${e}`)
                  );
                // }, 5000);
              })
              .catch(e =>
                console.log(`error adding player to sonard players coll ${e}`)
              );
          })
          .catch(e =>
            console.log(`error getting ${this.props.user.UID}'s position`)
          );

      });
  };
  watchForPlayerSonars = () => {
    DBwatchTaggedPlayers = sonardPlayersRef(this.props.matchId).onSnapshot(
      snapShot => {
        snapShot.docChanges().forEach(change => {
          if (change.type === "added") {
            const player = change.doc.data();
            this.checkForPlayersSonar(player);
          }
          if (change.type === "modified") {
          }
          if (change.type === "removed") {
          }
        });
      }
    );
  };
  checkForPlayersSonar = player => {
    if (this.state.imTagger) {
      console.log(player.name + "used sonar");
      let pos = [player.coordinates.latitude, player.coordinates.longitude];
      const marker = L.circle(pos, {
        color: "green",
        fillColor: "green",
        fillOpacity: 0.5,
        radius: 2.5
      })
        .addTo(map)
        .bindPopup(`player used sonar`)
        .openPopup();
      console.log("set just sonard player marker");
      setTimeout(() => {
        if (!this.state.finished && marker) {
          console.log("removing just sonard player marker");
          map.removeLayer(marker);
          this.state.boundary && map.setView([this.state.boundary.lat, this.state.boundary.lng], 19);
        }
      }, 5000);
    }
  };
  endGame = () => {
    matchRef(this.props.matchId)
      .get()
      .then(doc => {
        console.log("ending game");
        if (doc.exists) {
          matchRef(this.props.matchId)
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
        }
      });
  };
  quitGame = () => {
    matchRef(this.props.matchId)
      .update({
        quit: true
      })
      .then(() => console.log("admin quit game"))
      .catch(error => {
        console.log("Error quiting game", error);
      });
  };
  componentWillUnmount() {
    // unsubscribe firestore listeners & reset global vars
    DBwatchAllPlayers && DBwatchAllPlayers();
    DBwatchTaggedPlayers && DBwatchTaggedPlayers();
    DBgetMatch && DBgetMatch();
    DBwatchPlayersJoin && DBwatchPlayersJoin();

    map = null;
    thisUser = null;
    DBgetMatch = null;
    DBwatchAllPlayers = null;
    DBwatchTaggedPlayers = null;
    DBwatchPlayersJoin = null;

    initTimerId = null;
    gameTimerId = null;

    window.removeEventListener("beforeunload", this.handlePlayerQuit);
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
      remainingPlayers,
      quit,
      showPlayBtn,
      quitter,
      showQuitOverlay,
      iGotTagged
    } = this.state;
    if (geolocationError) {
      return <Redirect to={routes.PROFILE} />;
    } else if (finished) {
      return <Redirect to={`${this.props.matchId}/finished`} />;
    } else if (quit) {
      return <Redirect to={routes.HOME} />;
    } else {
      return (
        <Box align="center">
          {showQuitOverlay && (
            <div>
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100vw",
                  height: "100vh",
                  zIndex: 3,
                  backgroundColor: "grey",
                  opacity: 0.7
                }}
              ></div>
              <Box
                pad="medium"
                background="light-2"
                style={{
                  height: "20vh",
                  width: "60vw",
                  position: "fixed",
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  zIndex: 3
                }}
              >
                <p style={{ textAlign: "center" }}>
                  Are you sure you want to quit?
                </p>
                <Box
                  style={{ position: "relative", zIndex: 4 }}
                  direction="row"
                  align="center"
                  justify="between"
                >
                  <Button
                    hoverIndicator
                    primary
                    label="return to game"
                    onClick={() => this.setState({ showQuitOverlay: false })}
                  />
                  <Button
                    hoverIndicator
                    secondary
                    label="Quit"
                    onClick={this.handlePlayerQuit}
                  />
                </Box>
              </Box>
            </div>
          )}
          <Box
            style={{ position: "fixed", top: "1em", right: "1em", zIndex: 2 }}
          >
            <Box round="full" overflow="hidden" background="light-2">
              <Button
                icon={<Close />}
                hoverIndicator
                onClick={() => this.setState({ showQuitOverlay: true })}
              />
            </Box>
          </Box>
          <Box
            id="map"
            style={{ height: "60vh", width: "100%", zIndex: 1 }}
          ></Box>
          {playing && (
            <div>
              <p style={{ color: "red" }}>{gameTimer}</p>
            </div>
          )}
          {// if waiting and admin
            admin && waiting && (
              <div>
                {
                  <p>tap boundary to move and place it</p>
                }
                {showPlayBtn ? (
                  <p>Press play when all players have joined game.</p>
                ) : (
                    <p style={{ marginRight: "2em" }}>no players joined yet..</p>
                  )}

                <Box align="center" direction="row">
                  {showPlayBtn && (
                    <Button onClick={this.initGame} label="Play!" primary />
                  )}
                  <Button onClick={this.quitGame} label="Quit" secondary />
                </Box>
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
          {quitter && <p>{quitter} has quit!</p>}
          {/* {
            iGotTagged && (setTimeout(() => {
              <p> you were tagged!</p>
            }, 3000))
          } */}
        </Box>
      );
    }
  }
}

const mapStateToProps = ({ user }) => ({
  user
});

export default connect(mapStateToProps)(InGame);
