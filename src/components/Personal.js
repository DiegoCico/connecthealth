import React, { useState } from 'react';
import '../css/Patient2.css';

const Personal = ({ patientData, handleChange, handleInsuranceFileChange, handlePatientFileChange, isEditable, validationErrors }) => {
  const [photoPreview, setPhotoPreview] = useState(patientData.photoURL || '');

  const handlePatientFileChangeLocal = (event) => {
    const file = event.target.files[0];
    if (file) {
      const previewURL = URL.createObjectURL(file);
      setPhotoPreview(previewURL);
      handlePatientFileChange(event);  // Call parent handler
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
        </div>

        <div className="personal-info-container">
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
