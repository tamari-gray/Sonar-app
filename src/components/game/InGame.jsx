import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Box, Button } from 'grommet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { db, geo } from '../../firebase'
import routes from '../../routes'
import { Redirect } from 'react-router-dom'
import { get } from 'geofirex';

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
    sonarTimer: 0,
    playing: false,
    initialisingTimer: 30,
    geolocationError: false,
    waiting: false,
    tagger: false,
    imTagger: false
  }

  componentDidMount() {
    if (this.props) {
      this.initMap()
      this.getMatch() // toggle play btn
      geo.collection(this.props.matchId).setDoc(this.props.user.UID, { // add player to db 
        name: this.props.user.username,
      })
        .catch((e) => alert(`Error adding player to db`, e))
    }
  }

  putPlayersMarkersOnMap = (players) => {
    const markers = []
    players.forEach(player => {
      const pos = [player.position.geopoint.latitude, player.position.geopoint.longitude]
      const marker = L.circle(pos, { // set player marker to black 
        color: 'red',
        fillColor: 'green',
        fillOpacity: 0.5,
        // map.setView(e.latlng, 19) // watch this user's position on map
        radius: 5
      }).addTo(map)
        .bindPopup(`you've tagged ${player.name}`).openPopup()
      markers.push(marker)

    })
    let timer = 3
    const intervalId = setInterval(() => {
      timer = timer - 1
      if (timer === 0) {
        markers.forEach(marker => {
          map.removeLayer(marker)
        })
        clearInterval(intervalId)
      }
    }, 1000)
  }

  showAllPlayersLatestLocation = () => {
    // get all players from db ONCE
    let players = []
    const userName = this.props.user.username
    db.collection(this.props.matchId).get().then(querySnapshot => {
      querySnapshot.forEach(doc => {
        if (doc.data().name !== userName) {
          const pos = [doc.data().position.geopoint.latitude, doc.data().position.geopoint.longitude]
          const marker = L.circle(pos, { // set player marker to black 
            color: 'green',
            fillColor: 'green',
            fillOpacity: 0.5,
            // map.setView(e.latlng, 19) // watch this user's position on map
            radius: 5
          }).addTo(map)
            .bindPopup(doc.data().name).openPopup()
          players.push(marker)
        }
      })
    }).then(() => {
      let timer = 20
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

        if (doc.data().waiting === true) { // check if game is in waiting phase
          this.setState({ waiting: true })
        } else if (doc.data().waiting === false) {
          this.setState({ waiting: false })
        }

        if (doc.data().initialising) { // check if game is initialising
          this.setState({ initialising: true })
          this.startInitialiseTimer()
        } else if (doc.data().initialising === false) {
          this.setState({ initialising: false })
        }

        if (doc.data().playing) { // check if game is in play
          this.setState({ playing: true })
        } else if (doc.data().playing === false) {
          this.setState({ playing: false })
        }

        if (doc.data().tagger) { // check who le tagger is
          if (doc.data().tagger === this.props.user.username) {
            this.setState({ imTagger: true })
          } else {
            this.setState({ tagger: doc.data().tagger })
            // check if im tagged
            // const imTagged = doc.data().tagged.find(({ name }) => name === this.props.user.username)

            // if (imTagged !== undefined) {
            //   this.setState({ imTagged: true })
            // }
          }
        }

        if (doc.data().tagged) { //listen to tagged playerss

        }
      })
  }

  startInitialiseTimer = () => {
    let timer = 31
    const id = setInterval(() => {
      timer = timer - 1
      this.setState({
        initialisingTimer: timer
      })
      if (timer === 0) {
        this.setState({
          initialisingTimer: 0
        })
        db.collection('matches').doc(this.props.matchId) // move to playing phase in firebase
          .update({ initialising: false, playing: true })
          .catch(e => console.log(`Error initialising game. ${e}`))
        clearInterval(id)
      }
    }, 1000)
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

    map.on('locationfound', ((e) => {
      this.setState({ myPosition: e.latlng })
      console.log(this.state.myPosition)
      const point = geo.point(e.latlng.lat, e.latlng.lng)
      const matchId = this.props.matchId
      if (thisUser === null) {
        thisUser = L.circle(e.latlng, { // set player marker to black 
          color: 'black',
          fillColor: '#f03',
          fillOpacity: 0.5,
          radius: 30
        }).addTo(map)
          .bindPopup(this.props.user.username).openPopup()
      } else if (thisUser) {
        let newLatLng = new L.LatLng(e.latlng.lat, e.latlng.lng);
        thisUser.setLatLng(newLatLng)
      }
      db.collection(matchId).doc(this.props.user.UID).update({ // update users location in DB
        position: point.data
      })
    }))

    map.on('locationerror', ((e) => {
      alert(`Please enable geolocation access to play game. 
      redirecting to home screen in 5 seconds
      ${e}`)
      setTimeout(() => {
        this.setState({
          geolocationError: true
        })
      }, 5000)
    }))

    map.locate({ setView: true, maxZoom: 19, watch: true, enableHighAccuracy: true })
  }

  initialiseGame = () => {
    let players = []
    // choose tagger
    db.collection('matches').doc(this.props.matchId)
      .collection('players').get()
      .then((querySnap) => {
        querySnap.forEach((snap) => {
          players.push(snap.data().name)
        })
      })
      .then(() => {
        const tagger = players[Math.floor(Math.random() * players.length)]
        db.collection('matches').doc(this.props.matchId)
          .update({ initialising: true, waiting: false, tagger })
          .catch(e => console.log(`Error initialising game. ${e}`))
      })
  }

  tagPlayer = async () => {
    const { user: { username }, matchId } = this.props

    // do a geoquery for a 10m radius
    const players = geo.collection(matchId)
    const center = geo.point(this.state.myPosition.lat, this.state.myPosition.lng) // this players pos
    const radius = 0.03
    const field = 'position'

    const query = players.within(center, radius, field);

    // get ids of people in geoquery
    const playersInTaggingDistance = await get(query)

    // filter out this user
    const aboutToBeTagged = playersInTaggingDistance.filter(player => player.name !== username)
    
    // update them => {tagged: true}
    aboutToBeTagged && aboutToBeTagged.forEach(player => {
      db.collection('matches').doc(matchId).collection('tagged')
        .add({ id: player.id, name: player.name })
        .catch(e => console.log(`Error tagging player. ${e}`))
    })

    //update ui => that youve tagged a player
    this.putPlayersMarkersOnMap(aboutToBeTagged)
  }

  render() {
    const { imTagged, imTagger, tagger, waiting, initialising, admin, geolocationError, playing, sonarTimer, initialisingTimer } = this.state
    if (geolocationError) {
      return <Redirect path={routes.PROFILE} />
    } else {
      return (
        <Box align="center" >
          <Box id="map" style={{ height: "480px", width: "100%" }} >
          </Box>
          { // if waiting and admin
            admin && waiting && (
              <div>
                <p>press play when all players have joined game.</p>
                <Button onClick={this.initialiseGame} label="Play!" primary />
              </div>
            )
          }
          { // if waiting and not admin 
            !admin && waiting && (
              <p>waiting for more players to join...</p>
            )
          }
          {
            initialising && !imTagger && (
              <div>
                <h2>{`${tagger} is in!`}</h2>
                <p>
                  {`Game starts in ${initialisingTimer} seconds. GO HIDE!!!`}
                </p>
              </div>
            )
          }
          {
            initialising && imTagger && (
              <p>
                {`you may hunt players in ${initialisingTimer} seconds`}
              </p>
            )
          }
          {
            sonarTimer === 0 && playing && <Button primary style={{ padding: '0.8em' }} onClick={this.showAllPlayersLatestLocation}> send sonar </Button>
          }
          {
            sonarTimer !== 0 && 'sonar active for ' + sonarTimer + ' seconds'
          }
          {
            imTagger && playing && <Button primary style={{ padding: '0.8em' }} onClick={this.tagPlayer}>Tag</Button>
          }

          {
            imTagged && (
              <p>
                {`please wait till the game has finished.. loser`}
              </p>
            )
          }
        </Box>
      )
    }
  }
}

const mapStateToProps = ({ user }) => ({
  user
})

export default connect(mapStateToProps)(InGame)
