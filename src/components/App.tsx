import React from 'react'
import { Grommet } from 'grommet'
import grommet from 'grommet/themes'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

import SignUp from './Auth/SignUp'
import Login from './Auth/Login'
import Profile from './Profile'

const App: React.FC = () => {
  return (
    <Grommet theme={grommet}>
      <Router>
        <Switch>
          <Route path="/signUp" exact component={SignUp} />
          <Route path="/login" exact component={Login} />
          <Route path="/profile" exact component={Profile} />
        </Switch>
      </Router>
    </Grommet>
  )
}

export default App;
