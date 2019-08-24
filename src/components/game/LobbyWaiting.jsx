// TODO: post to firebase 

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Box, Button } from 'grommet';
import { Redirect } from 'react-router-dom';
import { getMatch } from '../../actions/match';

class LobbyWaiting extends Component {
  state = {
    play: false
  }

  checkCreator = () => {
    if (this.props.user) {
      if (this.props.user.UID === this.props.match.creatorId) {
        return true
      }
    }
  }

  handleRedirect = () => {
    this.setState({
      play: true
    })
  }

  render() {
    const { match, match: { id } } = this.props
    if (id) {
      this.props.dispatch(getMatch(id))
    }
    if (this.state.play) {
      return <Redirect to={`/playing/${id}`} />
    } else {
      return (
        <Box align="center">
          players:
        {
            match.players && Object.values(match.players).map(player => {
              return <h4 key={player.playerId}> {player.name} </h4>
            })
          }
          {
            this.checkCreator() && <Button onClick={this.handleRedirect} label="Play!" primary />
          }
        </Box>

      )
    }
  }
}

const mapStateToProps = ({ match, user }) => ({
  match,
  user
})

export default connect(mapStateToProps)(LobbyWaiting)
