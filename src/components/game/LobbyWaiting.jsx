import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Box } from 'grommet';

export class LobbyWaiting extends Component {
  state = {
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
      <Box>
        
      </Box>
    )
  }
}

const mapStateToProps = (state) => ({
  
})

const mapDispatchToProps = {
  
}

export default connect(mapStateToProps, mapDispatchToProps)(LobbyWaiting)
