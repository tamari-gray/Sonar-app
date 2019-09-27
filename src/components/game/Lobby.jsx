import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Box, Form, FormField, Button } from 'grommet'
import { Redirect } from 'react-router-dom'
import { db } from '../../firebase';

class Lobby extends Component {
  state = {
    name: '',
    password: '',
    redirect: false,
    matches: [],
    matchId: false
  }

  componentDidMount() {
    if (this.props.user.UID) {
      this.getMatches(this.props.user.UID)
    }
  }

  componentWillUnmount() {
    // cancel get matches 
  }

  getMatches = (userId) => {
    db.collection('matches')
      .onSnapshot(snapshot => {
        const matches = []
        snapshot.forEach(doc => {
          const players = []
          doc.ref.collection('players').get().then((querySnap) => {
            querySnap.forEach((snap) => {
              // check if user has already joined a match
              if (snap.data().id === userId) {
                this.setState({ matchId: doc.ref.id })
              }
              players.push(snap.data())
            })
          })
          if (!doc.data().playing) {
            matches.push({ matchId: doc.ref.id, admin: doc.data().admin, players })
          }
        })
        this.setState({ matches })
      })
  }

  createMatch = (userId, username) => {
    db.collection('matches').add({
      admin: { id: userId, name: username },
      name: this.state.name,
      password: this.state.password,
      waiting: true
    })
      .then((docRef) => {
        db.collection('matches').doc(docRef.id).collection('players')
          .add({ id: userId, name: username })
          .then(() => this.setState({ matchId: docRef.id }))
          .catch(e => console.log(`Error adding ${username} to match. ${e}`))
      })
      .catch((e) => console.error(`Error setting ${username} as admin of match. ${e}`))
  }

  joinMatch = (matchId, userId, username) => {
    db.collection('matches').doc(matchId).collection('players')
      .add({ id: userId, name: username })
      .then(() => this.setState({ matchId }))
      .catch(e => console.log(`Error joining match. ${e}`))
  }

  handleInput = e => this.setState({ [e.target.name]: e.target.value })

  handleSubmit = e => {
    e.preventDefault()
    this.createMatch(this.props.user.UID, this.props.user.username)
  }

  render() {
    const { user: { UID, username } } = this.props
    const { matches, matchId } = this.state

    if (matchId) {
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
                    {game.name} <br />
                    {"created by " + game.admin.name} <br />
                    {/* {game.players.length + " players joined"} */}
                  </h3>
                  <Button onClick={() => this.joinMatch(game.matchId, UID, username)} primary label="Join" />
                </Box>
              })
            }
          </Box>
        </Box>
      )
    }
  }
}

const mapStateToProps = ({ user }) => ({
  user
})

export default connect(mapStateToProps)(Lobby)