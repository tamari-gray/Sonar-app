import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Box, Button } from 'grommet';
import { Link } from 'react-router-dom';

class LobbyWaiting extends Component {
  state = {
    gameId: 3289,
    players: [
      'tam',
      'jason',
      'poo',
      'jojo',
      'ralph'
    ]
  }

  render() {
    return (
      <Box align="center">
        players:
        {
          this.state.players.map(player => {
            return <h4>{player}</h4>
          })
        }
        <Button as={Link} path={`/game/${this.state.gameId}`} label="Play!" primary />
      </Box>

    )
  }
}

const mapStateToProps = (state) => ({

})

const mapDispatchToProps = {

}

export default connect(mapStateToProps, mapDispatchToProps)(LobbyWaiting)
