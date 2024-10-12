import React, { useState, useEffect } from 'react';
import { doc, setDoc, collection, getDocs } from 'firebase/firestore'; // Firestore functions
import { db } from '../firebase'; // Firebase config
import '../css/Medical.css'; // Importing the new CSS

const Medical = ({ uid }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [showPrescriptionPopup, setShowPrescriptionPopup] = useState(false); // New prescription popup state
  const [editPrescriptionId, setEditPrescriptionId] = useState(null); // For editing a prescription
  const [visitData, setVisitData] = useState({
    reason: '',
    prescription: '',
    results: ''
  });
  const [prescriptionData, setPrescriptionData] = useState({
    name: '',
    startDate: new Date().toLocaleDateString(),
    dosage: '',
    duration: '',
    recurring: false
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVisitData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handlePrescriptionChange = (e) => {
    const { name, value } = e.target;
    setPrescriptionData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleRecurringChange = (e) => {
    setPrescriptionData((prevData) => ({
      ...prevData,
      recurring: e.target.checked,
      duration: e.target.checked ? '' : prevData.duration // Disable duration if recurring is checked
    }));
  };

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  const togglePrescriptionPopup = (prescription = null) => {
    if (prescription) {
      setPrescriptionData({
        name: prescription.name,
        startDate: prescription.startDate,
        dosage: prescription.dosage,
        duration: prescription.duration || '',
        recurring: prescription.recurring || false
      });
      setEditPrescriptionId(prescription.id); // Set the ID for editing
    } else {
      setPrescriptionData({
        name: '',
        startDate: new Date().toLocaleDateString(),
        dosage: '',
        duration: '',
        recurring: false
      });
      setEditPrescriptionId(null); // New prescription
    }
    setShowPrescriptionPopup(!showPrescriptionPopup);
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

  const savePrescription = async () => {
    try {
      const prescriptionRef = editPrescriptionId
        ? doc(db, 'patients', uid, 'Prescriptions', editPrescriptionId) // Update existing prescription
        : doc(collection(db, 'patients', uid, 'Prescriptions')); // Add new prescription

      await setDoc(prescriptionRef, {
        ...prescriptionData,
        startDate: new Date().toLocaleDateString(), // Automatically input current date
        expirationDate: prescriptionData.recurring ? null : calculateExpirationDate(prescriptionData.startDate, prescriptionData.duration)
      });

      fetchPrescriptions();
      setPrescriptionData({ name: '', startDate: new Date().toLocaleDateString(), dosage: '', duration: '', recurring: false });
      setShowPrescriptionPopup(false);
    } catch (error) {
      console.error('Error saving prescription:', error);
    }
  };

  const calculateExpirationDate = (startDate, duration) => {
    const start = new Date(startDate);
    const durationInDays = parseInt(duration, 10);
    start.setDate(start.getDate() + durationInDays);
    return start.toLocaleDateString();
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
      {/* Left side for Medical Visits (75% width) */}
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

      {/* Right side for Prescriptions (25% width) */}
      <div style={{ width: '25%', padding: '20px' }}>
        <h2>Prescriptions</h2>
        <button onClick={() => togglePrescriptionPopup()} style={{ padding: '10px 20px', marginBottom: '20px' }}>
          Add Prescription
        </button>

        {showPrescriptionPopup && (
          <div className="popup-overlay">
            <div className="popup-content">
              <h3>{editPrescriptionId ? 'Edit Prescription' : 'Add Prescription'}</h3>
              <label>
                Prescription Name:
                <input type="text" name="name" value={prescriptionData.name} onChange={handlePrescriptionChange} />
              </label>
              <br />
              <label>
                Start Date: {prescriptionData.startDate}
              </label>
              <br />
              <label>
                Dosage:
                <input type="text" name="dosage" value={prescriptionData.dosage} onChange={handlePrescriptionChange} />
              </label>
              <br />
              <label>
                Duration (days):
                <input
                  type="text"
                  name="duration"
                  value={prescriptionData.duration}
                  onChange={handlePrescriptionChange}
                  disabled={prescriptionData.recurring}
                />
              </label>
              <br />
              <label>
                Recurring:
                <input
                  type="checkbox"
                  name="recurring"
                  checked={prescriptionData.recurring}
                  onChange={handleRecurringChange}
                />
              </label>
              <br />
              <button onClick={savePrescription}>{editPrescriptionId ? 'Update Prescription' : 'Save Prescription'}</button>
              <button onClick={() => togglePrescriptionPopup(null)}>Cancel</button>
            </div>
          </div>
        )}

        <h3>Available Prescriptions</h3>
        {prescriptions.filter(pres => !isPrescriptionExpired(pres.expirationDate)).length === 0 ? (
          <p>No available prescriptions.</p>
        ) : (
          prescriptions.filter(pres => !isPrescriptionExpired(pres.expirationDate)).map((pres) => (
            <div key={pres.id} onClick={() => togglePrescriptionPopup(pres)} style={{ cursor: 'pointer' }}>
              <p><strong>{pres.name}</strong></p>
              <p>Dosage: {pres.dosage}</p>
            </div>
          ))
        )}

        <h3>Expired Prescriptions</h3>
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

const isPrescriptionExpired = (expirationDate) => {
  if (!expirationDate) return false; // Recurring prescriptions are always active
  const currentDate = new Date();
  const expDate = new Date(expirationDate);
  return currentDate > expDate;
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
