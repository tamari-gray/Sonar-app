import * as firebase from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyCUu8zzfotKZNvfQcXRQm2LMX7xwMRCyRg",
  authDomain: "sonar-2664d.firebaseapp.com",
  databaseURL: "https://sonar-2664d.firebaseio.com",
  projectId: "sonar-2664d",
  storageBucket: "sonar-2664d.appspot.com",
  messagingSenderId: "85025589952",
  appId: "1:85025589952:web:772471903454f716"
}
export const firebaseApp = firebase.initializeApp(firebaseConfig)
export const firebaseAppAuth = firebaseApp.auth();
export const providers = {
  googleProvider: new firebase.auth.GoogleAuthProvider(),
}