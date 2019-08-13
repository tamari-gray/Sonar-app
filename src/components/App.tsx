import React from 'react'
import { Grommet } from 'grommet'
import grommet from 'grommet/themes'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

import AuthForm from './AuthForm.jsx'
import Profile from './Profile'

const App: React.FC = () => {
  return (
    <Grommet theme={grommet}>
      <Router>
        <Switch>
          <Route path="/" exact component={AuthForm} />
          <Route path="/profile" exact component={Profile} />
        </Switch>
      </Router>
    </Grommet>
  )
}

export default App;
