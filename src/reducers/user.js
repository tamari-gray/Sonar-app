import { GET_USER, GET_USER_INFO, REMOVE_USER } from '../actions/user'

const initialState = null

export default (state = initialState, { type, payload }) => {
  switch (type) {
    case GET_USER:
      return { UID: payload, ...state  }
    case GET_USER_INFO:
      return { ...state, ...payload }
      case REMOVE_USER:
        return initialState
    default:
      return state
  }
}
