import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom';
import routes from '../../routes';

export class FinishedGame extends Component {
  render() {
    return (
      <div>
        GAME FINISHED
        <Link to={routes.PROFILE}>
          go home
        </Link>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  
})

const mapDispatchToProps = {
  
}

export default connect(mapStateToProps, mapDispatchToProps)(FinishedGame)
