import { db } from "../firebase"
import { GeoFire } from 'geofire'

export const CREATED_MATCH = 'CREATED_MATCH'
export const JOINED_MATCH = 'JOINED_MATCH'
export const GET_MATCH = 'GET_MATCH'
export const PLAY_GAME = 'PLAY_GAME'

export function createMatch(creatorName, creatorId, matchName, password) {
  return dispatch => {
    const newMatch = db.ref('matches').push()
    newMatch.set({
      creatorName,
      creatorId,
      matchName,
      password,
      matchId: newMatch.key,
      inGame: false
    })
      .then(() => {
        const newPlayer = db.ref('/matches/' + newMatch.key).child('players').push()
        newPlayer.set({
          playerId: creatorId,
          name: creatorName
        })
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

export function joinMatch(matchId, playerId, playerName) {
  return dispatch => {
    const newPlayer = db.ref('/matches/' + matchId).child('players').push()
    newPlayer.set({
      playerId,
      name: playerName
    })
      .then(() => {
        dispatch({
          type: JOINED_MATCH,
          payload: matchId
        })
      })
  }
}

export function getMatch(matchId) {
  return dispatch => {
    db.ref('/matches/' + matchId).on('value', snapshot => {
      dispatch({
        type: GET_MATCH,
        payload: snapshot.val()
      })
    })
    db.ref('/matches/' + matchId).on('child_changed', snapshot => {
      dispatch({
        type: GET_MATCH,
        payload: snapshot.val()
      })
    })
  }
}

export function playGame(id) {
  return dispatch => {
    db.ref('/matches/' + id)
      .update({ inGame: true })
      .catch(err => console.log(err.message))
  }
}

export function setLocation(matchId, userId, { lat, lng }) {
  return dispatch => {
    const ref = db.ref(`matches/${matchId}/playerLocations`)
    const geo = new GeoFire(ref)
    geo.set({
      [userId]: [lat, lng]
    })
  }
}