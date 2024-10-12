import React, { useState } from "react";
import { collection, getDocs, doc, getDoc, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from 'react-router-dom';
import '../css/ImportPatientPopup.css'; // Optional CSS for styling

const ImportPatientPopup = ({ closePopup }) => {
  const [jsonFile, setJsonFile] = useState(null);
  const [importedData, setImportedData] = useState(null);
  const [isValid, setIsValid] = useState(false);
  const navigate = useNavigate();

  const handleJsonUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const jsonData = JSON.parse(event.target.result);
        setJsonFile(jsonData);
        // Validate the JSON data against Firebase
        const isValidData = await validateJsonData(jsonData);
        setIsValid(isValidData);
        setImportedData(jsonData); // Store the valid data
      } catch (error) {
        console.error("Error parsing JSON:", error);
        alert("Invalid JSON format");
      }
    };
    
    if (file) {
      reader.readAsText(file);
    }
  };

  const validateJsonData = async (jsonData) => {
    try {
      const patientsQuery = collection(db, "patients");
      const patientsSnapshot = await getDocs(patientsQuery);

      for (const patientDoc of patientsSnapshot.docs) {
        const personalRef = doc(db, "patients", patientDoc.id, "Personal", "Details");
        const personalSnap = await getDoc(personalRef);
        if (personalSnap.exists()) {
          // Perform your validation logic here
          // Example: check if the patient already exists in Firebase
        }
      }
      return true; // Assume it's valid for now
    } catch (error) {
      console.error("Error validating JSON data:", error);
      return false;
    }
  };

  const handleImportSubmit = async () => {
    if (isValid && importedData) {
      // Import the data to Firebase
      await addDoc(collection(db, "patients"), importedData);
      navigate('/');
    } else {
      alert("Invalid data. Cannot import.");
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup">
        <button className="close-btn" onClick={closePopup}>X</button>
        <h2>Import Patients</h2>
        <input type="file" accept=".json" onChange={handleJsonUpload} />
        {jsonFile && isValid && (
          <div>
            <h3>Imported Data:</h3>
            <pre>{JSON.stringify(importedData, null, 2)}</pre>
            <button className="submit-btn" onClick={handleImportSubmit}>Import</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportPatientPopup;
