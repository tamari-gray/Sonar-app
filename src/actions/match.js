import { db } from "../firebase"
import { GeoFire } from 'geofire'

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

// geofire init
let geo

export function setLocation(matchId, { firstName, userId}, { lat, lng }) {
  return dispatch => {
    const ref = db.ref(`matches/${matchId}/playerLocations`)
    geo = new GeoFire(ref)
    geo.set({
      [userId]: [lat, lng],
    })
  }
}

export function getLocations(radius, {lat , lng}){
  return dispatch => {
    let geoQuery = geo.query({
      center: [lat, lng],
      radius
    })
  }
}

