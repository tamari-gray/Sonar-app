import React, { Component } from "react";
import { Box, Text } from "grommet";

export class Rules extends Component {
  render() {
    return (
      <>
        <h1 style={{ textAlign: "center" }}> How to play</h1>
        <Box
          pad="large"
          border={{ color: "brand", size: "large" }}
          align="start"
          round="large"
          elevation="medium"
          gap="small">
          <Text size="small">Its hide and go seek tag. </Text>
          <Text size="small">Someone will be randomly chosen as the tagger </Text>
          <Text size="small">When you are tagged, you become a tagger 0.o </Text>
          <Text size="small">Last person to get tagged wins!</Text>
        </Box>

        <Box direction="row" align="start" gap="small" justify="between" style={{paddingBottom: "1em"}}>
          <div >
            <h1 style={{ textAlign: "center" }}>Tagger</h1>
            <Box
              border={{ color: "brand", size: "large" }}
              pad="small" round  >
              <Text size="small">Tag anyone within 2m of you.</Text>
              <Text size="small">Watch the map for player sonars</Text>
            </Box>
          </div>

          <div>
            <h1 style={{ textAlign: "center" }}>Player</h1>
            <Box
              border={{ color: "brand", size: "large" }}
              pad="small" align="center" round >
              <Text size="small">
                Send a sonar to see where the taggers are! But...
            </Text>
              <Text size="small">..They will also see your position too</Text>
            </Box>
          </div>
        </Box>
      </>
    );
  }
}

export default Rules;
