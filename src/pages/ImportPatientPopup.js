import React, { useState } from "react";
import { collection, getDocs, doc, getDoc, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from 'react-router-dom';
import '../css/ImportPatientPopup.css'; // Optional CSS for styling

const ImportPatientPopup = ({ closePopup }) => {
  const [jsonFile, setJsonFile] = useState(null);  // State for the uploaded JSON file.
  const [importedData, setImportedData] = useState(null);  // State for storing the imported JSON data.
  const [isValid, setIsValid] = useState(false);  // State for tracking the validity of the JSON data.
  const navigate = useNavigate();  // Allows navigation to different routes.

  /**
   * Handles JSON file upload, parses the file, and validates the data.
   * @param {Event} e - The file input change event.
   */
  const handleJsonUpload = (e) => {
    const file = e.target.files[0];  // Get the selected file.
    const reader = new FileReader();  // Create a new FileReader instance.

    // Triggered when the file is successfully read.
    reader.onload = async (event) => {
      try {
        const jsonData = JSON.parse(event.target.result);  // Parse the JSON data.
        setJsonFile(jsonData);  // Store the parsed JSON data.
        
        // Validate the JSON data against existing Firebase records.
        const isValidData = await validateJsonData(jsonData);
        setIsValid(isValidData);  // Update the validity state.
        setImportedData(jsonData);  // Store the valid JSON data for import.
      } catch (error) {
        console.error("Error parsing JSON:", error);  // Log any JSON parsing errors.
        alert("Invalid JSON format");  // Alert the user if the JSON is invalid.
      }
    };
    
    if (file) {
      reader.readAsText(file);  // Read the file content as text if a file is selected.
    }
  };

  /**
   * Validates the uploaded JSON data by checking against existing Firebase data.
   * @param {Object} jsonData - The JSON data to be validated.
   * @returns {Boolean} - True if the data is valid, otherwise false.
   */
  const validateJsonData = async (jsonData) => {
    try {
      const patientsQuery = collection(db, "patients");  // Reference to the "patients" collection in Firebase.
      const patientsSnapshot = await getDocs(patientsQuery);  // Fetch all documents in the "patients" collection.

      // Iterate through existing patients to perform validation logic.
      for (const patientDoc of patientsSnapshot.docs) {
        const personalRef = doc(db, "patients", patientDoc.id, "Personal", "Details");  // Reference to the personal details of each patient.
        const personalSnap = await getDoc(personalRef);  // Fetch personal details for each patient.
        if (personalSnap.exists()) {
          // Add validation logic here (e.g., check if a patient with the same details already exists).
        }
      }
      return true;  // Return true for valid data (this can be enhanced with actual validation).
    } catch (error) {
      console.error("Error validating JSON data:", error);  // Log any validation errors.
      return false;  // Return false if validation fails.
    }
  };

  /**
   * Handles the import submission by adding the validated data to Firebase.
   */
  const handleImportSubmit = async () => {
    if (isValid && importedData) {  // Only proceed if the data is valid and exists.
      try {
        await addDoc(collection(db, "patients"), importedData);  // Add the imported data to the "patients" collection.
        navigate('/');  // Redirect to the homepage after successful import.
      } catch (error) {
        console.error("Error importing data:", error);  // Log any errors during the import process.
        alert("Error importing data.");  // Notify the user of an import failure.
      }
    } else {
      alert("Invalid data. Cannot import.");  // Alert the user if the data is invalid.
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup">
        <button className="close-btn" onClick={closePopup}>X</button>  {/* Close the popup */}
        <h2>Import Patients</h2>
        
        {/* File input for uploading JSON */}
        <input type="file" accept=".json" onChange={handleJsonUpload} />  
        
        {/* Display the imported data and allow submission if valid */}
        {jsonFile && isValid && (
          <div>
            <h3>Imported Data:</h3>
            <pre>{JSON.stringify(importedData, null, 2)}</pre>  {/* Display the parsed JSON data */}
            <button className="submit-btn" onClick={handleImportSubmit}>Import</button>  {/* Button to submit the imported data */}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportPatientPopup;
