import { db } from "../firebase"

export const CREATED_MATCH = 'CREATED_MATCH'
export const JOINED_MATCH = 'JOINED_MATCH'
export const GET_MATCH = 'GET_MATCH'
export const PLAY_GAME = 'PLAY_GAME'

export function playGame(id) {
  return dispatch => {
    db.ref('/matches/' + id)
      .update({ inGame: true })
      .catch(err => console.log(err.message))
  }
}

