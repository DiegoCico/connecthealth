import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

const Patient = () => {
  const { uid } = useParams(); // Get the patient ID from the URL
  const location = useLocation(); // Get the state from the navigation
  const { modificationMode } = location.state || {}; // Get the modification mode flag
  const [patientData, setPatientData] = useState({
    name: '',
    DOB: '',
    email: '',
    phoneNumber: '',
    address: '',
    emergencyContact: '',
    insurancePhoto: '',
    patientPhoto: ''
  });
  const [isFormValid, setIsFormValid] = useState(false); // Track if the form is valid
  const db = getFirestore();

  // Function to check if all fields are filled
  const validateForm = () => {
    const allFieldsFilled = Object.values(patientData).every((field) => field.trim() !== '');
    setIsFormValid(allFieldsFilled);
  };

  useEffect(() => {
    if (!modificationMode) {
      const fetchPatientData = async () => {
        const personalRef = doc(db, `patients/${uid}/Personal/personalData`);
        const personalSnapshot = await getDoc(personalRef);

        if (personalSnapshot.exists()) {
          setPatientData(personalSnapshot.data());
        } else {
          console.log("No such document!");
        }
      };

      fetchPatientData();
    }
  }, [uid, modificationMode]);

  useEffect(() => {
    validateForm(); // Validate the form whenever the patientData changes
  }, [patientData]);

  const handleChange = (e) => {
    setPatientData({ ...patientData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (isFormValid) {
      const personalRef = doc(db, `patients/${uid}/Personal/personalData`);
      await setDoc(personalRef, patientData);
      alert("Patient data saved successfully!");
    } else {
      alert("Please fill in all fields before creating the account.");
    }
  };

  return (
    <div>
      {modificationMode ? (
        <div>
          <h1>Create or Edit Patient</h1>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            {/* Create Account button */}
            <button 
              onClick={handleSave} 
              disabled={!isFormValid} // Disable button if form is not valid
              style={{
                backgroundColor: isFormValid ? '#007BFF' : '#d3d3d3',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '5px',
                cursor: isFormValid ? 'pointer' : 'not-allowed',
                marginBottom: '20px'
              }}
            >
              Create Account
            </button>
          </div>
          <input 
            type="text" 
            name="name" 
            value={patientData.name} 
            onChange={handleChange} 
            placeholder="Name" 
          />
          <input 
            type="text" 
            name="DOB" 
            value={patientData.DOB} 
            onChange={handleChange} 
            placeholder="DOB" 
          />
          <input 
            type="email" 
            name="email" 
            value={patientData.email} 
            onChange={handleChange} 
            placeholder="Email" 
          />
          <input 
            type="text" 
            name="phoneNumber" 
            value={patientData.phoneNumber} 
            onChange={handleChange} 
            placeholder="Phone" 
          />
          <input 
            type="text" 
            name="address" 
            value={patientData.address} 
            onChange={handleChange} 
            placeholder="Address" 
          />
          <input 
            type="text" 
            name="emergencyContact" 
            value={patientData.emergencyContact} 
            onChange={handleChange} 
            placeholder="Emergency Contact" 
          />
          <input 
            type="text" 
            name="insurancePhoto" 
            value={patientData.insurancePhoto} 
            onChange={handleChange} 
            placeholder="Insurance Photo URL" 
          />
          <input 
            type="text" 
            name="patientPhoto" 
            value={patientData.patientPhoto} 
            onChange={handleChange} 
            placeholder="Patient Photo URL" 
          />
        </div>
      ) : patientData ? (
        <div>
          <h1>Patient Details</h1>
          <p><strong>Name:</strong> {patientData.name}</p>
          <p><strong>DOB:</strong> {patientData.DOB}</p>
          <p><strong>Email:</strong> {patientData.email}</p>
          <p><strong>Phone:</strong> {patientData.phoneNumber}</p>
          <p><strong>Address:</strong> {patientData.address}</p>
          <p><strong>Emergency Contact:</strong> {patientData.emergencyContact}</p>
          <p><strong>Insurance Photo:</strong> <img src={patientData.insurancePhoto} alt="Insurance" /></p>
          <p><strong>Patient Photo:</strong> <img src={patientData.patientPhoto} alt="Patient" /></p>
        </div>
      ) : (
        <p>Loading patient details...</p>
      )}
    </div>
  );
};

export default Patient;
