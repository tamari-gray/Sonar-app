import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Box, RoutedButton } from 'grommet';

export class Lobby extends Component {
  state = {
    games: [
      {
        creator: 'tam',
        id: 438742380,
        players: 5,
        private: true
      },
      {
        creator: 'Bee',
        id: 483920,
        players: 2,
        private: false
      },
      {
        creator: 'Pete',
        id: 65904,
        players: 3,
        private: false
      },
      {
        creator: 'jerry',
        id: 584058490,
        players: 6,
        private: true
      }
    ]
  }
  render() {
    return (
      <Box >
        <Box width="medium" alignContent="center" >
          <h1>Join a game</h1>
          {
            this.state.games.map(game => {
              return <Box
                border="all"
                height="small"
                width="medium"small
              >

                <h3>{"created by " + game.creator} <br />
                  {'  players = ' + game.players} <br />
                  {
                    game.private && 'private'
                  }
                </h3>
                <RoutedButton path={`/lobby/${game.id}`} primary label="Join" />
              </Box>
            })
          }
        </Box>
          <h2>Create a game</h2>
          {/* need to create a game on firebase => return doc id => use doc.id as route */}
          {/* <RoutedButton path={`/lobby/${gameId}`} primary label="Create" /> */}
      </Box>
    )
  }
}

const mapStateToProps = (state) => ({

})

const mapDispatchToProps = {

}

export default connect(mapStateToProps, mapDispatchToProps)(Lobby)