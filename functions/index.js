const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();

// exports.playMatch = functions.firestore
//   .document("matches/{matchId}")
//   .onUpdate((change, context) => {
//     // Retrieve the current and previous value
//     const data = change.after.data().d;
//     const previousData = change.before.data();

//     console.log(data);

//     // We'll only update if the name has changed.
//     // This is crucial to prevent infinite loops.
//     if (data.name === previousData.name) return null;

//     // Retrieve the current count of name changes
//     let timer = data.timer;
//     if (!timer) {
//       timer = 600;
//     }

//     // If data updated was {playing: true}
//     // setInterval(() => {
//     //   change.after.ref.set({
//     //     timer: timer - 1
//     //   });
//     // }, 1000);

//     // Then return a promise of a set operation to update the timer
//     return change.after.ref.set(
//       {
//         timer
//       },
//       x
//     );
//   });

// exports.finishMatch = functions.firestore
//   .document("matches/{matchId}")
//   .onUpdate((change, context) => {
//     // Retrieve the current and previous value
//     const data = change.after.data().d;
//     const previousData = change.before.data().d;

//     console.log(data);

//     // We'll only update if the name has changed.
//     // This is crucial to prevent infinite loops.
//     if (data.finished === previousData.name.finished) return null;

//     if (data.finished) {
//       db.collection("matches");
//     }

//     return change.after.ref.set(
//       {
//         winners: []
//       },
//       { merge: true }
//     );
//   });
