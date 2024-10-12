import React, { useState, useEffect } from 'react';
import { doc, setDoc, collection, getDocs } from 'firebase/firestore'; // Import Firestore functions
import { db } from '../firebase'; // Your Firebase config

const Financial = ({ uid }) => {
  const [newCardData, setNewCardData] = useState({
    cardNumber: '',
    cardHolderName: '',
    expiryDate: '',
    cvv: ''
  });

  const [savedCards, setSavedCards] = useState([]); // State to hold saved cards

  // Define the editCard function
  const editCard = (cardId) => {
    console.log(`Edit card with ID: ${cardId}`);
    alert(`Editing card with ID: ${cardId}`);
  };

  // Define the removeCard function
  const removeCard = async (cardId) => {
    console.log(`Remove card with ID: ${cardId}`);
    alert(`Removing card with ID: ${cardId}`);
    // Implement card removal logic here, e.g., delete from Firestore
  };

  // Handle input change for new card information
  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    setNewCardData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  // Validate the card information
  const validateCard = () => {
    const { cardNumber, expiryDate, cvv } = newCardData;

    // Validate card number (should be 16 digits)
    if (!/^\d{16}$/.test(cardNumber)) {
      alert('Invalid card number. Must be 16 digits.');
      return false;
    }

    // Validate expiry date (MM/YY)
    const [month, year] = expiryDate.split('/');
    if (!/^\d{2}\/\d{2}$/.test(expiryDate) || +month < 1 || +month > 12) {
      alert('Invalid expiry date. Format should be MM/YY.');
      return false;
    }

    // Validate CVV (should be 3 digits)
    if (!/^\d{3}$/.test(cvv)) {
      alert('Invalid CVV. Must be 3 digits.');
      return false;
    }

    return true;
  };

  // Function to handle the addition of a new card
  const addCard = async () => {
    if (!validateCard()) {
      return; // If validation fails, exit the function
    }

    const lastFourDigits = newCardData.cardNumber.slice(-4); // Get the last 4 digits of the card

    try {
      // Store the entire card number in a Firestore collection named after the last 4 digits
      const cardCollectionRef = doc(db, 'patients', uid, 'Financial', lastFourDigits);
      await setDoc(cardCollectionRef, {
        cardHolderName: newCardData.cardHolderName,
        cardNumber: newCardData.cardNumber,  // Storing the full card number (ensure this is secure!)
        expiryDate: newCardData.expiryDate,
        cvv: newCardData.cvv // It's not safe to store CVV in real applications
      }, { merge: true });

      alert(`Card added successfully: **** **** **** ${lastFourDigits}`);
      
      // Clear the form after submission
      setNewCardData({
        cardNumber: '',
        cardHolderName: '',
        expiryDate: '',
        cvv: ''
      });

      // Refresh the saved cards after adding a new one
      fetchSavedCards();

    } catch (error) {
      console.error('Error adding card:', error);
      alert('Failed to add card. Please try again.');
    }
  };

  // Function to fetch saved cards from Firestore
  const fetchSavedCards = async () => {
    const cards = [];
    const cardsCollectionRef = collection(db, 'patients', uid, 'Financial');
    const querySnapshot = await getDocs(cardsCollectionRef);

    querySnapshot.forEach((doc) => {
      cards.push({
        id: doc.id, // Last 4 digits as ID
        ...doc.data()
      });
    });

    setSavedCards(cards); // Update the state with fetched cards
  };

  // Fetch saved cards when the component mounts
  useEffect(() => {
    fetchSavedCards();
  }, []);

  return (
    <div>
      <h2>Financial Information</h2>

      {/* Example usage of editCard and removeCard */}
      <button onClick={() => editCard(uid)}>Edit Card</button>
      <button onClick={() => removeCard(uid)}>Remove Card</button>

      {/* Section to add a new card */}
      <h3>Add New Card Information</h3>
      <label>
        Card Number:
        <input
          type="text"
          name="cardNumber"
          value={newCardData.cardNumber}
          onChange={handleCardInputChange}
        />
      </label>
      <br />
      <label>
        Card Holder Name:
        <input
          type="text"
          name="cardHolderName"
          value={newCardData.cardHolderName}
          onChange={handleCardInputChange}
        />
      </label>
      <br />
      <label>
        Expiry Date:
        <input
          type="text"
          name="expiryDate"
          placeholder="MM/YY"
          value={newCardData.expiryDate}
          onChange={handleCardInputChange}
        />
      </label>
      <br />
      <label>
        CVV:
        <input
          type="text"
          name="cvv"
          value={newCardData.cvv}
          onChange={handleCardInputChange}
        />
      </label>
      <br />
      <button onClick={addCard}>Add Card</button>

      {/* Section to display saved cards */}
      <h3>Saved Cards</h3>
      <div className="saved-cards">
        {savedCards.length === 0 ? (
          <p>No cards saved yet.</p>
        ) : (
          savedCards.map((card) => (
            <div key={card.id} className="card-info">
              <p><strong>Card:</strong> **** **** **** {card.id}</p>
              <p><strong>Holder Name:</strong> {card.cardHolderName}</p>
              <p><strong>Expiry Date:</strong> {card.expiryDate}</p>
              <button onClick={() => removeCard(card.id)}>Remove Card</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Financial;
