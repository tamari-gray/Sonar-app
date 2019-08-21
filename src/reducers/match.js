import { CREATED_MATCH } from '../actions/matches'

const initialState = false

export default (state = initialState, { type, payload }) => {
  switch (type) {

    case CREATED_MATCH:
      return { id: payload }

    default:
      return state
  }
}
