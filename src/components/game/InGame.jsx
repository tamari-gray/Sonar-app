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
      this.getPlayers()
      if(map === null) this.initMap() // put players on map and inside boundary
      this.getMatch() // toggle play btn
    }
  }

  getUserLocation = async () => {

    const success = async (pos) => {
      await this.setState({
        position: {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        }
      })
      console.log('got position in getUserLocation', this.state.position)
    }

    const error = () => {
      alert('cant get user location')
    }

    console.log('getting position')
    const watchId = await navigator.geolocation.watchPosition((pos) => {
      return pos
      this.setState({ position: pos })
      console.log('got position', this.state.position)
    }, error)
    console.log(watchId)
    // const setLocation = await 
    // use this id to stop watching users position => navigator.geolocation.clearWatch(watchID);
    // this.setState({
    //   watchId
    // })
    return watchId
  }

  dbInit = (lat, lng) => {
    const { user: { username, UID }, matchId } = this.props
    const game = geo.collection(matchId)
    const point = geo.point(lat, lng)
    game.add({ name: username, id: UID, position: point.data })
    console.log('added user to game')
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
      snap.forEach(doc => {
        this.setState({ players: doc.data() })
        console.log('got players', this.state.players)
      })
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

  initMap = (user) => {
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

    const onLocationFound = (e) => {
      const radius = 10

      // add user to game
      this.dbInit(e.latlng.latitude, e.latlng.longitude)
      

      // add players to map

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
