// The Cloud Functions for Firebase SDK to create Cloud Functions and set up triggers.
const functions = require('firebase-functions/v1');
const cors = require('cors')({ origin: true });

// Setup the OpenAI API
const API_KEY = process.env.CHATGPT_API_KEY;
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: API_KEY });

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

    // Format the messages to send to the API
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
    
    // Call GPT API
    const completions = await openai.chat.completions.create({
      messages: [
        systemMessage,
        ...apiMessages
      ],
      model: "gpt-4o",
    });
    const apiResponse = (completions.choices[0].message.content);
    
    res.status(200).json({result: apiResponse});
  });
});