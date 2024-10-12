import React from 'react';
import '../css/Patient2.css'

const Personal = ({ patientData, handleChange, handleInsuranceFileChange, handlePatientFileChange, isEditable }) => (
  <div className="tab-content fade-in">
    <div className='tab-title-container'>
      <h2>Personal Information</h2>
    </div>

    <div className='data-collection-container'>
      
      <div className='profile-picture-container'>
        <div className="form-group">
            <label>Patient Photo</label>
            <label className="profile-picture-button">
                <input 
                  type="file" 
                  onChange={handlePatientFileChange} 
                  style={{ display: 'none' }} 
                  disabled={!isEditable} // Disable file upload unless in edit mode
                />
                <span>Upload Photo</span>
            </label>
        </div>
        <div className="form-group">
            <label>Name</label>
            <input 
              type="text" 
              name="name" 
              value={patientData.name} 
              onChange={handleChange} 
              placeholder="Full Name" 
              disabled={!isEditable} // Disable input unless in edit mode
            />
        </div>
      </div>

      <div className='personal-info-container'>
        <div className="form-group">
          <label>Date of Birth</label>
          <input 
            type="date" 
            name="DOB" 
            value={patientData.DOB} 
            onChange={handleChange} 
            placeholder="Date of Birth" 
            disabled={!isEditable} // Disable input unless in edit mode
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input 
            type="email" 
            name="email" 
            value={patientData.email} 
            onChange={handleChange} 
            placeholder="Email" 
            disabled={!isEditable} // Disable input unless in edit mode
          />
        </div>
        <div className="form-group">
          <label>Phone Number</label>
          <input 
            type="tel" 
            name="phoneNumber" 
            value={patientData.phoneNumber} 
            onChange={handleChange} 
            placeholder="Phone Number" 
            disabled={!isEditable} // Disable input unless in edit mode
          />
        </div>
        <div className="form-group">
          <label>Address</label>
          <input 
            type="text" 
            name="address" 
            value={patientData.address} 
            onChange={handleChange} 
            placeholder="Address" 
            disabled={!isEditable} // Disable input unless in edit mode
          />
        </div>
        <div className="form-group">
          <label>Emergency Contact</label>
          <input 
            type="text" 
            name="emergencyContact" 
            value={patientData.emergencyContact} 
            onChange={handleChange} 
            placeholder="Emergency Contact" 
            disabled={!isEditable} // Disable input unless in edit mode
          />
        </div>
      </div>

      <div className='insurance-picture-container'>
        <div className="form-group">
          <label>Insurance Photo</label>
          <input 
            type="file" 
            onChange={handleInsuranceFileChange} 
            disabled={!isEditable} // Disable file upload unless in edit mode
          />
        </div>
      </div>
    </div>

  </div>
);

export default Personal;
