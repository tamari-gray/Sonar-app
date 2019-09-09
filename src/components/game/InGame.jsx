/*
TODO:
- [] get players location data into map and add icons
*/

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Box, Button } from 'grommet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { db, geo } from '../../firebase'

let map = null

class InGame extends Component {
  state = {
    boundary: {
      lat: -39.637652, // mayfair primary location
      lng: 176.860973,
    },
    position: null,
    zoom: 18,
    admin: false,
    initialising: false
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
      // if (map === null) this.initMap() // put players on map and inside boundary
      // this.getMatch() // toggle play btn
    }
  }

  getUserLocation = () => {

    const success = (pos) => {
      // add player location to db
      const point = geo.point(pos.coords.latitude, pos.coords.longitude)
      db.collection(this.props.matchId).doc(this.props.user.UID).update({
        position: point.data
      }).then(() => {
        this.getPlayers() // gets players from db
      })
    }

    const error = () => {
      alert('cant get user location')
    }

    const watchId = navigator.geolocation.watchPosition(success, error)

    // use this id to stop watching users position => navigator.geolocation.clearWatch(watchID);
    this.setState({
      watchId
    })
  }

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
    db.collection(this.props.matchId).onSnapshot((snap) => {
      let players = []
      snap.forEach(doc => {
        players.push(doc.data())
      })
      this.setState({ players })
      console.log('got players', this.state.players)
    })
  }

  getMatch = () => {
    db.collection('matches').doc(this.props.matchId)
      .onSnapshot((doc) => {
        // check if user is admin
        if (doc.data().admin.id === this.props.user.UID) {
          this.setState({ admin: doc.data().admin })
        }
        // check if game is in play
        if (doc.data().initialising) {
          this.setState({ initialising: true })
        }
        this.initMap(this.props.user)
      })
  }

  initMap = () => {
    map = L.map('map', {
      zoom: 22,
      maxZoomLevel: 22,
      maxNativeZoom: 22,
      zoomControl: true
    }).fitWorld()

    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      detectRetina: true,
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map)

    map.locate({ setView: true, maxZoom: 19 })
  }

  playGame = () => {
    db.collection('matches').doc(this.props.matchId)
      .update({ initialising: true })
      .catch(e => console.log(`Error initialising game. ${e}`))
  }

  handleSonar = () => {
    // this.props.dispatch(getLocations())
  }

  render() {
    const { admin, initialising } = this.state
    return (
      <Box align="center" >
        <Box id="map" style={{ height: "480px", width: "100%" }} >
        </Box>
        {
          admin && initialising === false && <Button onClick={this.playGame} label="Play!" primary />
        }
        {
          initialising && <Button primary style={{ padding: '0.8em' }} onClick={this.handleSonar}> send sonar </Button>
        }
      </Box>
    )
  }
}

const mapStateToProps = ({ user }) => ({
  user
})

export default connect(mapStateToProps)(InGame)
