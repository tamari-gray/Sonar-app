import React from 'react'
import { Grommet } from 'grommet'
import grommet from 'grommet/themes'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

import SignUp from './Auth/SignUp'
import Login from './Auth/Login'
import Profile from './Profile'
import Lobby from './game/Lobby'
import InGame from './game/InGame'

const App: React.FC = () => {
  return (
    <Grommet theme={grommet}>
      <Router>
        <Switch>
          <Route path="/signUp" exact component={SignUp} />
          <Route path="/login" exact component={Login} />
          <Route path="/profile" exact component={Profile} />
          <Route path="/lobby" exact component={Lobby} />
          <Route path="/game/:matchId" exact render={routeProps =>
            <InGame matchId={routeProps.match.params.matchId}/>
          } />
        </Switch>
      </Router>
    </Grommet>
  )
}

export default App;
