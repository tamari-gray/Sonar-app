import React from 'react'
import { Grommet } from 'grommet'
import grommet from 'grommet/themes'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

import SignUp from './Auth/SignUp'
import Login from './Auth/Login'
import Profile from './Profile'
import Lobby from './game/Lobby'

const App: React.FC = () => {
  return (
    <Grommet theme={grommet}>
      <Router>
        <Switch>
          <Route path="/signUp" exact component={SignUp} />
          <Route path="/login" exact component={Login} />
          <Route path="/profile" exact component={Profile} />
          <Route path="/lobby" exact component={Lobby} />
          <Route path="/lobby/:gameId" exact component={Lobby} />
        </Switch>
      </Router>
    </Grommet>
  )
}

export default App;
