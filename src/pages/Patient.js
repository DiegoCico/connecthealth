import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { doc, getDoc, setDoc, collection } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { db } from '../firebase';
import Personal from '../components/Personal';
import Medical from '../components/Medical';
import Financial from '../components/Financial';
import '../css/Patient2.css'
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
  const [showSuccessPopup, setShowSuccessPopup] = useState(false); // Success popup state
  const storage = getStorage();

  // Load personal, medical, and financial data on component mount if it's an existing user
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch personal data from 'Personal' sub-collection
        const personalRef = doc(db, 'patients', uid, 'Personal', 'Details');
        const personalSnap = await getDoc(personalRef);

        // Fetch medical data from 'Medical' sub-collection
        const medicalRef = doc(db, 'patients', uid, 'Medical', 'Details');
        const medicalSnap = await getDoc(medicalRef);

        // Fetch financial data from 'Financial' sub-collection
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

  // Validate that all fields in the Personal tab are filled out
  useEffect(() => {
    const isValid = patientData.name && patientData.DOB && patientData.email && patientData.phoneNumber && patientData.address;
    setIsFormValid(isValid);
  }, [patientData]);

  // Helper function to remove undefined fields
  const removeUndefinedFields = (data) => {
    return Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined)
    );
  };

  // Save data based on active tab
  // Save data based on active tab
const handleSubmit = async () => {
    const cleanPatientData = removeUndefinedFields(patientData); // Remove undefined fields
  
    try {
      if (activeTab === 'personal') {
        // Correct: Add a specific document ID, such as 'Details'
        const personalRef = doc(db, 'patients', uid, 'Personal', 'Details');
        await setDoc(personalRef, {
          name: cleanPatientData.name,
          DOB: cleanPatientData.DOB,
          email: cleanPatientData.email,
          phoneNumber: cleanPatientData.phoneNumber,
          address: cleanPatientData.address,
          emergencyContact: cleanPatientData.emergencyContact,
          insurancePhoto: cleanPatientData.insurancePhoto || '',
          patientPhoto: cleanPatientData.patientPhoto || ''
        }, { merge: true });
      } else if (activeTab === 'medical') {
        // Correct: Add a specific document ID, such as 'Details'
        const medicalRef = doc(db, 'patients', uid, 'Medical', 'Details');
        await setDoc(medicalRef, {
          medicalHistory: cleanPatientData.medicalHistory,
          currentMedications: cleanPatientData.currentMedications,
          allergies: cleanPatientData.allergies,
          physician: cleanPatientData.physician
        }, { merge: true });
      } else if (activeTab === 'financial') {
        // Correct: Add a specific document ID, such as 'Details'
        const financialRef = doc(db, 'patients', uid, 'Financial', 'Details');
        await setDoc(financialRef, {
          insuranceProvider: cleanPatientData.insuranceProvider,
          insurancePolicy: cleanPatientData.insurancePolicy,
          outstandingBills: cleanPatientData.outstandingBills
        }, { merge: true });
      }
  
      // Show success popup after saving data
      setShowSuccessPopup(true);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };
  

  const handleChange = (e) => setPatientData({ ...patientData, [e.target.name]: e.target.value });
  const handleInsuranceFileChange = (e) => setInsuranceFile(e.target.files[0]);
  const handlePatientFileChange = (e) => setPatientFile(e.target.files[0]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return <Personal patientData={patientData} handleChange={handleChange} handleInsuranceFileChange={handleInsuranceFileChange} handlePatientFileChange={handlePatientFileChange} />;
      case 'medical':
        return <Medical patientData={patientData} handleChange={handleChange} />;
      case 'financial':
        return <Financial patientData={patientData} handleChange={handleChange} uid={uid} />;
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
        {modificationMode ? (
          <div className="create-account-button">
            <button disabled={!isFormValid} onClick={handleSubmit}>Create Account</button>
          </div>
        ) : (
          <div className="patient-data">
            <h2>{patientData.name}</h2>
            <p><strong>Date of Birth:</strong> {patientData.DOB}</p>
            <p><strong>Email:</strong> {patientData.email}</p>
            <p><strong>Phone Number:</strong> {patientData.phoneNumber}</p>
            {/* Add more details as necessary */}
          </div>
        )}
          
        <div className="tab-buttons">
          <button className={activeTab === 'personal' ? 'active' : ''} onClick={() => setActiveTab('personal')}>Personal</button>
          <button className={activeTab === 'medical' ? 'active' : ''} onClick={() => setActiveTab('medical')}>Medical</button>
          <button className={activeTab === 'financial' ? 'active' : ''} onClick={() => setActiveTab('financial')}>Financial</button>
        </div>
        {renderTabContent()}

        {/* Success Popup */}
        {showSuccessPopup && (
          <div className="success-popup">
            <p>Account created successfully!</p>
            <button onClick={() => setShowSuccessPopup(false)}>Close</button>
          </div>
        )}
      </div>

    </div>
  );
};

export default Patient;
