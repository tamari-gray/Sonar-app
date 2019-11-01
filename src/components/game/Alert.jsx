import React, { Component } from "react";
import { Button, Box, Heading } from "grommet";
import { Close } from "grommet-icons";

export default class Alert extends Component {
  componentDidMount = () => {
    if (this.props.timer) {
      
    }
  }
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
          onClick={() => this.props.clear()}
        >
          <Box pad="small" direction="row" align="center" gap="small">
            <Close />
          </Box>
        </Button>
      </Box>
    );
  }
}
