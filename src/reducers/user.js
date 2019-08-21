import { GET_USER, GET_USER_INFO } from '../actions/user'

const initialState = null

export default (state = initialState, { type, payload }) => {
  switch (type) {
    case GET_USER:
      return { UID: payload, ...state  }
    case GET_USER_INFO:
      return { ...state, ...payload }
    default:
      return state
  }
}
