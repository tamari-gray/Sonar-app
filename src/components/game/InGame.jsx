/*
TODO:
- [] watch all players live location
- [x] check if admin
- [] admin starts game
*/

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Box, Button } from 'grommet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { db, geo } from '../../firebase'

let map = null
let thisUser = null

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
    userLocationFound: false,
    sonarTimer: 0
  }

  componentDidMount() {
    if (this.props) {
      this.initMap()
      geo.collection(this.props.matchId).setDoc(this.props.user.UID, { // add player to db 
        name: this.props.user.username,
      })
        .then(() => {
          this.getMatch() // toggle play btn
        })
        .catch((e) => alert(`Error adding player to db`, e))
    }
  }

  showAllPlayersLatestLocation = () => {
    // get all players from db ONCE
    let players = []
    const userName = this.props.user.username
    db.collection(this.props.matchId).get().then(querySnapshot => {
      querySnapshot.forEach(doc => {
        if (doc.data().name !== userName) {
          console.log(doc.data())
          const pos = [doc.data().position.geopoint.latitude, doc.data().position.geopoint.longitude]
          const marker = L.circle(pos, { // set player marker to black 
            color: 'green',
            fillColor: 'green',
            fillOpacity: 0.5,
            radius: 10
          }).addTo(map)
            .bindPopup(doc.data().name).openPopup()
          players.push(marker)
        }
      })
    }).then(() => {
      let timer = 10
      const intervalId = setInterval(() => {
        timer = timer - 1
        if (timer === 0) {
          players.forEach(player => {
            map.removeLayer(player)
          })
          clearInterval(intervalId)

        }
        this.setState({
          sonarTimer: timer
        })
      }, 1000)
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

    let gotUserLocation = false

    map.on('locationfound', ((e) => {
      console.log('updated location')
      const point = geo.point(e.latlng.lat, e.latlng.lng)
      const matchId = this.props.matchId
      if (thisUser === null) {
        thisUser = L.circle(e.latlng, { // set player marker to black 
          color: 'black',
          fillColor: '#f03',
          fillOpacity: 0.5,
          radius: 5
        }).addTo(map)
          .bindPopup(this.props.user.username).openPopup()
        // map.setView(e.latlng, 19) // watch this user's position on map
      } else if (thisUser) {
        let newLatLng = new L.LatLng(e.latlng.lat, e.latlng.lng);
        thisUser.setLatLng(newLatLng)
      }

      db.collection(matchId).doc(this.props.user.UID).update({ // update users location in DB
        position: point.data
      })
    }))
    map.locate({ setView: true, maxZoom: 19, watch: true })
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
    const { admin, initialising, players, playing, sonarTimer } = this.state
    return (
      <Box align="center" >
        <Box id="map" style={{ height: "480px", width: "100%" }} >
        </Box>
        <Box width="medium" align="center" >
          {
            players && !initialising && <h3>{players.length} players in game</h3>
          }
        </Box>
        {
          admin && !initialising && <Button onClick={this.playGame} label="Play!" primary />
        }
        {
          initialising && 'show timer here 30 seconds'
        }
        {
          sonarTimer === 0 && <Button primary style={{ padding: '0.8em' }} onClick={this.showAllPlayersLatestLocation}> send sonar </Button>
        }
        {
          sonarTimer !== 0 && 'sonar active for ' + sonarTimer + ' seconds'
        }
      </Box>
    )
  }
}

const mapStateToProps = ({ user }) => ({
  user
})

export default connect(mapStateToProps)(InGame)
