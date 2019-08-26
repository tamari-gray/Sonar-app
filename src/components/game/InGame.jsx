//TODO: register with here => use their maps with leaflet

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Box, Button } from 'grommet'
import { Redirect } from 'react-router-dom'
import { getMatch, playGame } from '../../actions/match'
import { Map, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

class InGame extends Component {
  state = {
    play: false,
    lat: -39.646356,
    lng: 176.862737,
    zoom: 18,
  }

  componentDidMount() {
    if (this.props.match.inGame) {
      this.setState({
        play: true
      })
    }
  }

  checkCreator = () => {
    if (this.props.user) {
      if (this.props.user.UID === this.props.match.creatorId) {
        return true
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
      <Box align="center">
        <Map 
          style={{ height: "480px", width: "100%" }} 
          center={position} 
          zoom={this.state.zoom}>
          <TileLayer
            maxNativeZoom={25}
            maxZoom={25}
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <CircleMarker 
            center={position}
            radius={10}
          >
            <Popup>
              player info
            </Popup>
          </CircleMarker>
          {
            // match.players && match.players.map(player => {
            //   return <CircleMarker
            //     center={player.pos}
            //     radius={0.02}
            //   >

            //   </CircleMarker>
            // })
          }
        </Map>

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
