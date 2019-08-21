import { GET_MATCHES } from '../actions/matches'

const initialState = null

export default (state = initialState, { type, payload }) => {
  switch (type) {

    case GET_MATCHES:
      return payload ? Object.values(payload) : null

    default:
      return state
  }
}
