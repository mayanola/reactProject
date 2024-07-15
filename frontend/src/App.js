import './App.css';
import React, { useEffect, useState } from 'react';
import { functions } from './firebase';
import { httpsCallable } from 'firebase/functions';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';

// const db = getFirestore(app);
// Call your Cloud Function
const addMessage = httpsCallable(functions, 'addMessage');

function App() {
  const [messages, setMessages] = useState([
    {
      message: "Hello, I'm ChatGPT! Ask me anything!",
      sentTime: "just now",
      sender: "ChatGPT",
      direction: "incoming"
    }
  ]);

  const [isTyping, setIsTyping] = useState(false);

  // point => function handleSend to logic {}
  const handleSend = async (message) => {
    const newMessage = {
      message,
      sender: "user"
    };

    const newMessages = [...messages, newMessage];
    setIsTyping(true);
    await sendMessage(newMessages);
  };

  async function sendMessage(chatMessages) {
    // call backend addMessage, passing in messageObject
    const result = await addMessage({ text: chatMessages });

    setMessages([...chatMessages, {
      message: result,
      sender: "ChatGPT",
      direction: "incoming"
    }]);

    setIsTyping(false);
  }

  return (
    <div className="App">
      <div style={{ position:"relative", height: "700px", width: "700px"  }}>
        <MainContainer>
          <ChatContainer>       
            <MessageList
              typingIndicator={isTyping ? <TypingIndicator content='ChatGPT is typing...' /> : null}>
              {messages.map((message, i) => {
                console.log(message)
                return <Message key={i} model={message} />
              })}
            </MessageList>
            <MessageInput placeholder='Type message here' onSend={handleSend}/>        
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  )
}

export default App;
