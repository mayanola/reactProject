// The Cloud Functions for Firebase SDK to create Cloud Functions and set up triggers.
const functions = require('firebase-functions/v1');
const cors = require('cors')({ origin: true });

// The Firebase Admin SDK to access Firestore.
const admin = require("firebase-admin");
admin.initializeApp();

const systemMessage = {
  "role": "system",
  "content": "Explain all concepts like you are a pirate."
}

exports.addMessage = functions.https.onRequest(async (req, res) => {
  cors(req, res, async() => {
    chatMessages = req.body.data.text;
    functions.logger.log(chatMessages);
    // functions.logger.log(req.body.text);
    // functions.logger.log(req);
    
    let apiMessages = chatMessages.map((messageObject) => {
      let role="";
      if(messageObject.sender === "ChatGPT") {
        role="assistant"
      } else {
        role="user"
      }
      return {role:role, content:messageObject.message}
    });

    functions.logger.log(apiMessages);

    
    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [
        systemMessage,
        ...apiMessages
      ]
    }

    await fetch("https://api.openai.com/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + API_KEY,
        "Content-Type": "application/json" // sending json in body of request
      },
      body: JSON.stringify(apiRequestBody)
    }).then((data) => {
      //data = data.choices[0].message.content;
      functions.logger.log("the data is: ", data);
      //functions.logger.log(data.choices[0].message.content);
      //functions.logger.log(data.jsonPayload.choices[0].message.content);
    }).then((data) => {
      res.status(200).json({result: "data"});
    });
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