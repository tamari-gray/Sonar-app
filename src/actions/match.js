import { db } from "../firebase"

export const CREATED_MATCH = 'CREATED_MATCH'
export const JOINED_MATCH = 'JOINED_MATCH'

export function createMatch(creatorName, creatorId, matchName, password) {
  return dispatch => {
    const newMatch = db.ref('matches').push()
    newMatch.set({
      creatorName,
      matchName,
      password,
      matchId: newMatch.key,
      players: {
        creatorId
      }
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

export function joinMatch(matchId, playerId) {
  return dispatch => {
    const newPlayer = db.ref('/matches/' + matchId + '/players').child('player').push()
      newPlayer.set({
        playerId
      })
        .then(() => {
          dispatch({
            type: JOINED_MATCH,
            payload: matchId
          })
        })
  }
}