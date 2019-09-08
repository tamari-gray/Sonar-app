import { db } from "../firebase"
import { GET_MATCH } from "./match"

export const GET_MATCHES = 'GET_MATCHES'
export const GOT_NO_MATCHES = 'GOT_NO_MATCHES'

// export function getMatches(id) {
//   return dispatch => db.ref('matches').on('value', (snapshot) => {
//     let matches = false
//     if (snapshot.val() !== null) {
//       matches = Object.values(snapshot.val())
//     }
//     if (matches) {
//       matches.forEach((match) => {
//         const players = Object.values(match.players)
//         let playerLocations = []
//         if (match.playerLocations) {
//           playerLocations = Object.values(match.playerLocations)
//         }
//         const alreadyJoined = players.find(player => player.playerId === id)
//         match.players = players
//         match.playerLocations = playerLocations
//         if (alreadyJoined) {
//           dispatch({
//             type: GET_MATCH,
//             payload: match
//           })
//         } else {
//           dispatch({
//             type: GET_MATCHES,
//             payload: snapshot.val()
//           })
//         }
//       })
//     }
//   })
// }