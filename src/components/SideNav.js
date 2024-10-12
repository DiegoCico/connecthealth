import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, doc, getDoc, addDoc } from "firebase/firestore";
import { db } from "../firebase"; 
import { useNavigate } from 'react-router-dom';
import ImportPatientPopup from "./ImportPatientPopUp";
import '../css/SideNav2.css'; // Ensure you have this CSS file

const SideNav = () => {
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [allPatients, setAllPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [filteredChargePatients, setFilteredChargePatients] = useState([]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [searchChargeTerm, setSearchChargeTerm] = useState("");
  
  const [recipientEmail, setRecipientEmail] = useState('');
  const [showEmailTextBox, setShowEmailTextBox] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [invoiceDescription, setInvoiceDescription] = useState('');

  const [showImportPatientPopUp, setShowImportPatientPopUp] = useState(false)
  const toggleImportPatientPopUp = () => {
    setShowImportPatientPopUp(!showImportPatientPopUp)
  }
  
  const navigate = useNavigate();

  const handleCreatePatient = async () => {
    const newPatientRef = await addDoc(collection(db, "patients"), { createdAt: new Date() });
    const newUid = newPatientRef.id;
    navigate(`/patient/${newUid}`, { state: { modificationMode: true } });
  };

  const handleButtonClick = async (charge) => {
    if (!charge) {
      setIsSearchMode(true);
    }
    try {
      const patientsQuery = collection(db, "patients");
      const patientsSnapshot = await getDocs(patientsQuery);
      const patientNames = [];
      
      for (const patientDoc of patientsSnapshot.docs) {
        const personalRef = doc(db, "patients", patientDoc.id, "Personal", "Details");
        const personalSnap = await getDoc(personalRef);
        if (personalSnap.exists()) {
          const personalData = personalSnap.data();
          patientNames.push({ id: patientDoc.id, name: personalData.name, email: personalData.email });
        }
      }
      setAllPatients(patientNames);
    } catch (error) {
      console.error('Error fetching patient names:', error);
    }
  };

  const filterPatients = (input) => {
    const lowerCaseInput = input.toLowerCase();
    return allPatients.filter(patient =>
      patient.name?.toLowerCase().includes(lowerCaseInput) ||
      patient.email?.toLowerCase().includes(lowerCaseInput)
    );
  };

  const handleSearchInputChange = (e, isChargeSearch = false) => {
    const input = e.target.value;
    
    if (isChargeSearch) {
      if (input.length > 0) {
        const filtered = filterPatients(input);
        setFilteredChargePatients(filtered);
        setSearchChargeTerm(input);
      } else {
        setShowEmailTextBox(false)
        setSearchChargeTerm("")
        setFilteredChargePatients([])
      }
    } else {
      const filtered = filterPatients(input);
      setFilteredPatients(filtered);
      setSearchTerm(input);
    }
  };

  const handlePatientClick = (userId) => {
    navigate(`/patient/${userId}`);
  };

  const handlePatientChargeClick = (patient) => {
    console.log(patient)
    setRecipientEmail(patient.email)
    setRecipientName(patient.name)
    setSearchChargeTerm(patient.name)
    setShowEmailTextBox(true)
    setFilteredChargePatients([])
  };

  const handleImportPatientClick = () => {
    navigate('/import-patient');
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleChargeClick = () => {
    setShowPopup(true);
    handleButtonClick(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setShowEmailTextBox(false)
    setSearchChargeTerm("")
    setFilteredChargePatients([])
  };

  const handleChargeSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission
    if (recipientEmail && recipientName && invoiceAmount && invoiceDescription) {
      createNewCharge(recipientEmail, recipientName, invoiceAmount, invoiceDescription);
      closePopup(); // Close the popup after submitting
    }
  };

  const createNewCharge = (email, name, amount, description) => {
    const options = {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'Authorization': `Bearer 7hrEkR1AyuQPOpfTssB8ZMUCU4OZ0X` // Add the authorization header
      },
      body: JSON.stringify({
        amount: amount,
        description: description,
        recipient: email,
        name: name
      })
    };

    fetch('https://sandbox.checkbook.io/v3/invoice', options)
      .then(response => response.json())
      .then(response => console.log(response))
      .catch(err => console.error(err));
  };

  return (
    <div className="side-nav">
      <ul>
        <li>
          <h1>Connect Health</h1>
        </li>
        <li>
          <button onClick={handleHomeClick} className="nav-button">
            Home
          </button>
        </li>
        <li>
          <button onClick={() => handleButtonClick(false)} className="nav-button">
            Patient Search
          </button>
        </li>
        <li>
          <button onClick={toggleImportPatientPopUp} className="nav-button diagnostic-button">Import Patient</button>
        </li>
        <li>
          <button className="nav-button pay-button" onClick={handleChargeClick}>Charge</button>
        </li>
      </ul>
      {showImportPatientPopUp && <ImportPatientPopup onClose={toggleImportPatientPopUp}/>}

      {isSearchMode && (
        <div className="search-patient-container">
          <button onClick={handleCreatePatient}>Add new patient</button>
          <input
            type="text"
            className="search-input"
            placeholder="Search patient by name..."
            value={searchTerm}
            onChange={(e) => handleSearchInputChange(e, false)}
          />
        </div>
      )}

      {filteredPatients.length > 0 && (
        <div className="dropdown-menu">
          {filteredPatients.map((patient) => (
            <div className="dropdown-item" key={patient.id} onClick={() => handlePatientClick(patient.id)}>
              {patient.name}
            </div>
          ))}
        </div>
      )}
      
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <button className="close-btn" onClick={closePopup}>X</button>
            <h2>Charge Details</h2>
            <input
              type="text"
              className="search-input"
              placeholder="Search patient by name..."
              value={searchChargeTerm}
              onChange={(e) => handleSearchInputChange(e, true)}
            />
            {filteredChargePatients.length > 0 && (
              <div className="dropdown-menu">
                {filteredChargePatients.map((patient) => (
                  <div className="dropdown-item" key={patient.id} onClick={() => handlePatientChargeClick(patient)}>
                    {patient.name}
                  </div>
                ))}
              </div>
            )}
            <form onSubmit={handleChargeSubmit}>
              {showEmailTextBox && (
                <div className="invoice-details-container">
                  <input
                    type="email"
                    placeholder="Recipient Email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Invoice Amount"
                    value={invoiceAmount}
                    onChange={(e) => setInvoiceAmount(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Invoice Description"
                    value={invoiceDescription}
                    onChange={(e) => setInvoiceDescription(e.target.value)}
                  /> 
                </div>
              )}
              {/* <button className="submit-charge" type="submit">Send Invoice</button> */}
              <button
                className="submit-charge"
                type="submit"
                disabled={
                  !recipientEmail || !invoiceAmount || !invoiceDescription
                }
              >
                Send Invoice
               </button> {/*TODO: add a notification in green, saying invoice sent successfully */}
            </form>
          </div>
        </div>
      )}

      {/* pop up for the import patient */}

    </div>
  );
};

export default SideNav;
