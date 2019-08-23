import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Box, Form, FormField, Button } from 'grommet'
import { getMatches } from '../../actions/matches'
import { createMatch, joinMatch } from '../../actions/match'
import { Link, Redirect } from 'react-router-dom'

class Lobby extends Component {
  state = {
    name: '',
    password: ''
  }

  componentDidMount() {
    this.props.dispatch(getMatches())
  }

  handleInput = e => this.setState({ [e.target.name]: e.target.value })

  handleSubmit = e => {
    e.preventDefault()
    const { dispatch, user: { firstName, UID } } = this.props
    const { name, password } = this.state
    dispatch(createMatch(firstName, UID, name, password))
  }

  render() {
    const { match: { id }, matches, dispatch, user: { UID, firstName } } = this.props
    if (id) {
      return <Redirect to={`lobby/${id}`} />
    } else {
      return (
        <Box
          direction="column"
          justify="center"
          align="center"
          pad="xlarge"
          gap="large"
        >
          <h1>Create a game</h1>
          <Box
            pad="medium"
            border={{ color: 'brand', size: 'large' }}
            elevation="medium"
            round="large"
            width="medium"
            align="center"
          >
            <Form
              style={{ margin: '1.5em 1.5em 0 1.5em ' }}
              onSubmit={this.handleSubmit}
            >
              <FormField name="name" label="Match name" onChange={this.handleInput} />
              <FormField type="password" name="password" label="password" onChange={this.handleInput} />
              <Button type="submit" primary label="Create game" />
            </Form>
          </Box>
          <Box width="medium" align="center" >
            <h1>Join a game</h1>
            {
              matches && matches.map(game => {
                return <Box
                  key={game.matchId}
                  pad="small"
                  border={{ color: 'primary', size: 'large' }}
                  elevation="small"
                  round="large"
                  width="medium"
                  align="center"
                  direction="row-responsive"
                  style={{ marginTop: '1.5em' }}
                >
                  <h3>
                    {game.name} <br />
                    {"created by " + game.creatorName} <br />
                    {'  players = ' + Object.keys(game.players).length} <br />
                  </h3>
                  <Button as={Link} onClick={() => dispatch(joinMatch(game.matchId, UID, firstName))} primary label="Join" />
                </Box>
              })
            }
          </Box>
        </Box>
      )
    }
  }
}

const mapStateToProps = ({ user, match, matches }) => ({
  user,
  match,
  matches
})

export default connect(mapStateToProps)(Lobby)