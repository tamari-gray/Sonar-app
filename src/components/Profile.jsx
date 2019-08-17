import React, { Component } from 'react'
import { Box, RoutedButton } from 'grommet';
import { connect } from 'react-redux'
import { getUser } from '../actions/user'

class Profile extends Component {
  state = {}

  componentDidMount() {
    // this.props.dispatch(getUser(this.props.user.UID))
  }

  render() {
    return (
      <Box align="center">
        <Box>
          user profile page <br />
          {this.props.user}
        </Box>
        <RoutedButton path="/lobby" primary label="play" />
      </Box>
    )
  }
}
const mapStateToProps = ({ user }) => ({
  user
})

export default connect(mapStateToProps)(Profile)

