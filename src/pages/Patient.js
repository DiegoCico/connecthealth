import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db } from '../firebase'; // Ensure you have Firebase initialized in your firebase.js

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
  const [activeTab, setActiveTab] = useState('medical'); // State to control the active tab
  const storage = getStorage();

  // Function to check if all fields and files are filled
  const validateForm = () => {
    const allFieldsFilled = Object.values(patientData).every((field) => field.trim() !== '');
    const filesValid = insuranceFile && patientFile;
    setIsFormValid(allFieldsFilled && filesValid);
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
  }, [uid, modificationMode]);

  useEffect(() => {
    validateForm(); // Validate the form whenever the patientData or files change
  }, [patientData, insuranceFile, patientFile]);

  const handleChange = (e) => {
    setPatientData({ ...patientData, [e.target.name]: e.target.value });
  };

  const handleInsuranceFileChange = (e) => {
    setInsuranceFile(e.target.files[0]);
  };

  const handlePatientFileChange = (e) => {
    setPatientFile(e.target.files[0]);
  };

  const uploadFile = async (file, path, type) => {
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress((prev) => ({ ...prev, [type]: progress }));
        },
        (error) => {
          console.error("Error uploading file: ", error);
          reject(error);
        },
        async () => {
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
      alert("Please fill in all fields and upload both photos before saving.");
    }
  };

  const renderTabContent = () => {
    if (activeTab === 'medical') {
      return (
        <div className="tab-content fade-in">
          <h2>Medical Information</h2>
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
            <label>Insurance Photo</label>
            <input type="file" accept="image/*" onChange={handleInsuranceFileChange} />
            {uploadProgress.insurance > 0 && (
              <div className="progress-bar">
                <div className="progress" style={{ width: `${uploadProgress.insurance}%` }}></div>
              </div>
            )}
          </div>

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
        </div>
      );
    } else if (activeTab === 'financial') {
      return (
        <div className="tab-content fade-in">
          <h2>Financial Information</h2>
          {/* Add fields related to financial information here */}
          <p>Financial information content goes here...</p>
        </div>
      );
    }
  };

  return (
    <div className="patient-container">
      <div className="tab-buttons">
        <button className={activeTab === 'medical' ? 'active' : ''} onClick={() => setActiveTab('medical')}>
          Medical
        </button>
        <button className={activeTab === 'financial' ? 'active' : ''} onClick={() => setActiveTab('financial')}>
          Financial
        </button>
      </div>
      {renderTabContent()}

      {modificationMode && (
        <button onClick={handleSave} disabled={!isFormValid} className="save-button">
          Save Patient
        </button>
      )}
    </div>
  );
};

export default Patient;
