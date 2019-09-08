import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link, Redirect } from "react-router-dom"
import { Box, FormField, TextInput, Form, Button } from "grommet"
import { createAccount } from '../../actions/user';

class SignUp extends Component {

  state = {
    username: '',
    email: '',
    password: ''
  }

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  handleSubmit = (e) => {
    e.preventDefault()
    this.props.dispatch(createAccount(this.state))
  }

  render() {
    const { email, password, username } = this.state
    if (this.props.authed !== null) {
      return <Redirect to='/profile' />
    } else {
      return (
        <Box
          align="center"
          pad="large"
        >
          <h2>
            Welcome to sonar
        </h2>
          <Box
            pad="medium"
            border={{ color: 'brand', size: 'large' }}
            elevation="medium"
            round="large"
          >
            <Form
              style={{ margin: '1.5em 1.5em 0 1.5em ' }}
              onSubmit={this.handleSubmit}
            >
              <FormField >
                <TextInput
                  placeholder="email"
                  name="email"
                  onChange={this.handleChange}
                  value={email}
                />
              </FormField>
              <FormField required={true}>
                <TextInput
                  placeholder="user name"
                  name="username"
                  value={username}
                  onChange={this.handleChange}
                />
              </FormField>
              <FormField >
                <TextInput
                  placeholder="password"
                  type="password"
                  name="password"
                  onChange={this.handleChange}
                  value={password}
                />
              </FormField>
              <Box direction="row" justify="center" margin={{ top: "large" }}>
                <Button type="submit" primary label="Sign up" />
              </Box>
            </Form>
            <Box direction="row" justify="center">
              <p>Already have an account? <Link to="/login">Login here</Link></p>
            </Box>
          </Box>
        </Box>
      )
    }
  }
}

const mapStateToProps = ({ user }) => ({
  authed: user
})

export default connect(mapStateToProps)(SignUp)
