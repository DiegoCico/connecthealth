import React, { useState, useEffect } from 'react';
import { doc, getDocs, setDoc, collection, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import CryptoJS from 'crypto-js';

const Financial = ({ patientData, handleChange, uid }) => {
  const [creditCards, setCreditCards] = useState([]);
  const [newCard, setNewCard] = useState({ number: '', name: '', expiry: '', cvv: '', brand: '' });
  const [editIndex, setEditIndex] = useState(null); // Track if editing an existing card

  // Fetch and decrypt credit cards from Firestore
  useEffect(() => {
    const fetchCards = async () => {
      try {
        const cardCollectionRef = collection(db, 'patients', uid, 'Financial', 'CreditCards');
        const cardDocs = await getDocs(cardCollectionRef);

        const decryptedCards = [];
        cardDocs.forEach((docSnap) => {
          const encryptedData = docSnap.data();

          // Ensure the data exists and is valid
          if (encryptedData && encryptedData.name && encryptedData.expiry && encryptedData.brand) {
            decryptedCards.push({
              last4Digits: docSnap.id,
              number: "**** **** **** " + docSnap.id,
              name: decryptCardData(encryptedData.name),
              expiry: decryptCardData(encryptedData.expiry),
              brand: decryptCardData(encryptedData.brand)
            });
          } else {
            console.warn('Invalid data structure for card:', docSnap.id);
          }
        });

        setCreditCards(decryptedCards);
      } catch (error) {
        console.error('Error fetching credit card data:', error);
      }
    };

    fetchCards();
  }, [uid]);

  // Decrypt card data
  const decryptCardData = (encryptedData) => {
    if (!encryptedData) {
      return ''; // Return an empty string if no data is available
    }
    try {
      return CryptoJS.AES.decrypt(encryptedData, 'secretKey').toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption error:', error);
      return ''; // Return empty string if decryption fails
    }
  };

  // Encrypt card data
  const encryptCardData = (card) => {
    return {
      number: CryptoJS.AES.encrypt(card.number, 'secretKey').toString(),
      name: CryptoJS.AES.encrypt(card.name, 'secretKey').toString(),
      expiry: CryptoJS.AES.encrypt(card.expiry, 'secretKey').toString(),
      cvv: CryptoJS.AES.encrypt(card.cvv, 'secretKey').toString(),
      brand: CryptoJS.AES.encrypt(card.brand, 'secretKey').toString()
    };
  };

  // Get last 4 digits of card number
  const getLast4Digits = (cardNumber) => {
    return cardNumber.slice(-4);
  };

  // Handle form input changes
  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setNewCard(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Add or update a credit card
  const addOrUpdateCard = async () => {
    const encryptedCard = encryptCardData(newCard);
    const last4Digits = getLast4Digits(newCard.number);

    // If editing, update the card in state and Firestore
    if (editIndex !== null) {
      const updatedCards = [...creditCards];
      updatedCards[editIndex] = { ...newCard, last4Digits };
      setCreditCards(updatedCards);
      await setDoc(doc(db, 'patients', uid, 'Financial', last4Digits, 'CardDetails'), encryptedCard);
      setEditIndex(null);
    } else {
      // If adding a new card, append to state and Firestore
      const updatedCards = [...creditCards, { ...newCard, last4Digits }];
      setCreditCards(updatedCards);
      await setDoc(doc(db, 'patients', uid, 'Financial', last4Digits, 'CardDetails'), encryptedCard);
    }

    // Clear form
    setNewCard({ number: '', name: '', expiry: '', cvv: '', brand: '' });
  };

  // Remove a credit card
  const removeCard = async (last4Digits, index) => {
    const updatedCards = creditCards.filter((_, idx) => idx !== index);
    setCreditCards(updatedCards);

    // Remove card from Firestore
    await deleteDoc(doc(db, 'patients', uid, 'Financial', last4Digits, 'CardDetails'));
  };

  // Edit an existing credit card
  const editCard = (index) => {
    const card = creditCards[index];
    setNewCard({ ...card, number: '**** **** **** ' + card.last4Digits });
    setEditIndex(index);
  };

  return (
    <div className="tab-content fade-in">
      <h2>Financial Information</h2>
      <div className="form-group">
        <label>Insurance Provider</label>
        <input type="text" name="insuranceProvider" value={patientData.insuranceProvider} onChange={handleChange} placeholder="Insurance Provider" />
      </div>
      <div className="form-group">
        <label>Insurance Policy Number</label>
        <input type="text" name="insurancePolicy" value={patientData.insurancePolicy} onChange={handleChange} placeholder="Insurance Policy Number" />
      </div>
      <div className="form-group">
        <label>Outstanding Bills</label>
        <input type="text" name="outstandingBills" value={patientData.outstandingBills} onChange={handleChange} placeholder="Outstanding Bills" />
      </div>

      <h3>Saved Credit Cards</h3>
      <div className="credit-cards">
        {creditCards.map((card, index) => (
          <div key={index} className="credit-card-box">
            <p><strong>Last 4 Digits:</strong> {card.last4Digits}</p>
            <p><strong>Brand:</strong> {card.brand}</p>
            <p><strong>Name on Card:</strong> {card.name}</p>
            <p><strong>Expiry Date:</strong> {card.expiry}</p>
            <button onClick={() => editCard(index)}>Edit</button>
            <button onClick={() => removeCard(card.last4Digits, index)}>Remove</button>
          </div>
        ))}
      </div>

      <h3>{editIndex !== null ? 'Edit Card' : 'Add New Card'}</h3>
      <div className="form-group">
        <label>Card Number</label>
        <input type="text" name="number" value={newCard.number} onChange={handleCardChange} placeholder="Card Number" />
      </div>
      <div className="form-group">
        <label>Name on Card</label>
        <input type="text" name="name" value={newCard.name} onChange={handleCardChange} placeholder="Name on Card" />
      </div>
      <div className="form-group">
        <label>Expiry Date</label>
        <input type="text" name="expiry" value={newCard.expiry} onChange={handleCardChange} placeholder="MM/YY" />
      </div>
      <div className="form-group">
        <label>CVV</label>
        <input type="password" name="cvv" value={newCard.cvv} onChange={handleCardChange} placeholder="CVV" />
      </div>
      <div className="form-group">
        <label>Card Brand</label>
        <select name="brand" value={newCard.brand} onChange={handleCardChange}>
          <option value="">Select Brand</option>
          <option value="Visa">Visa</option>
          <option value="Mastercard">Mastercard</option>
          <option value="American Express">American Express</option>
          <option value="Discover">Discover</option>
        </select>
      </div>
      <button onClick={addOrUpdateCard}>{editIndex !== null ? 'Update Card' : 'Add Card'}</button>
    </div>
  );
};

export default Financial;
