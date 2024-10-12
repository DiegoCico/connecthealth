import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, uploadFile, deleteFile } from '../firebase';  // Import deleteFile
import Personal from '../components/Personal';
import Medical from '../components/Medical';
import Financial from '../components/Financial';
import '../css/Patient2.css';
import SideNav from '../components/SideNav';

const Patient = () => {
  const { uid } = useParams();  // Retrieves 'uid' from the route, identifying the patient.
  const location = useLocation();  // Retrieves the current location, including potential state like 'modificationMode'.
  const { modificationMode } = location.state || {};  // Checks if the component is in modification mode (edit mode).

  // Active tab state to switch between Personal, Medical, and Financial tabs.
  const [activeTab, setActiveTab] = useState('personal');  
  
  // Stores patient data, including personal info, medical history, and insurance.
  const [patientData, setPatientData] = useState({
    name: '', DOB: '', email: '', phoneNumber: '', address: '',
    emergencyContact: '', insurancePhoto: '', patientPhoto: '',
    medicalHistory: '', currentMedications: '', allergies: '',
    physician: '', insuranceProvider: '', insurancePolicy: '',
    outstandingBills: ''
  });

  const [insuranceFile, setInsuranceFile] = useState(null);  // State for insurance file upload.
  const [patientFile, setPatientFile] = useState(null);  // State for patient photo file upload.
  const [uploadProgress, setUploadProgress] = useState({});  // Tracks progress for file uploads.
  const [isEditable, setIsEditable] = useState(true);  // Toggles between edit and view modes.
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);  // Shows success popup after saving.
  const [validationErrors, setValidationErrors] = useState({});  // Tracks validation errors for required fields.

  // Fetch patient data from Firestore when component mounts or 'uid' changes.
  useEffect(() => {
    const fetchData = async () => {
      try {
        const personalRef = doc(db, 'patients', uid, 'Personal', 'Details');  // Reference to patient details in Firestore.
        const personalSnap = await getDoc(personalRef);  // Fetches patient document from Firestore.

        if (personalSnap.exists()) {
          setPatientData(prevData => ({
            ...prevData,
            ...personalSnap.data()  // Updates patientData with data from Firestore.
          }));
        }
      } catch (error) {
        console.error('Error fetching patient data:', error);  // Logs errors if fetching fails.
      }
    };

    if (!modificationMode) {
      fetchData();  // Only fetch data if not in modification mode.
    }
  }, [uid, modificationMode]);  // Depend on 'uid' and 'modificationMode'.

  // Handles the change of the patient file (photo) and uploads it.
  const handlePatientFileChange = async (event) => {
    const file = event.target.files[0];  // Gets the selected file.
    if (file) {
      if (patientData.patientPhoto) {
        await deleteFile(`${uid}-photo`);  // Deletes the old photo if it exists.
      }
      const patientPhotoUrl = await uploadFile(file, `${uid}-photo`, setUploadProgress, 'patient');  // Uploads the new file.
      setPatientData(prevData => ({
        ...prevData,
        patientPhoto: patientPhotoUrl  // Updates patient photo URL in state.
      }));
    }
  };

  // Validates and submits the patient data to Firestore.
  const handleSubmit = async () => {
    const errors = {};

    // Validate required fields.
    if (!patientData.name) errors.name = true;
    if (!patientData.DOB) errors.DOB = true;
    if (!patientData.email) errors.email = true;
    if (!patientData.phoneNumber) errors.phoneNumber = true;
    if (!patientData.address) errors.address = true;
    if (!patientData.emergencyContact) errors.emergencyContact = true;

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);  // Set validation errors if any fields are missing.
      return;
    }

    try {
      let patientPhotoUrl = patientData.patientPhoto;

      // Upload patient photo if a new file is selected.
      if (patientFile) {
        patientPhotoUrl = await uploadFile(patientFile, `${uid}-photo`, setUploadProgress, 'patient');
      }

      const personalRef = doc(db, 'patients', uid, 'Personal', 'Details');  // Reference to Firestore document.
      await setDoc(personalRef, {
        ...patientData,
        patientPhoto: patientPhotoUrl || ''  // Save the patient data including the new photo URL.
      }, { merge: true });

      setShowSuccessPopup(true);  // Show success popup after save.
      setIsEditable(false);  // Switch back to view mode after saving.
      setValidationErrors({});  // Clear validation errors after successful save.
    } catch (error) {
      console.error('Error saving data:', error);  // Logs any errors during save.
    }
  };

  // Handles changes to form input fields and updates the patientData state.
  const handleChange = (e) => {
    setPatientData({ ...patientData, [e.target.name]: e.target.value });  // Update the corresponding field in patientData.
    setValidationErrors((prevErrors) => ({ ...prevErrors, [e.target.name]: false }));  // Clear validation error for the field being edited.
  };

  // Handles the change of the insurance file (photo).
  const handleInsuranceFileChange = (e) => setInsuranceFile(e.target.files[0]);

  // Toggles the edit mode between editable and non-editable states.
  const toggleEditMode = () => setIsEditable(prevState => !prevState);

  // Renders the content of the currently active tab (Personal, Medical, or Financial).
  const renderTabContent = () => {
    switch (activeTab) {
      case 'medical':
        return (
          <Medical
            uid={uid}
          />
        );
      case 'financial':
        return (
          <Financial
            uid={uid}
          />
        );
      default:
        return (
          <Personal
            uid={uid}
            patientData={patientData}
            handleChange={handleChange}
            handleInsuranceFileChange={handleInsuranceFileChange}
            handlePatientFileChange={handlePatientFileChange}
            isEditable={isEditable}
            validationErrors={validationErrors}
          />
        );
    }
  };

  // Checks if all required personal info fields have been filled.
  const isPersonalInfoFilled = patientData.name && patientData.DOB && patientData.email && patientData.phoneNumber && patientData.address && patientData.emergencyContact;

  return (
    <div className="patient-container">
      <div className='sidebar-container'>
        <SideNav />
      </div>

      <div className='patient-data'>
        <div className="tab-buttons">
          <button className={activeTab === 'personal' ? 'active' : ''} onClick={() => setActiveTab('personal')}>Personal</button>
          <button 
            className={activeTab === 'medical' ? 'active' : ''} 
            onClick={() => isPersonalInfoFilled && setActiveTab('medical')}  // Only switch to 'medical' if personal info is filled.
            disabled={!isPersonalInfoFilled}  // Disable button if personal info isn't filled.
          >
            Medical
          </button>
          <button 
            className={activeTab === 'financial' ? 'active' : ''} 
            onClick={() => isPersonalInfoFilled && setActiveTab('financial')}  // Only switch to 'financial' if personal info is filled.
            disabled={!isPersonalInfoFilled}  // Disable button if personal info isn't filled.
          >
            Financial
          </button>
        </div>

        {renderTabContent()}  {/* Render the content of the active tab */}

        {modificationMode && activeTab === 'personal' && (  // Only show edit/save buttons in Personal tab during modification mode.
          <div className="create-account-button">
            {!isEditable ? (
              <button onClick={toggleEditMode}>Edit</button>  // Show Edit button when not editable.
            ) : (
              <button disabled={!patientData.name || !patientData.DOB} onClick={handleSubmit}>Save</button>  // Show Save button when editable.
            )}
          </div>
        )}

        {showSuccessPopup && (  // Show success popup after saving.
          <div className="success-popup">
            <p>Account saved successfully!</p>
            <button onClick={() => setShowSuccessPopup(false)}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Patient;
