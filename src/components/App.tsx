import React from 'react'
import { Grommet } from 'grommet'
import grommet from 'grommet/themes'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

import SignUp from './Auth/SignUp'
import Login from './Auth/Login'
import Profile from './Profile'
import Lobby from './game/Lobby'
import InGame from './game/InGame'
import routes from '../routes'
import { FinishedGame } from './game/FinishedGame'

const App: React.FC = () => {
  return (
    <Grommet theme={grommet}>
      <Router>
        <Switch> 
          {<Route path={routes.SIGN_UP} exact component={SignUp} />  /* TODO: make redirect from '/' => '/signUp' with auth*/}
          <Route path={'/'} exact component={SignUp} />
          <Route path={routes.LOGIN} exact component={Login} />
          <Route path={routes.PROFILE} exact component={Profile} />
          <Route path={routes.LOBBY} exact component={Lobby} />
          <Route path={routes.GAME} exact render={routeProps =>
            <InGame matchId={routeProps.match.params.matchId}/>
          } />
          <Route path={routes.FINISHED_GAME} exact render={routeProps =>
            <FinishedGame matchId={routeProps.match.params.matchId}/>
          } />
        </Switch>
      </Router>
    </Grommet>
  )
}

export default App;
