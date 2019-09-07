import { CREATED_MATCH, JOINED_MATCH, GET_MATCH, PLAY_GAME } from '../actions/match'

const initialState = false

export default (state = initialState, { type, payload }) => {
  switch (type) {

    case CREATED_MATCH:
      return { ...state, id: payload }

    case JOINED_MATCH:
      return { ...state, id: payload }

    case GET_MATCH:
      return { ...state, ...payload }

    case PLAY_GAME:
      return { ...state, inGame: true }
    default:
      return state
  }
}
