import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { store, persistor } from './redux-persist'
import { PersistGate } from "redux-persist/lib/integration/react"

import './index.css';
import App from './components/App';

import * as serviceWorker from './serviceWorker'

require('dotenv').config()

document.addEventListener('DOMContentLoaded', () => {
  render(
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>,
    document.getElementById('root')
  )
})

serviceWorker.unregister()
