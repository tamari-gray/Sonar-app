import { combineReducers } from 'redux'
import user from './user'
import match from './match'
import matches from './matches'

export default combineReducers({
  user,
  match,
  matches
})