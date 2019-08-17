import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link, Redirect } from "react-router-dom"
import { Box, FormField, TextInput, Form, Button } from "grommet"
import { createAccount } from '../../actions/user';

class SignUp extends Component {

  state = {
    firstName: '',
    lastName: '',
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
    const { email, password, firstName, lastName } = this.state
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
              <FormField required={true}>
                <TextInput
                  placeholder="first name"
                  name="firstName"
                  value={firstName}
                  onChange={this.handleChange}
                />
              </FormField>
              <FormField >
                <TextInput
                  placeholder="last name"
                  name="lastName"
                  onChange={this.handleChange}
                  value={lastName}
                />
              </FormField>
              <FormField >
                <TextInput
                  placeholder="email"
                  name="email"
                  onChange={this.handleChange}
                  value={email}
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
