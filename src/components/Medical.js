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

  // Define reasons for visit
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

  // Define the function to check if a prescription is expired
  const isPrescriptionExpired = (expirationDate) => {
    const currentDate = new Date();
    const expDate = new Date(expirationDate);
    return currentDate > expDate;
  };

  // Handle input change for visit data
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVisitData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  // Open/close the add visit popup
  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  // Save the visit data to Firestore
  const saveVisit = async () => {
    if (!uid) {
      console.error('Error: User ID (uid) is undefined.');
      return;
    }

    const timestamp = new Date(); // Get current date and time
    const formattedDate = timestamp.toLocaleDateString();
    const formattedTime = timestamp.toLocaleTimeString();

    try {
      const visitRef = doc(collection(db, 'patients', uid, 'Medical', 'Details'), `${formattedDate}-${formattedTime}`);
      await setDoc(visitRef, {
        ...visitData,
        date: formattedDate,
        time: formattedTime
      });

      // Refresh visits after saving
      fetchSavedVisits();

      // Reset form and close popup
      setVisitData({ reason: '', results: '' });
      setShowPopup(false);
    } catch (error) {
      console.error('Error saving visit:', error);
    }
  };

  // Fetch saved doctor visits from Firestore
  const fetchSavedVisits = async () => {
    if (!uid) {
      console.error('Error: User ID (uid) is undefined.');
      return;
    }

    const visits = [];
    const visitsCollectionRef = collection(db, 'patients', uid, 'Medical', 'Details');
    const querySnapshot = await getDocs(visitsCollectionRef);

    querySnapshot.forEach((doc) => {
      visits.push({
        id: doc.id,
        ...doc.data()
      });
    });

    setSavedVisits(visits); // Update the state with fetched visits
  };

  // Fetch saved prescriptions from Firestore
  const fetchPrescriptions = async () => {
    if (!uid) {
      console.error('Error: User ID (uid) is undefined.');
      return;
    }

    const prescriptionList = [];
    const prescriptionsCollectionRef = collection(db, 'patients', uid, 'Medical', 'Prescriptions');
    const querySnapshot = await getDocs(prescriptionsCollectionRef);

    querySnapshot.forEach((doc) => {
      prescriptionList.push({
        id: doc.id,
        ...doc.data()
      });
    });

    setPrescriptions(prescriptionList); // Update the state with fetched prescriptions
  };

  // Fetch visits and prescriptions on component mount
  useEffect(() => {
    if (uid) {
      fetchSavedVisits();
      fetchPrescriptions();
    }
  }, [uid]); // Make sure uid is passed as a dependency

  return (
    <div className="medical-container" style={{ display: 'flex', width: '100%' }}>
      {/* Left side: 75% width */}
      <div style={{ width: '75%', padding: '20px', borderRight: '1px solid #ccc' }}>
        <h2>Medical Visits</h2>
        <button onClick={togglePopup} style={{ padding: '10px 20px', marginBottom: '20px' }}>Add Doctor Visit</button>

        {/* Popup for adding visit */}
        {showPopup && (
          <div className="popup-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="popup-content" style={{ backgroundColor: 'white', padding: '20px', borderRadius: '5px', width: '400px' }}>
              <h3>Add Doctor Visit</h3>
              <label>
                Reason for Visit:
                <select
                  name="reason"
                  value={visitData.reason}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '5px' }}
                >
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
              <button onClick={saveVisit} style={{ marginTop: '10px' }}>Done</button>
              <button onClick={togglePopup} style={{ marginTop: '10px', marginLeft: '10px' }}>Cancel</button>
            </div>
          </div>
        )}

        {/* Display saved visits */}
        <h3>Past Visits</h3>
        {savedVisits.length === 0 ? (
          <p>No visits recorded.</p>
        ) : (
          savedVisits.map((visit) => (
            <VisitDetails key={visit.id} visit={visit} />
          ))
        )}
      </div>

      {/* Right side: 25% width */}
      <div style={{ width: '25%', padding: '20px' }}>
        <h2>Prescriptions</h2>
        <h3>Available</h3>
        {prescriptions.filter(pres => !isPrescriptionExpired(pres.expirationDate)).length === 0 ? (
          <p>No available prescriptions.</p>
        ) : (
          prescriptions
            .filter(pres => !isPrescriptionExpired(pres.expirationDate))
            .map((pres) => (
              <div key={pres.id} style={{ borderBottom: '1px solid #ccc', marginBottom: '10px' }}>
                <p><strong>{pres.name}</strong></p>
                <p>Dosage: {pres.dosage}</p>
              </div>
            ))
        )}

        <h3>Expired</h3>
        {prescriptions.filter(pres => isPrescriptionExpired(pres.expirationDate)).length === 0 ? (
          <p>No expired prescriptions.</p>
        ) : (
          prescriptions
            .filter(pres => isPrescriptionExpired(pres.expirationDate))
            .map((pres) => (
              <div key={pres.id} style={{ borderBottom: '1px solid #ccc', marginBottom: '10px' }}>
                <p><strong>{pres.name}</strong></p>
                <p>Dosage: {pres.dosage}</p>
              </div>
            ))
        )}
      </div>
    </div>
  );
};

// Component for displaying each visit, collapsible for additional details
const VisitDetails = ({ visit }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="visit-details" style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
      <p onClick={() => setExpanded(!expanded)} style={{ cursor: 'pointer', fontWeight: 'bold' }}>
        {visit.date} {visit.time}
      </p>
      {expanded && (
        <div className="visit-info" style={{ marginTop: '10px' }}>
          <p><strong>Reason:</strong> {visit.reason}</p>
          <p><strong>Results:</strong> {visit.results}</p>
        </div>
      )}
    </div>
  );
};

export default Medical;
