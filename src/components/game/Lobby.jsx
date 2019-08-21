import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Box, Form, FormField, Button } from 'grommet';
import { createMatch } from '../../actions/matches';
import { Link, Redirect } from 'react-router-dom';

class Lobby extends Component {
  state = {
    name: '',
    password: '',
    games: [
      {
        creator: 'tam',
        id: 438742380,
        players: 5,
        private: true
      },
      {
        creator: 'Bee',
        id: 483920,
        players: 2,
        private: false
      },
      {
        creator: 'Pete',
        id: 65904,
        players: 3,
        private: false
      },
      {
        creator: 'jerry',
        id: 584058490,
        players: 6,
        private: true
      }
    ]
  }

  handleInput = e => this.setState({ [e.target.name]: e.target.value })

  handleSubmit = e => {
    e.preventDefault()
    const { dispatch, user: { firstName, UID } } = this.props
    const { name, password } = this.state
    dispatch(createMatch(firstName, UID, name, password))
  }

  render() {
    const { id } = this.props.match
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
              this.state.games.map(game => {
                return <Box
                  pad="small"
                  border={{ color: 'primary', size: 'large' }}
                  elevation="small"
                  round="large"
                  width="medium"
                  align="center"
                  direction="row-responsive"
                  style={{ marginTop: '1.5em' }}
                >
                  <h3>{"created by " + game.creator} <br />
                    {'  players = ' + game.players} <br />
                    {
                      game.private && 'private'
                    }
                  </h3>
                  <Button as={Link} to={`/lobby/${game.id}`} primary label="Join" />
                </Box>
              })
            }
          </Box>
        </Box>
      )
    }
  }
}

const mapStateToProps = ({ user, match }) => ({
  user,
  match
})

export default connect(mapStateToProps)(Lobby)
