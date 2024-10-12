import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, doc, getDoc, addDoc } from "firebase/firestore";
import { db } from "../firebase"; 
import { useNavigate } from 'react-router-dom';
import '../css/SideNav2.css'; // Ensure you have this CSS file

const SideNav = () => {
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState([]);
  const [noResults, setNoResults] = useState(false);
  const navigate = useNavigate();
  const [allNames, setAllNames] = useState([]); // Array to hold all patient names
  const [filterNames, setFilterNames] = useState([]); // Filtered names for dropdown
  const [showDropdown, setShowDropdown] = useState(false); // Show dropdown state
  const [showPopup, setShowPopup] = useState(false);

  // states to send an invoice to a patient
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleCreatePatient = async () => {
    console.log('add new patient clicked')
    const newPatientRef = await addDoc(collection(db, "patients"), { createdAt: new Date() });
    const newUid = newPatientRef.id;
    navigate(`/patient/${newUid}`, { state: { modificationMode: true } });
  };

  const handleButtonClick = async () => {
    setIsSearchMode(true);

    try {
      const patientsQuery = collection(db, "patients"); // Reference to the 'patients' collection
      const patientsSnapshot = await getDocs(patientsQuery); // Get all patients

      const names = []; // Array to store patient names
      for (const patientDoc of patientsSnapshot.docs) {
        const personalRef = doc(db, "patients", patientDoc.id, "Personal", "Details"); // Reference to the 'Personal' document
        const personalSnap = await getDoc(personalRef); // Get personal details of patient

        if (personalSnap.exists()) {
          const personalData = personalSnap.data();
          names.push({ id: patientDoc.id, name: personalData.name }); // Add patient name to names array
        }
      }

      setAllNames(names); // Set all names in the state
      console.log('All patient names:', names);
    } catch (error) {
      console.log('Error fetching patient names:', error);
    }
  };

  const handleInput = (e) => {
    const input = e.target.value.toLowerCase();
    setSearchTerm(input);

    if (input.length > 0) {
      const filtered = allNames
        .filter((patient) => patient.name && patient.name.toLowerCase().includes(input)) // Check for patient.name
        .map((patient) => patient.name); // Extract only the name for display

      setFilterNames(filtered); // Update the filterNames state with the filtered list
      setShowDropdown(filtered.length > 0); // Show dropdown only if there are results
      console.log('Filtered Names:', filtered, showDropdown);
    } else {
      setShowDropdown(false); // Hide dropdown if input is empty
    }
  };

  const handlePatientClick = (userId) => {
    navigate(`/patient/${userId}`);
  };

  const handleButtonClickD = () => {
    navigate('/Diagnose');
  };

  const handleHomeClick = () => {
    navigate('/')
  }

  const handleChargeClick = () => {
    setShowPopup(true);
    setShowDropdown(false);
  }

  const closePopup = () => {
    setShowPopup(false);
  };



  return (
    <div className="side-nav">
      <ul>
        <li>
          <button onClick={handleHomeClick} className="nav-button">
            Home
          </button>
        </li>
        <li>
          <button onClick={handleButtonClick} className="nav-button">
            Patient Search
          </button>
        </li>
        <li>
          <button onClick={handleButtonClickD} className="nav-button diagnostic-button">Diagnostic</button>
        </li>
        <li>
          <button className="nav-button pay-button" onClick={handleChargeClick}>Charge</button>
        </li>
      </ul>

      {isSearchMode && (
        <div className="search-patient-container">
          <button onClick={handleCreatePatient}>Add new patient</button>
          <input
            type="text"
            className="search-input"
            placeholder="Search patient by name..."
            value={searchTerm}
            onChange={handleInput}
          />
        </div>
      )}

      {showDropdown && filterNames.length > 0 && (
        <div className="dropdown-menu">
          {filterNames.map((name, index) => (
            <div className="dropdown-item" key={index} onClick={() => handlePatientClick(name)}>
              {name}
            </div>
          ))}
        </div>
      )}

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <button className="close-btn" onClick={closePopup}>X</button>
            <h2>Charge Details</h2>
            <form>
              <div className="form-group">
                <label htmlFor="email">Email of the Recipient</label>
                <input type="email" id="email" name="email" required />
              </div>
              <div className="form-group">
                <label htmlFor="name">Name of the Recipient</label>
                <input type="text" id="name" name="name" required />
              </div>
              <div className="form-group">
                <label htmlFor="amount">Amount to be Charged</label>
                <input type="number" id="amount" name="amount" required />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description of the Invoice</label>
                <textarea id="description" name="description" required></textarea>
              </div>
              <button type="submit" className="submit-btn">Submit</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SideNav;


