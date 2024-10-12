import React, { useState, useEffect } from 'react';
import '../css/Patient2.css';
import { ref, getStorage } from 'firebase/storage';
import { app, db, uploadFile } from '../firebase'; 
import { updateDoc, doc, getDoc } from 'firebase/firestore';

const Personal = ({ uid, patientData, handleChange, handleInsuranceFileChange, isEditable, validationErrors }) => {
  const [photoPreview, setPhotoPreview] = useState(patientData.photoURL || '');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});
  const storage = getStorage(app);

  // Fetch patient photo from Firestore if it exists
  useEffect(() => {
    const fetchPatientPhoto = async () => {
      const patientRef = doc(db, 'patients', uid, 'Personal', 'Details');
      const docSnapshot = await getDoc(patientRef);
      if (docSnapshot.exists() && docSnapshot.data().patientPhoto) {
        setPhotoPreview(docSnapshot.data().patientPhoto); // Set the preview from Firestore
      }
    };
    fetchPatientPhoto();
  }, [uid]);

  const handlePatientFileChangeLocal = (event) => {
    const file = event.target.files[0];
    if (file) {
      const previewURL = URL.createObjectURL(file);
      setPhotoPreview(previewURL);
      setSelectedFile(file);
    }
  };

  const handleSavePhoto = async () => {
    if (!selectedFile) {
      console.error('No file selected for upload');
      return;
    }

    const path = `${uid}-photo`; // Define the path using uid

    try {
      const downloadURL = await uploadFile(selectedFile, path, setUploadProgress, 'photo');
      console.log('File uploaded successfully, available at:', downloadURL);

      // Update Firestore with the new URL
      const patientRef = doc(db, 'patients', uid, 'Personal', 'Details');
      await updateDoc(patientRef, { patientPhoto: downloadURL });
      console.log('Firestore updated with patient photo URL');

      // Update local state
      handleChange({ target: { name: 'photoURL', value: downloadURL } });
    } catch (error) {
      console.error('Error saving photo:', error);
    }
  };

  return (
    <div className="tab-content fade-in">
      <div className="tab-title-container">
        <h2>Personal Information</h2>
      </div>

      <div className="data-collection-container">
        <div className="profile-picture-container">
          <div className="form-group">
            <label>Patient Photo</label>
            {photoPreview ? (
              <div className="patient-photo-preview">
                <label className="profile-picture-button">
                  <img
                    src={photoPreview}
                    alt="Patient Photo"
                    className="patient-photo"
                    onClick={() => document.getElementById('file-input').click()}
                  />
                  <input
                    id="file-input"
                    type="file"
                    onChange={handlePatientFileChangeLocal}
                    style={{ display: 'none' }}
                    disabled={!isEditable}
                  />
                </label>
              </div>
            ) : (
              <label className="profile-picture-button">
                <input
                  type="file"
                  onChange={handlePatientFileChangeLocal}
                  style={{ display: 'none' }}
                  disabled={!isEditable}
                />
                <span>Upload Photo</span>
              </label>
            )}
          </div>

          <button onClick={handleSavePhoto} disabled={!photoPreview || !isEditable}>
            Save
          </button>
        </div>

        <div className="personal-info-container">
          <div className={`form-group ${validationErrors.name ? 'has-error' : ''}`}>
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={patientData.name}
              onChange={handleChange}
              placeholder="Full Name"
              disabled={!isEditable}
            />
          </div>

          <div className={`form-group ${validationErrors.DOB ? 'has-error' : ''}`}>
            <label>Date of Birth</label>
            <input
              type="date"
              name="DOB"
              value={patientData.DOB}
              onChange={handleChange}
              placeholder="Date of Birth"
              disabled={!isEditable}
            />
          </div>
          <div className={`form-group ${validationErrors.email ? 'has-error' : ''}`}>
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={patientData.email}
              onChange={handleChange}
              placeholder="Email"
              disabled={!isEditable}
            />
          </div>
          <div className={`form-group ${validationErrors.phoneNumber ? 'has-error' : ''}`}>
            <label>Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              value={patientData.phoneNumber}
              onChange={handleChange}
              placeholder="Phone Number"
              disabled={!isEditable}
            />
          </div>
          <div className={`form-group ${validationErrors.address ? 'has-error' : ''}`}>
            <label>Address</label>
            <input
              type="text"
              name="address"
              value={patientData.address}
              onChange={handleChange}
              placeholder="Address"
              disabled={!isEditable}
            />
          </div>
          <div className={`form-group ${validationErrors.emergencyContact ? 'has-error' : ''}`}>
            <label>Emergency Contact</label>
            <input
              type="text"
              name="emergencyContact"
              value={patientData.emergencyContact}
              onChange={handleChange}
              placeholder="Emergency Contact"
              disabled={!isEditable}
            />
          </div>
        </div>

        <div className="insurance-picture-container">
          <div className="form-group">
            <label>Insurance Photo</label>
            <input
              type="file"
              onChange={handleInsuranceFileChange}
              disabled={!isEditable}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Personal;
