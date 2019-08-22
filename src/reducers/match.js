import { CREATED_MATCH, JOINED_MATCH } from '../actions/match'

const initialState = false

export default (state = initialState, { type, payload }) => {
  switch (type) {

    case CREATED_MATCH:
      return { id: payload }

    case JOINED_MATCH:
      return { id: payload }

    default:
      return state
  }
}
