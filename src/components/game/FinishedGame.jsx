import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import routes from '../../routes'
import { Box } from 'grommet'
import { db, geo } from '../../firebase'

export class FinishedGame extends Component {
  state = {
    winners: []
  }

  getWinners = () => {
    // connect to firebase
    // db.collection(this.props.matchId)

    // check if everyone was tagged
      // tagger = winner

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

export default connect(mapStateToProps, mapDispatchToProps)(FinishedGame)
