// The Cloud Functions for Firebase SDK to create Cloud Functions and set up triggers.
const functions = require('firebase-functions/v1');
const cors = require('cors')({ origin: true });

// The Firebase Admin SDK to access Firestore.
const admin = require("firebase-admin");
admin.initializeApp();

// Take the text parameter passed to this HTTP endpoint and insert it into
// Firestore under the path /messages/:documentId/original
exports.addMessage = functions.https.onRequest(async (req, res) => {
  cors(req, res, async() => {
  
   // Grab the text parameter.
   try {
    const original = req.body.data.text;

   // Push the new message into Firestore using the Firebase Admin SDK.
   const writeResult = await admin
     .firestore()
     .collection("messages")
     .add({ original: original || null});
   // Send back a message that we've successfully written the message
     res.status(200).json({ result: `Message with ID: ${writeResult.id} added.`}); 
   } catch (error) {
      res.status(500).send(error);
   }
  });
});

// Listens for new messages added to /messages/:documentId/original and creates an
// uppercase version of the message to /messages/:documentId/uppercase
exports.makeUppercase = functions.firestore
.document("/messages/{documentId}")
.onCreate((snap, context) => {
  // Grab the current value of what was written to Firestore.
  const original = snap.data().original;

  // Access the parameter `{documentId}` with `context.params`
  functions.logger.log("Uppercasing", context.params.documentId, original);

  const uppercase = original.toUpperCase();

  // You must return a Promise when performing asynchronous tasks inside a Functions such as
  // writing to Firestore.
  // Setting an 'uppercase' field in Firestore document returns a Promise.
  return snap.ref.set({ uppercase }, { merge: true });
});


// exports.getUppercase = functions.firestore
// .document("/messages/{documentId}")
// .onUpdate((change, context) => {
//   const beforeData = change.before.data();
//   const afterData = change.after.data();
  
//   functions.logger.log("this is the before data: ", beforeData);
//   functions.logger.log("this is the after data: ", afterData);
//   functions.logger.log("this is the uppercase word: ", afterData.uppercase);
  
// });