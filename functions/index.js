// The Cloud Functions for Firebase SDK to create Cloud Functions and set up triggers.
const functions = require('firebase-functions/v1');
const cors = require('cors')({ origin: true });
require('dotenv').config();

// Setup the OpenAI API
const API_KEY = process.env.CHATGPT_API_KEY;
// const API_KEY = "sk-proj-0MAh3JhaG59omGtWDpzJT3BlbkFJKj1tH72rspC2sFyhymHT";
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
    
    // Call GPT API
    const completions = await openai.chat.completions.create({
      messages: [
        systemMessage,
        ...apiMessages
      ],
      model: "gpt-4o",
    });
    const apiResponse = (completions.choices[0].message.content);
    
    const writeResult = await admin
     .firestore()
     .collection("conversations")
     .add({
      message: apiResponse || null,
      sender: "assistant",
      timestamp: Date.now()
    });

    functions.logger.log(writeResult.id);

    res.status(200).json({
      result: apiResponse
    });
  });
});

exports.addAPIRequest = functions.https.onRequest(async (req, res) => {
  cors(req, res, async() => {
    const userMessage = req.body.data.text;

    const writeResult = await admin
     .firestore()
     .collection("conversations")
     .add({
      message: userMessage || null,
      sender: "user",
      timestamp: Date.now()
    });

    
    res.status(200).json({ result: `Message with ID: ${writeResult.id} added.` });
  });
});