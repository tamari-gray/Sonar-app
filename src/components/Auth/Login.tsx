import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from "react-router-dom"
import { Box, FormField, TextInput, Form, Button } from "grommet"

// interface Props {

// }
// interface State {

// }

class Login extends Component<{}> {
  state = {
    email: '',
    password: ''
  }

  handleChange = (e:any) => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  handleSubmit = (e:any) => {
    e.preventDefault()
  }

  render() {
    const { email, password } = this.state

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
            style={{margin: '1.5em 1.5em 0 1.5em '}}
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
            <p>Dont have an account yet? <Link to="/SignUp">Sign Up here</Link></p>
          </Box>
        </Box>
      </Box>
    )
  }
}

export default connect()(Login)
