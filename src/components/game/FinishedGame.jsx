import React, { Component } from 'react'
import { connect } from 'react-redux'

export class FinishedGame extends Component {
  render() {
    return (
      <div>
        GAME FINISHED
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  
})

const mapDispatchToProps = {
  
}

export default connect(mapStateToProps, mapDispatchToProps)(FinishedGame)
