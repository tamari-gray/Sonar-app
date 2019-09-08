/*TODO:

- [] check if player has joined match => redirect
- [] create match
- [] join match

*/

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Box, Form, FormField, Button } from 'grommet'
import { getMatches } from '../../actions/matches'
import { createMatch, joinMatch } from '../../actions/match'
import { Redirect } from 'react-router-dom'
import { db } from '../../firebase';

class Lobby extends Component {
  state = {
    name: '',
    password: '',
    redirect: false,
    matches: [],
    joined: false
  }

  componentDidMount() {
    // if (this.props.user.UID) {lobby
    //   this.props.dispatch(getMatches(this.props.user.UID))      
    // }

    db.collection('matches').onSnapshot(snapshot => {
      const matches = []
      snapshot.forEach(doc => {
        const players = []
        doc.ref.collection('players').get().then((querySnap) => {
          querySnap.forEach((snap) => {

            // check if user has already joined a match
            if (snap.data().id === this.props.user.UID) {
              this.setState({ joined: true })
            }
            players.push(snap.data())
          })
        })
        matches.push({ admin: doc.data().admin, players })
      })

      this.setState({ matches })
    })
  }

  handleInput = e => this.setState({ [e.target.name]: e.target.value })

  handleSubmit = e => {
    e.preventDefault()
    // const { dispatch, user: { firstName, UID } } = this.props
    // const { name, password } = this.state
    // dispatch(createMatch(firstName, UID, name, password))
  }

  render() {
    const { match: { matchId }, dispatch, user: { UID, username } } = this.props
    const { matches } = this.state

    if (matchId || this.state.joined) {
      return <Redirect to={`game/${matchId}`} />
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
                  <h3 style={{ margin: "auto" }}>
                    {"created by " + game.admin} <br />
                    {game.players.length + " players joined"}
                  </h3>
                  <Button onClick={() => dispatch(joinMatch(game.matchId, UID, firstName))} primary label="Join" />
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