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
         <h1>Players</h1>
        {
            match.players && Object.values(match.players).map(player => {
              return <Box
                border={{ color: 'primary', size: 'large' }}
                key={player.playerId}
                pad="x-small"
                elevation="small"
                round="large"
                style={{ margin: '1em' }}
                width="small"
                align="center"

              >
                <h4> {player.name} </h4>
              </Box>
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
