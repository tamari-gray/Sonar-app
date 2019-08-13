import React, { Component } from 'react'
import { Box, Button } from 'grommet';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux'

class Profile extends Component {
  state = {}

  render() {
    return (
      <Box>
        <Box>
          user profile: {
            this.props.user
          }
        </Box>
        <Link to="/play">
          <Button primary label="play"/>
        </Link>
      </Box>
    )
  }
}
const mapStateToProps = (state) => ({
  user: state.user
})

export default connect(mapStateToProps)(Profile)

