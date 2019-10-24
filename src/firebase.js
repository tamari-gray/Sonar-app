import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import { GeoFirestore } from "geofirestore";

// const firebaseConfig = {
//   apiKey: "AIzaSyCUu8zzfotKZNvfQcXRQm2LMX7xwMRCyRg",
//   authDomain: "sonar-2664d.firebaseapp.com",
//   databaseURL: "https://sonar-2664d.firebaseio.com",
//   projectId: "sonar-2664d",
//   storageBucket: "sonar-2664d.appspot.com",
//   messagingSenderId: "85025589952",
//   appId: "1:85025589952:web:772471903454f716"
// };

const tamarimon97FirebaseConfig = {
  apiKey: "AIzaSyBbTgM4qYDd9FxzKLZATux-i4Cz1tMoUb8",
  authDomain: "sonar-a3366.firebaseapp.com",
  databaseURL: "https://sonar-a3366.firebaseio.com",
  projectId: "sonar-a3366",
  storageBucket: "sonar-a3366.appspot.com",
  messagingSenderId: "591806355157",
  appId: "1:591806355157:web:34c9c60179e68488"
};
firebase.initializeApp(tamarimon97FirebaseConfig);

export const auth = firebase.auth();
export const db = firebase.firestore();
export const geoDb = new GeoFirestore(db);

export function matchRef(matchId) {
  return geoDb.collection("matches").doc(matchId);
}

export function finishedMatchRef(matchId) {
  return geoDb.collection("finishedMatches").doc(matchId);
}

export function thisUserRef(matchId, userId) {
  return geoDb
    .collection("matches")
    .doc(matchId)
    .collection("players")
    .doc(userId);
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
    .doc(this.props.matchId)
    .collection("taggedPlayers");
}
