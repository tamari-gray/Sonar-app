import { auth, db } from "../firebase";

export const GET_USER = 'GET_USER'
export const GET_USER_INFO = 'GET_USER_INFO'

// export function getUser () {
//   return dispatch => {
// auth.onAuthStateChanged(user => {
//   console.log('logged in')
//   dispatch({
//     type: GET_USER,
//     payload: user
//   })
// })
//   }
// }

export function getUser(userId) {
  return dispatch => db.ref('/users/' + userId).once('value', (snapshot) => {
    console.log('getting user working')
    const user = snapshot.val()
    console.log("got user info action", user)
    dispatch({
      type: GET_USER_INFO,
      payload: snapshot.val()
    })
  })

}

export function createAccount(data) {
  const { firstName, lastName, email, password } = data

  return dispatch => auth.createUserWithEmailAndPassword(email, password)
    .then(({ user }) => {
      if (user !== null) {
        db.ref('users').child(user.uid).set({ firstName, lastName })
      }
      return user
    }).then((user) => {
      dispatch({
        type: GET_USER,
        payload: user.uid
      })
      return user
    }).catch((error) => console.log(error))
}

export function loginUser(data) {
  // return dispatch => console.log('logging in ', data)
  return dispatch => auth.signInWithEmailAndPassword(data.email, data.password)
    .then(({ user }) => {
      dispatch({
        type: GET_USER,
        payload: user.uid
      })
      return user
    }).catch((error) => console.log(error))
}

export function wat(data) {
  return dispatch => console.log('js wat', data)
}