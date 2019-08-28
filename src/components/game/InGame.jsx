// TODO: 
// add user pos to db
// display users pos from db

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Box, Button } from 'grommet'
import { playGame, getMatch, setLocation } from '../../actions/match'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { db } from '../../firebase'

let map = null

class InGame extends Component {
  state = {
    play: false,
    lat: -39.646356,
    lng: 176.862737,
    zoom: 18
  }

  componentDidMount() {
    if (this.props.match.matchId && this.props.user.UID) {
      this.props.dispatch(getMatch(this.props.match.matchId))
      this.initMap(this.props.match, this.props.user.UID, this.props.dispatch)
    }
  }

  initMap = (match, userId, dispatch) => {
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
      let radius = 30

      L.circle(e.latlng, radius).addTo(map)
      L.marker(e.latlng).addTo(map)
        .bindPopup("You are within " + radius + " meters from this point").openPopup()

      // add geojson to db
      dispatch(setLocation(match.matchId, userId, e.latlng))
    }

    function onLocationError(e) {
      alert(e.message)
    }

    map.on('locationfound', onLocationFound);
    map.on('locationerror', onLocationError);
    map.locate({ setView: true, watch: true, maxZoom: 19 });
  }

  checkCreator = () => {
    if (this.props.user) {
      if (this.props.user.UID === this.props.match.creatorId) {
        if (this.props.inGame) {
          return true
        }
      }
    }
  }

  playGame = () => {
    this.props.dispatch(playGame(this.props.match.matchId))
    this.setState({
      play: true
    })
  }

  render() {
    const { match, user } = this.props
    const position = [this.state.lat, this.state.lng]

    return (
      <Box align="center" >
        <Box id="map" style={{ height: "480px", width: "100%" }} >
        </Box>
        {
          this.checkCreator() && <Button onClick={this.playGame} label="Play!" primary />
        }
      </Box>
    )
  }
}

const mapStateToProps = ({ match, user }) => ({
  match,
  user
})

export default connect(mapStateToProps)(InGame)
