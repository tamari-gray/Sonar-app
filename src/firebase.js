import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import { GeoFirestore } from "geofirestore";

const config = {
  apiKey: process.env.REACT_APP_FB_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_DB_URL,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID
}

firebase.initializeApp(config);

export const auth = firebase.auth();
export const db = firebase.firestore();
export const geoDb = new GeoFirestore(db);

export function matchRef(matchId) {
  return geoDb.collection("matches").doc(matchId);
}

export function finishedMatchRef(matchId) {
  return db.collection("finishedMatches").doc(matchId);
}

export function playerRef(matchId, userId) {
  return geoDb
    .collection("matches")
    .doc(matchId)
    .collection("players")
    .doc(userId);
}

export function playerRefExists(matchId, userId) { 
  let exists = false
  geoDb
    .collection("matches")
    .doc(matchId)
    .collection("players")
    .doc(userId)
    .get()
    .then(doc => {
      doc.exists ? exists = true : exists = false
    })
    .catch(e => console.log(`error checking if playersRef exists ${e}`))

    return exists
}
export function playersRef(matchId) {
  return geoDb
    .collection("matches")
    .doc(matchId)
    .collection("players");
}

export function sonardPlayersRef(matchId) {
  return geoDb
    .collection("matches")
    .doc(matchId)
    .collection("sonardPlayers");
}

export function taggedPlayersRef(matchId) {
  return geoDb
    .collection("matches")
    .doc(matchId)
    .collection("taggedPlayers");
}

// check if doc exists
export function docExists(docRef) {
  let exists = false
  docRef.get().then((doc) => {
    if(doc.exists) exists = true
  })
  .catch(e => `error, document doesnt exist`)

  return exists
}
