import React, { Component } from "react"
import { Redirect } from "react-router-dom"
import { Box, FormField, TextInput, Form, Button } from "grommet"


import withFirebaseAuth from 'react-with-firebase-auth'
import 'firebase/auth';
import { firebaseAppAuth, providers } from '../firebase';

class AuthForm extends Component {
  state = {
    email: '',
    password: '',
  }

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  handleSubmit = (e) => {
    e.preventDefault()
    this.props.signInWithEmailAndPassword(this.state.email, this.state.password)
      .catch(function (error) {
        console.log(error.code)
        console.log(error.message)
      })
  }


  render() {
    const { email, password } = this.state
    const { signInWithGoogle, user } = this.props
    if (user) {
      return <Redirect to="/profile" />
    } else {
      return (
        <Box
          align="center"
          pad="large"
        >
          <h2>
            Welcome to sonar
        </h2>
          <Form
            onSubmit={this.handleSubmit}
          >
            <FormField label="Email" required={true}>
              <TextInput
                name="email"
                placeholder="email@email.com"
                value={email}
                onChange={this.handleChange}
              />
            </FormField>
            <FormField label="Password">
              <TextInput
                type="password"
                name="password"
                placeholder="******"
                onChange={this.handleChange}
                value={password}
              />
            </FormField>
            <Box direction="row" justify="between" margin={{ top: "medium" }}>
              <Button type="submit" label="Sign up" />
              <Button type="submit" disabled primary label="Login" />
            </Box>
          </Form>
          <Box margin={{ top: "medium" }} >
            <Button onClick={signInWithGoogle} primary label="Sign in with google" />
          </Box>
        </Box>
      )
    }
  }
}
export default withFirebaseAuth({
  providers,
  firebaseAppAuth,
})(AuthForm)