import React, { useState, useEffect } from 'react';
import '../css/Patient2.css';
import { ref, getStorage } from 'firebase/storage';
import { app, db, uploadFile } from '../firebase'; 
import { updateDoc, doc, getDoc } from 'firebase/firestore';

/**
 * Component for managing and displaying a patient's personal information, including photo upload functionality.
 *
 * @param {string} uid - The unique ID of the patient.
 * @param {object} patientData - An object containing the patient's personal data (e.g., name, DOB, email, etc.).
 * @param {function} handleChange - Callback function to handle changes in the input fields.
 * @param {function} handleInsuranceFileChange - Callback function to handle the insurance photo upload.
 * @param {boolean} isEditable - Flag to enable or disable input fields.
 * @param {object} validationErrors - Object containing validation errors for each field.
 */
const Personal = ({ uid, patientData, handleChange, handleInsuranceFileChange, isEditable, validationErrors }) => {
  const [photoPreview, setPhotoPreview] = useState(patientData.photoURL || ''); // Holds the preview of the patient photo
  const [selectedFile, setSelectedFile] = useState(null); // Holds the file object for the selected patient photo
  const [uploadProgress, setUploadProgress] = useState({}); // Stores the progress of the upload
  const storage = getStorage(app); // Firebase storage reference

  /**
   * useEffect hook that fetches the patient photo from Firestore when the component is mounted.
   * If the patient photo exists in Firestore, it sets the preview in the component state.
   */
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

  /**
   * Handles the local preview of the uploaded patient photo.
   * This function is called when the user selects a file for the patient photo.
   *
   * @param {object} event - The file input change event.
   */
  const handlePatientFileChangeLocal = (event) => {
    const file = event.target.files[0];
    if (file) {
      const previewURL = URL.createObjectURL(file); // Generate a preview URL for the selected file
      setPhotoPreview(previewURL); // Set the local preview
      setSelectedFile(file); // Store the selected file
    }
  };

  /**
   * Handles the saving of the selected patient photo to Firebase Storage.
   * Once the photo is uploaded, the Firestore document is updated with the photo URL.
   */
  const handleSavePhoto = async () => {
    if (!selectedFile) {
      console.error('No file selected for upload');
      return;
    }

    const path = `${uid}-photo`; // Define the path using uid

    try {
      const downloadURL = await uploadFile(selectedFile, path, setUploadProgress, 'photo'); // Upload file to Firebase Storage
      console.log('File uploaded successfully, available at:', downloadURL);

      // Update Firestore with the new URL
      const patientRef = doc(db, 'patients', uid, 'Personal', 'Details');
      await updateDoc(patientRef, { patientPhoto: downloadURL });
      console.log('Firestore updated with patient photo URL');

      // Update local state with the new photo URL
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
