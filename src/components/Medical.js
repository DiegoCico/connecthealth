// src/components/Medical.js
import React from 'react';

const Medical = ({ patientData, handleChange }) => (
  <div className="tab-content fade-in">
    <h2>Medical Information</h2>
    <div className="form-group">
      <label>Medical History</label>
      <textarea name="medicalHistory" value={patientData.medicalHistory} onChange={handleChange} placeholder="Medical History"></textarea>
    </div>
    <div className="form-group">
      <label>Current Medications</label>
      <input type="text" name="currentMedications" value={patientData.currentMedications} onChange={handleChange} placeholder="Current Medications" />
    </div>
    <div className="form-group">
      <label>Allergies</label>
      <input type="text" name="allergies" value={patientData.allergies} onChange={handleChange} placeholder="Allergies" />
    </div>
    <div className="form-group">
      <label>Primary Care Physician</label>
      <input type="text" name="physician" value={patientData.physician} onChange={handleChange} placeholder="Physician Name" />
    </div>
  </div>
);

export default Medical;
