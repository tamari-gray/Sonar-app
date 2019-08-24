// TODO: check if inGame is true then redirect

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Box, Button } from 'grommet';
import { Redirect } from 'react-router-dom';
import { getMatch, playGame } from '../../actions/match';

class LobbyWaiting extends Component {
  state = {
    play: false
  }

  componentDidMount() {
    console.log('mounted')
    if (this.props.match.id) {
      this.props.dispatch(getMatch(this.props.match.id))
    }
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

  handleRedirect = () => {
    this.props.dispatch(playGame(this.props.match.matchId))
    this.setState({
      play: true
    })
  }

  render() {
    const { match, match: { matchId, inGame } } = this.props

    if (this.state.play || inGame) {
      return <Redirect to={`/playing/${matchId}`} />
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
