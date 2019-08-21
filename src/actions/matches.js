import { db } from "../firebase";

export const GET_MATCHES = 'GET_MATCHES'

export function createMatch(creatorName, creatorId, matchName, password) {
  return dispatch => db.ref('matches').push().set({
    creatorName,
    creatorId,
    matchName,
    password
  })
}

export function getMatches() {
  return dispatch => db.ref('matches').on('value', (snapshot) => {
    dispatch({
      type: GET_MATCHES,
      payload: snapshot.val()
    })
  })
}