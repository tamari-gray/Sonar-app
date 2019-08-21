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
    const { firstName, lastName } = this.props.user
    return (
      <Box align="center">
        <Box>
          <h3> {firstName + ' ' + lastName} </h3>
        </Box>
        <Button as={Link} to="/lobby" primary label="play" /> 
      </Box>
    )
  }
}
const mapStateToProps = ({ user }) => ({
  user
})

export default connect(mapStateToProps)(Profile)

