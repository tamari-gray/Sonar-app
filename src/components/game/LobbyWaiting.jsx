import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Box, Button } from 'grommet';
import { Link } from 'react-router-dom';
import { getMatch } from '../../actions/match';

class LobbyWaiting extends Component {
  state = {
    creator: false
  }

  componentDidMount(){
    this.props.dispatch(getMatch(this.props.match.matchId))
  }

  checkCreator = () => {
    // if (this.props.user.UID === this.props.match.creatorId) {
    //   this.setState({
    //     creator: true
    //   })
    // } else {
    //   this.setState({
    //     creator: false
    //   })
    // }
  }

  render() {
    // this.checkCreator()
    return (
      <Box align="center">
        players:
        {
          // this.props.match.players.map(player => {
          //   return <h4>{player[0]}</h4>
          // })
          console.log(this.props)
        }
        {
          this.state.creator && <Button as={Link} path={`/game/${this.props.match.matchId}`} label="Play!" primary />
        }
      </Box>

    )
  }
}

const mapStateToProps = ({ match, user }) => ({
  match,
  user
})

export default connect(mapStateToProps  )(LobbyWaiting)
