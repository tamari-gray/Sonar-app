import React, { Component } from "react"
import { Redirect } from "react-router-dom"
import { Box, FormField, TextInput, Form, Button } from "grommet"

export default class FormFieldTextInput extends Component {
  state = {
    email: '',
    password: '',
    auth: false,
  }

  handleChange = (e: any) => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  handleSubmit = (e: any) => {
    e.preventDefault()
    this.setState({
      auth: true
    })

    // firebase auth
  }

  render() {
    const { email, password, auth } = this.state
    if (auth) {
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
        </Box>
      )
    }
  }
}