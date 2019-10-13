import { auth, db } from "../firebase";

export const GET_USER = "GET_USER";
export const GET_USER_INFO = "GET_USER_INFO";
export const REMOVE_USER = "REMOVE_USER";

export function getUser(userId) {
  return dispatch => {
    const docRef = db.collection("users").doc(userId);

    docRef
      .get()
      .then(function(doc) {
        if (doc.exists) {
          dispatch({
            type: GET_USER_INFO,
            payload: doc.data()
          });
        } else {
          console.log("user not found");
        }
      })
      .catch(function(error) {
        console.log("Error getting user:", error);
      });
  };
}

export function createAccount(data) {
  const { username, email, password } = data;

  return dispatch =>
    auth
      .createUserWithEmailAndPassword(email, password)
      .then(({ user }) => {
        if (user !== null) {
          db.collection("users")
            .doc(user.uid)
            .set({ username })
            .then(function() {
              console.log("user account created");
            })
            .catch(function(error) {
              console.error("Error creating account: ", error);
            });
        }
        return user;
      })
      .then(user => {
        dispatch({
          type: GET_USER,
          payload: user.uid
        });
      })
      .catch(error => console.log(error));
}

export function loginUser(data) {
  return dispatch =>
    auth
      .signInWithEmailAndPassword(data.email, data.password)
      .then(({ user }) => {
        dispatch({
          type: GET_USER,
          payload: user.uid
        });
      })
      .catch(error => console.log(error));
}

export function logoutUser() {
  return dispatch => {
    auth
      .signOut()
      .then(() => {
        // Sign-out successful.
        dispatch({
          type: REMOVE_USER
        });
      })
      .catch(function(error) {
        // An error happened.
        console.log(error);
      });
  };
}
