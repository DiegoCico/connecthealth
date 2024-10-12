import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { doc, getDoc, setDoc, collection } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, uploadFile } from '../firebase';
import Personal from '../components/Personal';
import Medical from '../components/Medical';
import Financial from '../components/Financial';

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
  const [uploadProgress, setUploadProgress] = useState({ insurance: 0, patient: 0 }); 
  const [activeTab, setActiveTab] = useState('personal'); 
  const storage = getStorage();

  // Load patient data on component mount
  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, 'patients', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setPatientData(docSnap.data());
      }
    };
    fetchData();
  }, [uid]);

  // Save data based on active tab
  const handleSubmit = async () => {
    const docRef = doc(db, 'patients', uid);

    if (activeTab === 'medical') {
      // Save to Medical sub-collection
      const medicalCollectionRef = collection(docRef, 'Medical');
      await setDoc(doc(medicalCollectionRef), {
        medicalHistory: patientData.medicalHistory,
        currentMedications: patientData.currentMedications,
        allergies: patientData.allergies,
        physician: patientData.physician
      });
    } else if (activeTab === 'financial') {
      // Save to Financial sub-collection
      const financialCollectionRef = collection(docRef, 'Financial');
      await setDoc(doc(financialCollectionRef), {
        insuranceProvider: patientData.insuranceProvider,
        insurancePolicy: patientData.insurancePolicy,
        outstandingBills: patientData.outstandingBills
      });
    } else {
      // Save personal data directly to patient document
      await setDoc(docRef, {
        name: patientData.name,
        DOB: patientData.DOB,
        email: patientData.email,
        phoneNumber: patientData.phoneNumber,
        address: patientData.address,
        emergencyContact: patientData.emergencyContact,
        insurancePhoto: patientData.insurancePhoto,
        patientPhoto: patientData.patientPhoto
      });
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
        return <Financial patientData={patientData} handleChange={handleChange} />;
      default:
        return null;
    }
  };

  return (
    <div className="patient-container">
      <div className="tab-buttons">
        <button className={activeTab === 'personal' ? 'active' : ''} onClick={() => setActiveTab('personal')}>Personal</button>
        <button className={activeTab === 'medical' ? 'active' : ''} onClick={() => setActiveTab('medical')}>Medical</button>
        <button className={activeTab === 'financial' ? 'active' : ''} onClick={() => setActiveTab('financial')}>Financial</button>
      </div>
      {renderTabContent()}
      <button onClick={handleSubmit}>Save</button>
    </div>
  );
};

export default Patient;
