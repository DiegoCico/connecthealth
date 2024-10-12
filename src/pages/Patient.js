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
  const { uid } = useParams();
  console.log(uid)
  const location = useLocation();
  const { modificationMode } = location.state || {};

  const [activeTab, setActiveTab] = useState('personal');  // State for active tab
  const [patientData, setPatientData] = useState({
    name: '', DOB: '', email: '', phoneNumber: '', address: '',
    emergencyContact: '', insurancePhoto: '', patientPhoto: '',
    medicalHistory: '', currentMedications: '', allergies: '',
    physician: '', insuranceProvider: '', insurancePolicy: '',
    outstandingBills: ''
  });

  const [insuranceFile, setInsuranceFile] = useState(null);
  const [patientFile, setPatientFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});
  const [isEditable, setIsEditable] = useState(true);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [validationErrors, setValidationErrors] = useState({}); // State for validation errors

  useEffect(() => {
    const fetchData = async () => {
      try {
        const personalRef = doc(db, 'patients', uid, 'Personal', 'Details');
        const personalSnap = await getDoc(personalRef);

        if (personalSnap.exists()) {
          setPatientData(prevData => ({
            ...prevData,
            ...personalSnap.data()
          }));
        }
      } catch (error) {
        console.error('Error fetching patient data:', error);
      }
    };

    if (!modificationMode) {
      fetchData();
    }
  }, [uid, modificationMode]);

  const handlePatientFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      if (patientData.patientPhoto) {
        await deleteFile(`${uid}-photo`);
      }
      const patientPhotoUrl = await uploadFile(file, `${uid}-photo`, setUploadProgress, 'patient');
      setPatientData(prevData => ({
        ...prevData,
        patientPhoto: patientPhotoUrl
      }));
    }
  };

  const handleSubmit = async () => {
    const errors = {};

    // Validation for required fields
    if (!patientData.name) errors.name = true;
    if (!patientData.DOB) errors.DOB = true;
    if (!patientData.email) errors.email = true;
    if (!patientData.phoneNumber) errors.phoneNumber = true;
    if (!patientData.address) errors.address = true;
    if (!patientData.emergencyContact) errors.emergencyContact = true;

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      let patientPhotoUrl = patientData.patientPhoto;

      if (patientFile) {
        patientPhotoUrl = await uploadFile(patientFile, `${uid}-photo`, setUploadProgress, 'patient');
      }

      const personalRef = doc(db, 'patients', uid, 'Personal', 'Details');
      await setDoc(personalRef, {
        ...patientData,
        patientPhoto: patientPhotoUrl || ''
      }, { merge: true });

      setShowSuccessPopup(true);
      setIsEditable(false);
      setValidationErrors({});  // Clear errors on successful save
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const handleChange = (e) => {
    setPatientData({ ...patientData, [e.target.name]: e.target.value });
    console.log(patientData)
    setValidationErrors((prevErrors) => ({ ...prevErrors, [e.target.name]: false })); // Clear field error on change
  };

  const handleInsuranceFileChange = (e) => setInsuranceFile(e.target.files[0]);

  const toggleEditMode = () => setIsEditable(prevState => !prevState);

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

  // Check if personal information has been filled
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
            onClick={() => isPersonalInfoFilled && setActiveTab('medical')} // Only switch to 'medical' if personal info is filled
            disabled={!isPersonalInfoFilled}  // Disable if personal info isn't filled
          >
            Medical
          </button>
          <button 
            className={activeTab === 'financial' ? 'active' : ''} 
            onClick={() => isPersonalInfoFilled && setActiveTab('financial')}  // Only switch to 'financial' if personal info is filled
            disabled={!isPersonalInfoFilled}  // Disable if personal info isn't filled
          >
            Financial
          </button>
        </div>

        {renderTabContent()}

        {modificationMode && activeTab === 'personal' && ( // Only show edit and save buttons in Personal tab
          <div className="create-account-button">
            {!isEditable ? (
              <button onClick={toggleEditMode}>Edit</button>
            ) : (
              <button disabled={!patientData.name || !patientData.DOB} onClick={handleSubmit}>Save</button>
            )}
          </div>
        )}

        {showSuccessPopup && (
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
