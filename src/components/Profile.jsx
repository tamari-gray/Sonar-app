import React, { Component } from 'react'
import { Box, Button } from 'grommet';
import { connect } from 'react-redux'
import { getUser } from '../actions/user'
import { Link } from 'react-router-dom';

class Profile extends Component {
  state = {}

  componentDidMount() {
    this.props.dispatch(getUser(this.props.user.UID))
  }

  render() {
    const { username } = this.props.user
    return (
      <Box
        justify="center"
        align="center"
        style={{ paddingLeft: '1em', paddingRight: '1em' }}

      >
        <h1> {`Welcome ${username}`} </h1>
        <Box
          round="small"
          border={{ color: 'brand', size: 'large' }}
          pad="medium"
          style={{ paddingLeft: '1em', paddingRight: '1em' }}
        >
          <div >

            <h2>How to play</h2>
            <p >
              Its hide and go seek!.. <br />

              Choose your class and use your abilities to survive from the tagger for 10 minutes to win!
            </p>
          </div>
          <p >
            <span style={{ fontWeight: 'bold' }}>
              Tagger: </span> <br /> Can use a sonar to see everyones latest position. <br/>TAG ANYONE WITHIN 15m of you
          </p>
          <p> <span style={{ fontWeight: 'bold' }}>Defuser: </span> <br /> Can cancel 5 sonars per game</p>
          <p> <span style={{ fontWeight: 'bold' }}>Snitch: </span> <br /> Can give other players position away to tagger 3 times per game </p>
          <p> <span style={{ fontWeight: 'bold' }}>Joker: </span> <br /> Can give away a fake position for up to 90 seconds. can use it 2 times per game </p>
          <Button as={Link} to="/lobby" primary label="play" />
        </Box>
      </Box>
    )
  }
}
const mapStateToProps = ({ user }) => ({
  user
})

export default connect(mapStateToProps)(Profile)

