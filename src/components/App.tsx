import React from 'react'
import { Grommet } from 'grommet'
import grommet from 'grommet/themes'
import AuthForm from './AuthForm'
const App: React.FC = () => {
  return (
    <Grommet theme={grommet}>
      <AuthForm/>
    </Grommet>
  )
}

export default App;
