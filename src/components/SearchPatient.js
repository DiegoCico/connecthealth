import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, doc, getDoc, addDoc } from "firebase/firestore";
import { db } from "../firebase"; 
import "../css/SearchPatient.css"; 
import { useNavigate } from 'react-router-dom';

const SearchPatient = () => {
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState([]);
  const [noResults, setNoResults] = useState(false);
  const [loading, setLoading] = useState(false); // New loading state
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (searchTerm.trim() === "") {
      setNoResults(false);
      setPatients([]);
      return;
    }
    setLoading(true); // Start loading
    const q = query(collection(db, "patients"), where("name", "==", searchTerm));
    const querySnapshot = await getDocs(q);

    const results = [];
    if (querySnapshot.empty) {
      setNoResults(true);
      setPatients([]);
    } else {
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
    }

    setLoading(false); // Stop loading
    if (results.length > 0) {
      setPatients(results);
      setNoResults(false);
    } else {
      setNoResults(true);
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

  return (
    <div className="search-patient-container">
      {!isSearchMode ? (
        <button onClick={handleButtonClick} className="search-button">
          Search Patient
        </button>
      ) : (
        <div className="search-bar">
          <input
            type="text"
            className="search-input"
            placeholder="Search patient by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={() => setSearchTerm("")} className="clear-button">
            Clear
          </button>
        </div>
      )}
      {loading && <div className="loading">Loading...</div>} {/* Loading Indicator */}
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
  );
};

export default SearchPatient;
