import React, { useState } from 'react';
import axios from 'axios';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Import Firestore from your firebase setup

const Ruff = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  // Fetch user data by searching inside 'uid > Personal > Details > name'
  const fetchUserData = async (name) => {
    try {
      const patientsCollection = collection(db, 'patients');
      const querySnapshot = await getDocs(patientsCollection);
      
      let foundUserData = null;

      // Loop through each document (representing each uid)
      for (const docSnap of querySnapshot.docs) {
        const personalRef = doc(db, 'patients', docSnap.id, 'Personal', 'Details');
        const personalDoc = await getDoc(personalRef);
        
        if (personalDoc.exists()) {
          const personalData = personalDoc.data();
          
          // Check if the name matches
          if (personalData.name === name) {
            console.log("found user data")
            console.log(personalData)
            foundUserData = personalData;
            break; // Exit the loop once the user is found
          }
        }
      }

      if (foundUserData) {
        return `Name: ${foundUserData.name}, DOB: ${foundUserData.dob}, Allergies: ${foundUserData.allergies}, Address: ${foundUserData.address}, Phone Number: ${foundUserData.phoneNumber}`;
      } else {
        return `User with the name ${name} not found.`;
      }
      
    } catch (error) {
      console.error('Error fetching user data:', error);
      return 'Error fetching user data from Firebase.';
    }
  };

  const fetchUserMedicalData = async (name) => {
    try {
      const patientsCollection = collection(db, 'patients');
      const querySnapshot = await getDocs(patientsCollection);
  
      let foundUserData = null;
      let prescriptionsData = [];
      let visitCount = 0;
  
      // Loop through each document (representing each uid)
      for (const docSnap of querySnapshot.docs) {
        const personalRef = doc(db, 'patients', docSnap.id, 'Personal', 'Details');
        const personalDoc = await getDoc(personalRef);
  
        if (personalDoc.exists()) {
          const personalData = personalDoc.data();
  
          // Check if the name matches
          if (personalData.name === name) {
            foundUserData = personalData;
            
            // Fetch prescriptions
            const prescriptionsRef = collection(db, 'patients', docSnap.id, 'Prescriptions');
            const prescriptionsSnapshot = await getDocs(prescriptionsRef);
  
            prescriptionsSnapshot.forEach((prescriptionDoc) => {
              prescriptionsData.push(prescriptionDoc.data());
            });
  
            // Fetch medical visits
            const visitsRef = collection(db, 'patients', docSnap.id, 'MedicalVisits');
            const visitsSnapshot = await getDocs(visitsRef);
            
            visitCount = visitsSnapshot.size; // Count the number of visits
            
            break; // Exit the loop once the user is found
          }
        }
      }
  
      if (foundUserData) {
        // Format prescriptionsData into a readable string
        const prescriptionsString = prescriptionsData.map((prescription, index) => {
          return `Prescription ${index + 1}: ${JSON.stringify(prescription)}`;
        }).join('\n');
  
        return `John Doe Prescriptions:\n${prescriptionsString}, \nTotal Visits: ${visitCount}`;
      } else {
        return `User with the name ${name} not found.`;
      }
      
    } catch (error) {
      console.error('Error fetching user data:', error);
      return 'Error fetching user data from Firebase.';
    }
  };

  const fetchUserUrl = async (name) => {
    try {
      const patientsCollection = collection(db, 'patients');
      const querySnapshot = await getDocs(patientsCollection);
  
      let foundUserData = null;
  
      // Loop through each document (representing each uid)
      for (const docSnap of querySnapshot.docs) {
        const personalRef = doc(db, 'patients', docSnap.id, 'Personal', 'Details');
        const personalDoc = await getDoc(personalRef);
  
        if (personalDoc.exists()) {
          const personalData = personalDoc.data();
  
          if (personalData.name === name) {
            foundUserData = { uid: docSnap.id };  // Extract uid
            break; // Exit the loop once the user is found
          }
        }
      }
  
      if (foundUserData) {
        // Construct the URL using the UID
        return `/patient/${foundUserData.uid}`;
      } else {
        return `User with the name ${name} not found.`;
      }
      
    } catch (error) {
      console.error('Error fetching user data:', error);
      return 'Error fetching user data from Firebase.';
    }
  };  
  

  const handleSendChat = async () => {
    console.log(userInput)
    if (!userInput) return;

    const newMessage = { role: 'user', content: userInput };
    setChatHistory((prevChatHistory) => [...prevChatHistory, newMessage]);
    setLoading(true);

    try {
      let replyMessage;

      if (userInput.toLowerCase().includes('find ')) {
        const name = userInput.split('find ')[1]; 
        const userData = await fetchUserData(name.trim()); 
        replyMessage = { role: 'assistant', content: `🐶 Ruff found: ${userData}` };
      } else if (userInput.toLowerCase().includes("medical ")) {
        const name = userInput.split("medical ")[1];
        const userData = await fetchUserMedicalData(name.trim());
        replyMessage = { role: 'assistant', content: `🐶 Ruff found: ${userData}` };
      } else if (userInput.toLowerCase().includes("go to ")) {
        const name = userInput.split("medical ")[1];
        const userData = await fetchUserUrl(name.trim());
        
        if (userData.startsWith("/patient/")) {
          replyMessage = { role: 'assistant', content: `🐶 Ruff found: [Click here to view the patient profile](${userData})` };
        } else {
          replyMessage = { role: 'assistant', content: `🐶 Ruff could not find the user: ${userData}` };
        }
      } else if(userInput.toLowerCase() == "help") {
        replyMessage = { role: 'assistant', content: `🐶 Ruff found: write any mensage and I'll support you. Special commands: find {user name} (will retrive user data), medical {user name} (will retrive some medical records), go to {user name} (will provide the url for their page)` };
      }else {
        // For other questions, call your backend
        const response = await axios.post('http://localhost:5005/api/chat', { prompt: userInput });
        replyMessage = { role: 'assistant', content: `🐶 Ruff says: ${response.data.reply}` };
      }

      setChatHistory((prevChatHistory) => [...prevChatHistory, replyMessage]);
      setUserInput('');
    } catch (error) {
      console.error('Error fetching response:', error);
      const errorMessage = {
        role: 'assistant',
        content: '🐶 Ruff is having trouble fetching your advice right now. Please try again later!',
      };
      setChatHistory((prevChatHistory) => [...prevChatHistory, errorMessage]);
    }

    setLoading(false);
  };

  return (
    <div className="chat-button-container">
      {/* Blue Circle Button */}
      <button className={`blue-circle-button ${isChatOpen ? 'open' : ''}`} onClick={toggleChat}>
        🐾
      </button>

      {/* Chat Box */}
      {isChatOpen && (
        <div className="chat-box">
          <h3>🐶 Ruff's Medical Advice</h3>
          <p>Ask for general medical advice or find a user by name.</p>

          {/* Loading indicator */}
          {loading && <p>Loading...</p>}

          {/* Chat History */}
          <div className="chat-history">
            {chatHistory.map((message, index) => (
              <div key={index} className={message.role === 'user' ? 'user-message' : 'assistant-message'}>
                {message.content}
              </div>
            ))}
          </div>

          <input
            type="text"
            placeholder="Type your question here..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="chat-input"
          />
          <button className="send-btn" onClick={handleSendChat}>
            Send
          </button>
        </div>
      )}
    </div>
  );
};

export default Ruff;
