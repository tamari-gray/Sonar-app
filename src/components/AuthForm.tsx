import React, { Component } from "react";
import { Grommet, Box, FormField, TextInput } from "grommet";
import { grommet } from "grommet/themes"

export default class FormFieldTextInput extends Component {
  state = {
    email: '',
    password: ''
  }

  handleChange = (e: any) => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  render() {
    const { email, password } = this.state
    return (
      <Grommet theme={grommet}>
        <Box align="center" pad="large">
          <FormField label="Email">
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
        </Box>
      </Grommet>
    )
  }
}