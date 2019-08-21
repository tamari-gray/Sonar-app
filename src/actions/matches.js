import { db } from "../firebase";

export const GET_MATCHES = 'GET_MATCHES'
export const CREATED_MATCH = 'CREATED_MATCH'

export function createMatch(creatorName, creatorId, matchName, password) {
  return dispatch => {
    const newMatch = db.ref('matches').push()
    newMatch.set({
      creatorName,
      creatorId,
      matchName,
      password,
      matchId: newMatch.key
    })
      .then(() => {
        db.ref('matches').once('value', snapshot => {
          dispatch({
            type: CREATED_MATCH,
            payload: newMatch.key
          })
        })
      })
  }
}


export function getMatches() {
  return dispatch => db.ref('matches').on('value', (snapshot) => {
  dispatch({
    type: GET_MATCHES,
    payload: snapshot.val()
  })
})
}