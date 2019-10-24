import React, { Component } from "react";
import { Button, Box, Heading } from "grommet";
import { Close } from "grommet-icons";

export default class alert extends Component {
  render() {
    const style = {
      width: "80vw",
      height: "100%"
    };
    return (
      <Box direction="row" style={style}>
        <Heading level={3} size="medium">
          {this.props.message}
        </Heading>
        <Button
          hoverIndicator="light-1"
          onClick={() => {
            // hide alert
            // propogate callback function from parent component?
          }}
        >
          <Box pad="small" direction="row" align="center" gap="small">
            <Close />
          </Box>
        </Button>
      </Box>
    );
  }
}
