import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db } from '../firebase'; // Ensure you have Firebase initialized in your firebase.js
// import '../css/Patient.css'; // Assuming you added the CSS styles here

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
  const [insuranceFile, setInsuranceFile] = useState(null); // File state for insurance photo
  const [patientFile, setPatientFile] = useState(null); // File state for patient photo
  const [uploadProgress, setUploadProgress] = useState({ insurance: 0, patient: 0 }); // Progress bar state
  const storage = getStorage();

  // Function to check if all fields are filled
  const validateForm = () => {
    const allFieldsFilled = Object.values(patientData).every((field) => field.trim() !== '');
    setIsFormValid(allFieldsFilled);
  };

  useEffect(() => {
    if (!modificationMode) {
      const fetchPatientData = async () => {
        try {
          const personalRef = doc(db, `patients/${uid}/Personal/`);
          const personalSnapshot = await getDoc(personalRef);

          if (personalSnapshot.exists()) {
            setPatientData(personalSnapshot.data());
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error("Error fetching patient data: ", error);
        }
      };

      fetchPatientData();
    }
  }, [uid, modificationMode, db]);

  useEffect(() => {
    validateForm(); // Validate the form whenever the patientData changes
  }, [patientData]);

  const handleChange = (e) => {
    setPatientData({ ...patientData, [e.target.name]: e.target.value });
  };

  // File upload handler for insurance photo
  const handleInsuranceFileChange = (e) => {
    setInsuranceFile(e.target.files[0]);
  };

  // File upload handler for patient photo
  const handlePatientFileChange = (e) => {
    setPatientFile(e.target.files[0]);
  };

  // Function to upload the file and get its URL
  const uploadFile = async (file, path, type) => {
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Calculate and set the progress percentage
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress((prev) => ({ ...prev, [type]: progress }));
        },
        (error) => {
          console.error("Error uploading file: ", error);
          reject(error);
        },
        async () => {
          // File upload complete
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  };

  const handleSave = async () => {
    if (isFormValid) {
      try {
        let updatedPatientData = { ...patientData };

        if (insuranceFile) {
          const insurancePhotoURL = await uploadFile(insuranceFile, `patients/${uid}/insurancePhoto`, 'insurance');
          updatedPatientData.insurancePhoto = insurancePhotoURL;
        }

        if (patientFile) {
          const patientPhotoURL = await uploadFile(patientFile, `patients/${uid}/patientPhoto`, 'patient');
          updatedPatientData.patientPhoto = patientPhotoURL;
        }

        const personalRef = doc(db, `patients/${uid}/Personal/personalData`);
        await setDoc(personalRef, updatedPatientData);

        alert("Patient data saved successfully!");
      } catch (error) {
        console.error("Error saving patient data: ", error);
        alert("Error saving patient data.");
      }
    } else {
      alert("Please fill in all fields before creating the account.");
    }
  };

  return (
    <div className="patient-container">
      {modificationMode ? (
        <div className="form-section">
          <h1>Create or Edit Patient</h1>

          <div className="form-group">
            <label>Name</label>
            <input type="text" name="name" value={patientData.name} onChange={handleChange} placeholder="Name" />
          </div>

          <div className="form-group">
            <label>Date of Birth</label>
            <input type="date" name="DOB" value={patientData.DOB} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={patientData.email} onChange={handleChange} placeholder="Email" />
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input type="text" name="phoneNumber" value={patientData.phoneNumber} onChange={handleChange} placeholder="Phone" />
          </div>

          <div className="form-group">
            <label>Address</label>
            <input type="text" name="address" value={patientData.address} onChange={handleChange} placeholder="Address" />
          </div>

          <div className="form-group">
            <label>Emergency Contact</label>
            <input type="text" name="emergencyContact" value={patientData.emergencyContact} onChange={handleChange} placeholder="Emergency Contact" />
          </div>

          {/* Insurance Photo Upload */}
          <div className="form-group">
            <label>Insurance Photo</label>
            <input type="file" accept="image/*" onChange={handleInsuranceFileChange} />
            {uploadProgress.insurance > 0 && (
              <div className="progress-bar">
                <div className="progress" style={{ width: `${uploadProgress.insurance}%` }}></div>
              </div>
            )}
          </div>

          {/* Patient Photo Upload */}
          <div className="form-group">
            <label>Patient Photo</label>
            <div className="photo-upload-box" onClick={() => document.getElementById('patientPhotoInput').click()}>
              <img src={patientData.patientPhoto || 'placeholder.jpg'} alt="Patient" />
              <input id="patientPhotoInput" type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePatientFileChange} />
            </div>
            {uploadProgress.patient > 0 && (
              <div className="progress-bar">
                <div className="progress" style={{ width: `${uploadProgress.patient}%` }}></div>
              </div>
            )}
          </div>

          <button onClick={handleSave} disabled={!isFormValid} className="save-button">
            Save Patient
          </button>
        </div>
      ) : patientData ? (
        <div className="patient-details">
          <h1>Patient Details</h1>
          <p><strong>Name:</strong> {patientData.name}</p>
          <p><strong>Date of Birth:</strong> {patientData.DOB}</p>
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
