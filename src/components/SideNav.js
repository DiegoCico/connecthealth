import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, doc, getDoc, addDoc } from "firebase/firestore";
import { db } from "../firebase"; 
import { useNavigate } from 'react-router-dom';
import '../css/SideNav.css'; // Ensure you have this CSS file

const SideNav = () => {
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState([]);
  const [noResults, setNoResults] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (searchTerm.trim() === "") {
      setNoResults(false);
      return;
    }

    const q = query(collection(db, "patients"), where("name", "==", searchTerm));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      setNoResults(true);
      setPatients([]);
    } else {
      const results = [];

      for (const patientDoc of querySnapshot.docs) {
        const userId = patientDoc.id;
        const personalRef = doc(db, `patients/${userId}/Personal/personalData`);
        const personalSnapshot = await getDoc(personalRef);

        if (personalSnapshot.exists()) {
          results.push({
            id: userId,
            ...personalSnapshot.data(),
          });
        }
      }

      if (results.length > 0) {
        setPatients(results);
        setNoResults(false);
      } else {
        setNoResults(true);
      }
    }
  };

  useEffect(() => {
    handleSearch();
  }, [searchTerm]);

  const handleButtonClick = () => {
    setIsSearchMode(true);
  };

  const handleCreatePatient = async () => {
    const newPatientRef = await addDoc(collection(db, "patients"), { createdAt: new Date() });
    const newUid = newPatientRef.id;
    navigate(`/patient/${newUid}`, { state: { modificationMode: true } });
  };

  const handlePatientClick = (userId) => {
    navigate(`/patient/${userId}`);
  };

  const handlePayButtonClick = () => {
    // Navigate to the payment page or perform any payment logic
    alert("Payment functionality coming soon!");
  };

  return (
    <div className="side-nav">
      <ul>
        <li><button onClick={handleButtonClick} className="nav-button">Patient Search</button></li>
        <li><button className="nav-button diagnostic-button">Diagnostic</button></li>
        <li><button onClick={handlePayButtonClick} className="nav-button pay-button">Pay</button></li>
      </ul>

      {isSearchMode && (
        <div className="search-patient-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search patient by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {noResults && (
            <div className="no-results">
              <p>No patient found. <span onClick={handleCreatePatient} className="create-patient-link">Create Patient</span></p>
            </div>
          )}
          {patients.length > 0 && (
            <ul className="patient-list">
              {patients.map((patient, index) => (
                <li key={index} onClick={() => handlePatientClick(patient.id)} className="patient-item">
                  <strong>{patient.name}</strong> <br />
                  DOB: {patient.DOB} <br />
                  Email: {patient.email} <br />
                  Phone: {patient.phoneNumber} <br />
                  Address: {patient.address} <br />
                  Emergency Contact: {patient.emergencyContact}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default SideNav;
