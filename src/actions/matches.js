import { db } from "../firebase";

export const GET_MATCHES = 'GET_MATCHES'

export function getMatches() {
  return dispatch => db.ref('matches').on('value', (snapshot) => {
    dispatch({
      type: GET_MATCHES,
      payload: snapshot.val()
    })
  })
}