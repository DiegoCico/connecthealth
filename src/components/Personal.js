// src/components/Personal.js
import React from 'react';

const Personal = ({ patientData, handleChange, handleInsuranceFileChange, handlePatientFileChange }) => (
  <div className="tab-content fade-in">
    <h2>Personal Information</h2>
    <div className="form-group">
      <label>Name</label>
      <input type="text" name="name" value={patientData.name} onChange={handleChange} placeholder="Full Name" />
    </div>
    <div className="form-group">
      <label>Date of Birth</label>
      <input type="date" name="DOB" value={patientData.DOB} onChange={handleChange} placeholder="Date of Birth" />
    </div>
    <div className="form-group">
      <label>Email</label>
      <input type="email" name="email" value={patientData.email} onChange={handleChange} placeholder="Email" />
    </div>
    <div className="form-group">
      <label>Phone Number</label>
      <input type="tel" name="phoneNumber" value={patientData.phoneNumber} onChange={handleChange} placeholder="Phone Number" />
    </div>
    <div className="form-group">
      <label>Address</label>
      <input type="text" name="address" value={patientData.address} onChange={handleChange} placeholder="Address" />
    </div>
    <div className="form-group">
      <label>Emergency Contact</label>
      <input type="text" name="emergencyContact" value={patientData.emergencyContact} onChange={handleChange} placeholder="Emergency Contact" />
    </div>
    <div className="form-group">
      <label>Insurance Photo</label>
      <input type="file" onChange={handleInsuranceFileChange} />
    </div>
    <div className="form-group">
      <label>Patient Photo</label>
      <input type="file" onChange={handlePatientFileChange} />
    </div>
  </div>
);

export default Personal;
