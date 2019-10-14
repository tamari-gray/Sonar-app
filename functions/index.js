const functions = require("firebase-functions");

exports.playMatch = functions.firestore
  .document("matches/{matchId}")
  .onUpdate((change, context) => {
    // Retrieve the current and previous value
    const data = change.after.data();
    const previousData = change.before.data();

    console.log(data);

    // We'll only update if the name has changed.
    // This is crucial to prevent infinite loops.
    if (data.name === previousData.name) return null;

    // Retrieve the current count of name changes
    let timer = data.timer;
    if (!timer) {
      timer = 600;
    }

    // If data updated was {playing: true}
    // setInterval(() => {
    //   change.after.ref.set({
    //     timer: timer - 1
    //   });
    // }, 1000);

    // Then return a promise of a set operation to update the timer
    return change.after.ref.set(
      {
        timer
      },
      x
    );
  });
