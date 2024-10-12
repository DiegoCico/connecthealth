import React, { useState, useEffect } from 'react';
import { doc, setDoc, collection, getDocs } from 'firebase/firestore'; // Firestore functions
import { db } from '../firebase'; // Firebase config
import '../css/Medical.css'; // Importing the new CSS

const Medical = ({ uid }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [visitData, setVisitData] = useState({
    reason: '',
    prescription: '',
    results: ''
  });
  const [savedVisits, setSavedVisits] = useState([]); // To hold saved visits
  const [prescriptions, setPrescriptions] = useState([]); // To hold prescriptions

  const reasonsForVisit = [
    'Checkup',
    'Flu Symptoms',
    'Chronic Condition Follow-up',
    'Injury',
    'Skin Rash',
    'Blood Pressure Check',
    'Vaccination',
    'Other'
  ];

  // Function to check if a prescription is expired
  const isPrescriptionExpired = (expirationDate) => {
    const currentDate = new Date();
    const expDate = new Date(expirationDate);
    return currentDate > expDate;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVisitData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  const saveVisit = async () => {
    const timestamp = new Date(); 
    const formattedDate = timestamp.toLocaleDateString();
    const formattedTime = timestamp.toLocaleTimeString();

    try {
      const visitRef = doc(collection(db, 'patients', uid, 'MedicalVisits')); // Ensure MedicalVisits is the collection
      await setDoc(visitRef, {
        ...visitData,
        date: formattedDate,
        time: formattedTime
      });

      fetchSavedVisits();
      setVisitData({ reason: '', results: '' });
      setShowPopup(false);
    } catch (error) {
      console.error('Error saving visit:', error);
    }
  };

  const fetchSavedVisits = async () => {
    const visits = [];
    const visitsCollectionRef = collection(db, 'patients', uid, 'MedicalVisits'); // Ensure this path is correct
    const querySnapshot = await getDocs(visitsCollectionRef);

    querySnapshot.forEach((doc) => {
      visits.push({
        id: doc.id,
        ...doc.data()
      });
    });

    setSavedVisits(visits); 
  };

  const fetchPrescriptions = async () => {
    const prescriptionsList = [];
    const prescriptionsCollectionRef = collection(db, 'patients', uid, 'Prescriptions'); // Ensure this path is correct
    const querySnapshot = await getDocs(prescriptionsCollectionRef);

    querySnapshot.forEach((doc) => {
      prescriptionsList.push({
        id: doc.id,
        ...doc.data()
      });
    });

    setPrescriptions(prescriptionsList);
  };

  useEffect(() => {
    if (uid) {
      fetchSavedVisits();
      fetchPrescriptions();
    }
  }, [uid]);

  return (
    <div className="medical-container" style={{ display: 'flex', width: '100%' }}>
      {/* Left side: 75% width */}
      <div style={{ width: '75%', padding: '20px', borderRight: '1px solid #ccc' }}>
        <h2>Medical Visits</h2>
        <button onClick={togglePopup} style={{ padding: '10px 20px', marginBottom: '20px' }}>Add Doctor Visit</button>

        {showPopup && (
          <div className="popup-overlay">
            <div className="popup-content">
              <h3>Add Doctor Visit</h3>
              <label>
                Reason for Visit:
                <select name="reason" value={visitData.reason} onChange={handleInputChange}>
                  <option value="">Select a reason</option>
                  {reasonsForVisit.map((reason, index) => (
                    <option key={index} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </label>
              <br />
              <label>
                Prescription:
                <input type="text" name="prescription" value={visitData.prescription} onChange={handleInputChange} />
              </label>
              <br />
              <label>
                Results:
                <input type="text" name="results" value={visitData.results} onChange={handleInputChange} />
              </label>
              <br />
              <button onClick={saveVisit}>Done</button>
              <button onClick={togglePopup}>Cancel</button>
            </div>
          </div>
        )}

        <h3>Past Visits</h3>
        {savedVisits.length === 0 ? (
          <p>No visits recorded.</p>
        ) : (
          savedVisits.map((visit) => (
            <VisitDetails key={visit.id} visit={visit} />
          ))
        )}
      </div>

      <div style={{ width: '25%', padding: '20px' }}>
        <h2>Prescriptions</h2>
        <h3>Available</h3>
        {prescriptions.filter(pres => !isPrescriptionExpired(pres.expirationDate)).length === 0 ? (
          <p>No available prescriptions.</p>
        ) : (
          prescriptions.filter(pres => !isPrescriptionExpired(pres.expirationDate)).map((pres) => (
            <div key={pres.id}>
              <p><strong>{pres.name}</strong></p>
              <p>Dosage: {pres.dosage}</p>
            </div>
          ))
        )}

        <h3>Expired</h3>
        {prescriptions.filter(pres => isPrescriptionExpired(pres.expirationDate)).length === 0 ? (
          <p>No expired prescriptions.</p>
        ) : (
          prescriptions.filter(pres => isPrescriptionExpired(pres.expirationDate)).map((pres) => (
            <div key={pres.id}>
              <p><strong>{pres.name}</strong></p>
              <p>Dosage: {pres.dosage}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const VisitDetails = ({ visit }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="visit-details">
      <p onClick={() => setExpanded(!expanded)}>{visit.date} {visit.time}</p>
      {expanded && (
        <div className="visit-info">
          <p><strong>Reason:</strong> {visit.reason}</p>
          <p><strong>Results:</strong> {visit.results}</p>
        </div>
      )}
    </div>
  );
};

export default Medical;
