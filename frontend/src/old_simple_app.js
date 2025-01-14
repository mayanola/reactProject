import React, { useEffect, useState } from 'react';
import { functions } from './firebase';
import { httpsCallable } from 'firebase/functions';

// const db = getFirestore(app);
// Call your Cloud Function
const addMessage = httpsCallable(functions, 'addMessage');

function App() {
  // useState is a hook (like a digital sticky note) which creates two state variables that we can update
  // we use this instead of a typical 'let' variable bc when useState updates the state it informs React to re-render which updates the UI (normal variable don't)
  const [inputValue, setInputValue] = useState('');

  // updates the inputValue state whenever the input value changes
  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  // logs the current state of input value
  const handleSubmit = async (event) => {
    try {
      event.preventDefault(); // Prevent the default form submission behavior of a reload (we don't want to reload the page just update logs/database)
      console.log("value before: ", inputValue);
  
      const result = await addMessage({ text: inputValue });
  
      console.log('Response from Cloud Function:', result.data);
      //setInputValue(''); // Clear input field

      const displayText = result.data.uppercase;
      setInputValue(displayText);


    } catch (error) {
      console.error('Error sending data to Cloud Function:', error);
    }

  };

  db.collection('messages').doc(messageId).onSnapshot((doc) => {
    if (doc.exists) {
      const data = doc.data();
      console.log('Document data:', data);
      // Handle the updated data
    } else {
      console.log('No such document!');
    }
  }, (error) => {
    console.error('Error fetching document:', error);
  });

  
  return (
    <div className="App">
    <header className="App-header">
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Enter message here" 
          value={inputValue} 
          onChange={handleInputChange}
        />
        <button type="submit" className="btn btn-primary">Submit</button>
      </form>
    </header>
  </div>
  );
}

export default App;
