/*
TODO:
- [x] get match
- [x] check if admin & toggle btn
- [x] admin clicks play => set inGame: true
- [] do geoquery => add players on map as they join
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
    lat: -39.646356,
    lng: 176.862737,
    zoom: 18,
    admin: false,
    initialising: false
  }

  componentDidMount() {
    if (this.props.matchId) {
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
  }

  initMap = (user) => {
    const players = geo.collection('matches').doc(this.props.matchId).collection('players')
    const point = geo.point(this.state.lat, this.state.lng)
    players.add({name: 'test', position: point.data })

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

    function onLocationFound(e) {
      const radius = 10

      // init player
      // L.circle(e.latlng, radius).addTo(map)
      // L.marker(e.latlng).addTo(map)
      //   .bindPopup(user.firstName + ", you are within " + radius + " meters from this point").openPopup()

      
    }

    function onLocationError(e) {
      alert(e.message)
    }

    map.on('locationfound', onLocationFound);
    map.on('locationerror', onLocationError);
    map.locate({ setView: true, watch: true, maxZoom: 19 })
    map.locate({ setView: true, maxZoom: 19 });
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
    const position = [this.state.lat, this.state.lng]
    const { admin, initialising } = this.state
    console.log(this.state)
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
