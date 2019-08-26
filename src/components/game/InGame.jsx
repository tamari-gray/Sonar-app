import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Box, Button } from 'grommet';
import { Redirect } from 'react-router-dom';
import { getMatch, playGame } from '../../actions/match';

class InGame extends Component {
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

  playGame = () => {
    this.props.dispatch(playGame(this.props.match.matchId))
    this.setState({
      play: true
    })
  }

  render() {
    const { match } = this.props

    return (
      <Box align="center">
        
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
