import { db } from "../firebase"
import { JOINED_MATCH } from "./match"

export const GET_MATCHES = 'GET_MATCHES'
export const GOT_NO_MATCHES = 'GOT_NO_MATCHES'

export function getMatches(id) {
  return dispatch => db.ref('matches').on('value', (snapshot) => {
    let matches
    if (snapshot.val() !== null) {
      matches = Object.values(snapshot.val())
    }
    if (matches) {
      matches.forEach((match) => {
        const players = Object.values(match.players)
        const alreadyJoined = players.find(player => player.playerId === id)
        if (alreadyJoined) {
          dispatch({
            type: JOINED_MATCH,
            payload: match.matchId
          })
        } else {
          dispatch({
            type: GET_MATCHES,
            payload: snapshot.val()
          })
        }
      })
    }
  })
}