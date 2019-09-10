/*
TODO:
- [] watch all players live location
- [] check if admin
- [] admin starts game
*/

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Box, Button } from 'grommet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { db, geo } from '../../firebase'

let map = null
let playersRefUnsubscribe = null
let playerMarker = null

class InGame extends Component {
  state = {
    boundary: {
      lat: -39.637652, // mayfair primary location
      lng: 176.860973,
    },
    position: null,
    zoom: 18,
    admin: false,
    initialising: false,
    players: null,
    userLocationFound: false
  }

  componentDidMount() {
    if (this.props) {
      this.initMap()
      // add player to db
      geo.collection(this.props.matchId).setDoc(this.props.user.UID, {
        name: this.props.user.username,
      }).then(() => {
        this.getUserLocation()
      })
      // this.getMatch() // toggle play btn
    }
  }

  // getUserLocation = () => { // rewrote in mapInit. TODO: delete if rewritten function is successfull

  //   const success = (pos) => {
  //     // add player location to db
  //     const point = geo.point(pos.coords.latitude, pos.coords.longitude)
  //     db.collection(this.props.matchId).doc(this.props.user.UID).update({
  //       position: point.data
  //     }).then(() => {
  //       this.getPlayers() // gets players from db

  //     })
  //   }

  //   const error = () => {
  //     alert('cant get user location')
  //   }

  //   const watchId = navigator.geolocation.watchPosition(success, error)

  //   // use this id to stop watching users position => navigator.geolocation.clearWatch(watchID);
  //   this.setState({
  //     watchId
  //   })
  // }

  // realtime observable of players
  // getPlayers = () => { 
  //   // make geoquery inside boundary
  //   const game = geo.collection(this.props.matchId)
  //   const center = geo.point(this.state.lat, this.state.lng);
  //   const radius = 0.25;
  //   const field = 'position';

  //   const query = game.within(center, radius, field)
  //   query.subscribe(console.log)
  // }

  getPlayers = () => {
    playersRefUnsubscribe = db.collection(this.props.matchId).onSnapshot((querySnapshot) => {
      let players = []
      querySnapshot.forEach(doc => { // watch every players position
        players.push(doc.data())
        const pos = [doc.data().position.geopoint.latitude, doc.data().position.geopoint.latitude]
        let playerMarker = L.circle(pos, {
          color: 'red',
          fillColor: '#f03',
          fillOpacity: 0.5,
          radius: 100
        }).addTo(map)

        if (doc.ref.id === this.props.user.UID) { // check if player is this user
          playerMarker = L.circle(pos, { // set player marker to black 
            color: 'black',
            fillColor: '#f03',
            fillOpacity: 0.5,
            radius: 100
          }).addTo(map)

          map.setView(pos, 10) // watch this user's position on map
        }
      })
      this.setState({ players })
      console.log('got players', this.state.players)
    })
  }

  getMatch = () => {
    db.collection('matches').doc(this.props.matchId)
      .onSnapshot((doc) => {
        
        if (doc.data().admin.id === this.props.user.UID) { // check if user is admin
          this.setState({ admin: doc.data().admin })
        }
        
        if (doc.data().initialising) { // check if game is initialising
          this.setState({ initialising: true })
        }
        if (doc.data().playing) { // check if game is in play
          this.setState({ playing: true })
        }
      })
  }

  initMap = () => {
    map = L.map('map', {
      zoom: 22,
      maxZoomLevel: 22,
      maxNativeZoom: 22,
      zoomControl: true
    })
      .fitWorld()
      .setView([this.state.boundary.lat, this.state.boundary.lng], 19)

    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      detectRetina: true,
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map)

    const boundary = L.circle([this.state.boundary.lat, this.state.boundary.lng], {
      color: 'blue',
      fillColor: '#f03',
      fillOpacity: 0.5,
      radius: 200
    }).addTo(map)

    map.on('locationFound', ((e) => {
      const point = geo.point(e.latlng.latitude, e.latlng.longitude) // TODO: fix
      db.collection(this.props.matchId).doc(this.props.user.UID).update({ // update users location in DB
        position: point.data
      }).then(() => {
        this.setState({ // tell component that weve got users location
          userLocationFound: true
        })
      }).then(() => {
        if (this.state.userLocation) { // only run this.getPlayers once. it has a realtime listener on it
          this.getPlayers() // gets players from db
        }
      })
    }))

  }

  playGame = () => {
    // playersRefUnsubscribe() // remove players ref listener

    db.collection('matches').doc(this.props.matchId)
      .update({ playing: true })
      .catch(e => console.log(`Error initialising game. ${e}`))
  }

  handleSonar = () => {
    // this.props.dispatch(getLocations())
  }

  render() {
    const { admin, initialising, players, playing } = this.state
    return (
      <Box align="center" >
        <Box id="map" style={{ height: "480px", width: "100%" }} >
        </Box>
        <Box width="medium" align="center" >
          {
            players && <h3>{players.length} players in game</h3>
          }
          {
            players && players.map(player => {
              return <Box
                key={player.name}
                pad="small"
                border={{ color: 'primary', size: 'large' }}
                elevation="small"
                round="large"
                width="small"
                align="center"
                direction="row-responsive"
                style={{ marginTop: '1.5em' }}
              >
                <h3 style={{ margin: "auto" }}>
                  {player.name}
                </h3>
              </Box>
            })
          }
        </Box>
        {
          admin && !initialising && <Button onClick={this.playGame} label="Play!" primary />
        }
        {
          playing && <Button primary style={{ padding: '0.8em' }} onClick={this.handleSonar}> send sonar </Button>
        }
      </Box>
    )
  }
}

const mapStateToProps = ({ user }) => ({
  user
})

export default connect(mapStateToProps)(InGame)
