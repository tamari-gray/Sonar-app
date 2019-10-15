import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
// import * as geofirex from 'geofirex'
import {
  GeoCollectionReference,
  GeoFirestore,
  GeoQuery,
  GeoQuerySnapshot
} from "geofirestore";

const firebaseConfig = {
  apiKey: "AIzaSyCUu8zzfotKZNvfQcXRQm2LMX7xwMRCyRg",
  authDomain: "sonar-2664d.firebaseapp.com",
  databaseURL: "https://sonar-2664d.firebaseio.com",
  projectId: "sonar-2664d",
  storageBucket: "sonar-2664d.appspot.com",
  messagingSenderId: "85025589952",
  appId: "1:85025589952:web:772471903454f716"
};
firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();
export const db = firebase.firestore();
// export const geo = geofirex.init(firebase)
export const geoDb = new GeoFirestore(db);
