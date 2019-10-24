import React, { Component } from "react";
import { Box, Text } from "grommet";

export class Rules extends Component {
  render() {
    return (
      <div>
        <Box
          round="small"
          border={{ color: "brand", size: "large" }}
          pad="medium"
        >
          <div>
            <p>
              Its hide and go seek tag! <br />
              someone will be randomly chosen as the tagger <br />
              when you are tagged, you become a tagger! <br />
              last person standing wins! you still have to get them though..
            </p>
          </div>
        </Box>
        <Box direction="row-responsive">
          <Box pad="large" align="center" background="dark-2" round gap="small">
            <Text>Tagger</Text>
            <Text size="small">Tag anyone within 5m of you. no mercy</Text>
            <Text size="small">watch the map for other players</Text>
          </Box>
          <Box pad="large" align="center" background="dark-2" round gap="small">
            <Text>Player</Text>
            <Text size="small">
              use your sonar to see where the taggers are! But...
            </Text>
            <Text size="small">...they will also see your position too</Text>
          </Box>
        </Box>
      </div>
    );
  }
}

export default Rules;
