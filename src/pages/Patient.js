import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, uploadFile } from '../firebase';
import Personal from '../components/Personal';
import Medical from '../components/Medical';
import Financial from '../components/Financial';
import '../css/Patient2.css';
import SideNav from '../components/SideNav';

const Patient = () => {
  const { uid } = useParams();
  const location = useLocation();
  const { modificationMode } = location.state || {};

  const [patientData, setPatientData] = useState({
    name: '', DOB: '', email: '', phoneNumber: '', address: '',
    emergencyContact: '', insurancePhoto: '', patientPhoto: '',
    medicalHistory: '', currentMedications: '', allergies: '',
    physician: '', insuranceProvider: '', insurancePolicy: '',
    outstandingBills: ''
  });

  const [isFormValid, setIsFormValid] = useState(false);
  const [insuranceFile, setInsuranceFile] = useState(null);
  const [patientFile, setPatientFile] = useState(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [isEditable, setIsEditable] = useState(true); // New state to track edit mode

  useEffect(() => {
    const fetchData = async () => {
      try {
        const personalRef = doc(db, 'patients', uid, 'Personal', 'Details');
        const personalSnap = await getDoc(personalRef);

        const medicalRef = doc(db, 'patients', uid, 'Medical', 'Details');
        const medicalSnap = await getDoc(medicalRef);

        const financialRef = doc(db, 'patients', uid, 'Financial', 'Details');
        const financialSnap = await getDoc(financialRef);

        if (personalSnap.exists()) {
          setPatientData(prevData => ({
            ...prevData,
            ...personalSnap.data()
          }));
        }
        if (medicalSnap.exists()) {
          setPatientData(prevData => ({
            ...prevData,
            ...medicalSnap.data()
          }));
        }
        if (financialSnap.exists()) {
          setPatientData(prevData => ({
            ...prevData,
            ...financialSnap.data()
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

  useEffect(() => {
    const isValid = patientData.name && patientData.DOB && patientData.email && patientData.phoneNumber && patientData.address;
    setIsFormValid(isValid);
  }, [patientData]);

  const handleSubmit = async () => {
    const cleanPatientData = Object.fromEntries(Object.entries(patientData).filter(([_, value]) => value !== undefined));

    try {
      let insurancePhotoUrl = cleanPatientData.insurancePhoto;
      let patientPhotoUrl = cleanPatientData.patientPhoto;

      if (insuranceFile) {
        insurancePhotoUrl = await uploadFile(insuranceFile, `${uid}-insurance`, setUploadProgress, 'insurance');
      }

      if (patientFile) {
        patientPhotoUrl = await uploadFile(patientFile, `${uid}-photo`, setUploadProgress, 'patient');
        setPatientData(prevData => ({
          ...prevData,
          patientPhoto: patientPhotoUrl
        }));
      }

      if (activeTab === 'personal') {
        const personalRef = doc(db, 'patients', uid, 'Personal', 'Details');
        await setDoc(personalRef, {
          name: cleanPatientData.name,
          DOB: cleanPatientData.DOB,
          email: cleanPatientData.email,
          phoneNumber: cleanPatientData.phoneNumber,
          address: cleanPatientData.address,
          emergencyContact: cleanPatientData.emergencyContact,
          insurancePhoto: insurancePhotoUrl || '',
          patientPhoto: patientPhotoUrl || ''
        }, { merge: true });
      }

      setShowSuccessPopup(true);
      setIsEditable(false); // Disable edit mode after creation
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const handleChange = (e) => setPatientData({ ...patientData, [e.target.name]: e.target.value });
  const handleInsuranceFileChange = (e) => setInsuranceFile(e.target.files[0]);
  const handlePatientFileChange = (e) => setPatientFile(e.target.files[0]);

  const toggleEditMode = () => {
    setIsEditable(prevState => !prevState);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return (
          <Personal
            patientData={patientData}
            handleChange={handleChange}
            handleInsuranceFileChange={handleInsuranceFileChange}
            handlePatientFileChange={handlePatientFileChange}
            isEditable={isEditable} // Pass edit mode to Personal component
          />
        );
      case 'medical':
        return <Medical patientData={patientData} handleChange={handleChange} isEditable={isEditable} />;
      case 'financial':
        return <Financial patientData={patientData} handleChange={handleChange} uid={uid} isEditable={isEditable} />;
      default:
        return null;
    }
  };

  return (
    <div className="patient-container">
      <div className='sidebar-container'>
        <SideNav />
      </div>

      <div className='patient-data'>
        <div className="tab-buttons">
          <button className={activeTab === 'personal' ? 'active' : ''} onClick={() => setActiveTab('personal')}>Personal</button>
          <button className={activeTab === 'medical' ? 'active' : ''} onClick={() => setActiveTab('medical')}>Medical</button>
          <button className={activeTab === 'financial' ? 'active' : ''} onClick={() => setActiveTab('financial')}>Financial</button>
        </div>

        {renderTabContent()}

        {modificationMode && activeTab === 'personal' && (
          <div className="create-account-button">
            {!isEditable ? (
              <button onClick={toggleEditMode}>Edit</button>
            ) : (
              <button disabled={!isFormValid} onClick={handleSubmit}>Save</button>
            )}
          </div>
        )}
        {/* : (
          <div className="patient-data">
            <h2>{patientData.name}</h2>
            <p><strong>Date of Birth:</strong> {patientData.DOB}</p>
            <p><strong>Email:</strong> {patientData.email}</p>
            <p><strong>Phone Number:</strong> {patientData.phoneNumber}</p>

            {patientData.patientPhoto ? (
              <img src={patientData.patientPhoto} alt="Patient" className="patient-photo" />
            ) : (
              <p>No photo available</p>
            )}
          </div>
        )} */}

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
