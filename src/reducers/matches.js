import { GET_MATCHES, GOT_NO_MATCHES } from '../actions/matches'

const initialState = null

export default (state = initialState, { type, payload }) => {
  switch (type) {

    case GET_MATCHES:
      return payload ? Object.values(payload) : null
    
    case GOT_NO_MATCHES:
      return null

    default:
      return state
  }
}
