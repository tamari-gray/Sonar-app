import { GET_MATCHES } from '../actions/matches'

const initialState = null

export default (state = initialState, { type, payload }) => {
  switch (type) {

  case GET_MATCHES:
    return payload

  default:
    return state
  }
}
