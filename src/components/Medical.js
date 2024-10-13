import React, { useState, useEffect } from 'react';
import { doc, setDoc, collection, getDocs } from 'firebase/firestore'; // Firestore functions
import { db } from '../firebase'; // Firebase config
import '../css/Medical.css'; // Importing the new CSS

const Medical = ({ uid }) => {
  // State to manage the visibility of the doctor visit popup
  const [showPopup, setShowPopup] = useState(false); 
  
  // State to manage the visibility of the prescription popup
  const [showPrescriptionPopup, setShowPrescriptionPopup] = useState(false); 
  
  // State to manage the ID of the prescription being edited (if any)
  const [editPrescriptionId, setEditPrescriptionId] = useState(null); 
  
  // State to store the data for a medical visit
  const [visitData, setVisitData] = useState({
    reason: '',
    prescription: '',
    results: ''
  });
  
  // State to store the data for a prescription
  const [prescriptionData, setPrescriptionData] = useState({
    name: '',
    startDate: new Date().toLocaleDateString(), // Automatically input current date
    dosage: '',
    duration: '',
    recurring: false
  });

  // State to store the list of saved medical visits
  const [savedVisits, setSavedVisits] = useState([]); 
  
  // State to store the list of prescriptions
  const [prescriptions, setPrescriptions] = useState([]); 

  // List of reasons for a medical visit
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

  // Handle input change for visit data form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Update the visit data state by spreading the previous state and updating the changed field
    setVisitData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  // Handle input change for prescription data form
  const handlePrescriptionChange = (e) => {
    const { name, value } = e.target;
    // Update the prescription data state by spreading the previous state and updating the changed field
    setPrescriptionData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  // Handle checkbox toggle for the "recurring" field in the prescription form
  const handleRecurringChange = (e) => {
    setPrescriptionData((prevData) => ({
      ...prevData,
      recurring: e.target.checked,
      duration: e.target.checked ? '' : prevData.duration // Disable duration if recurring is checked
    }));
  };

  // Toggle the visibility of the doctor visit popup
  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  // Toggle the visibility of the prescription popup; also handles setting prescription data for editing
  const togglePrescriptionPopup = (prescription = null) => {
    if (prescription) {
      // If editing an existing prescription, set its data in the form
      setPrescriptionData({
        name: prescription.name,
        startDate: prescription.startDate,
        dosage: prescription.dosage,
        duration: prescription.duration || '',
        recurring: prescription.recurring || false
      });
      setEditPrescriptionId(prescription.id); // Set the ID for editing
    } else {
      // If adding a new prescription, reset the form
      setPrescriptionData({
        name: '',
        startDate: new Date().toLocaleDateString(),
        dosage: '',
        duration: '',
        recurring: false
      });
      setEditPrescriptionId(null); // Reset editing state
    }
    setShowPrescriptionPopup(!showPrescriptionPopup); // Toggle the popup visibility
  };

  // Save the visit to Firestore
  const saveVisit = async () => {
    const timestamp = new Date(); 
    const formattedDate = timestamp.toLocaleDateString();
    const formattedTime = timestamp.toLocaleTimeString();

    try {
      // Create a reference to a new document in the MedicalVisits collection for the current user
      const visitRef = doc(collection(db, 'patients', uid, 'MedicalVisits')); 
      
      // Save the visit data along with the current date and time
      await setDoc(visitRef, {
        ...visitData,
        date: formattedDate,
        time: formattedTime
      });

      // Fetch the updated list of visits
      fetchSavedVisits();
      
      // Reset visit form and close popup
      setVisitData({ reason: '', results: '' });
      setShowPopup(false);
    } catch (error) {
      console.error('Error saving visit:', error);
    }
  };

  // Save or update the prescription in Firestore
  const savePrescription = async () => {
    try {
      const prescriptionRef = editPrescriptionId
        ? doc(db, 'patients', uid, 'Prescriptions', editPrescriptionId) // If editing, update the existing prescription
        : doc(collection(db, 'patients', uid, 'Prescriptions')); // If adding a new one, create a new document

      // Save the prescription data along with the current date and calculated expiration date (if not recurring)
      await setDoc(prescriptionRef, {
        ...prescriptionData,
        startDate: new Date().toLocaleDateString(), // Automatically input current date
        expirationDate: prescriptionData.recurring ? null : calculateExpirationDate(prescriptionData.startDate, prescriptionData.duration)
      });

      // Fetch the updated list of prescriptions
      fetchPrescriptions();
      
      // Reset prescription form and close popup
      setPrescriptionData({ name: '', startDate: new Date().toLocaleDateString(), dosage: '', duration: '', recurring: false });
      setShowPrescriptionPopup(false);
    } catch (error) {
      console.error('Error saving prescription:', error);
    }
  };

  // Calculate expiration date based on the start date and duration of the prescription
  const calculateExpirationDate = (startDate, duration) => {
    const start = new Date(startDate);
    const durationInDays = parseInt(duration, 10);
    start.setDate(start.getDate() + durationInDays); // Add the duration to the start date
    return start.toLocaleDateString();
  };

  // Fetch saved visits from Firestore
  const fetchSavedVisits = async () => {
    const visits = [];
    const visitsCollectionRef = collection(db, 'patients', uid, 'MedicalVisits'); // Collection reference for medical visits
    const querySnapshot = await getDocs(visitsCollectionRef); // Fetch all documents in the collection

    // Map the documents to an array of visit objects
    querySnapshot.forEach((doc) => {
      visits.push({
        id: doc.id,
        ...doc.data()
      });
    });

    setSavedVisits(visits); // Update the state with the fetched visits
  };

  // Fetch prescriptions from Firestore
  const fetchPrescriptions = async () => {
    const prescriptionsList = [];
    const prescriptionsCollectionRef = collection(db, 'patients', uid, 'Prescriptions'); // Collection reference for prescriptions
    const querySnapshot = await getDocs(prescriptionsCollectionRef); // Fetch all documents in the collection

    // Map the documents to an array of prescription objects
    querySnapshot.forEach((doc) => {
      prescriptionsList.push({
        id: doc.id,
        ...doc.data()
      });
    });

    setPrescriptions(prescriptionsList); // Update the state with the fetched prescriptions
  };

  // Effect hook to fetch visits and prescriptions when the `uid` changes
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
                Results:
                <textarea
                  name="results"
                  value={visitData.results}
                  onChange={handleInputChange}
                  rows="4"
                  style={{ width: '100%' }}
                />
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
            <div key={visit.id}>
              <p>Date: {visit.date}</p>
              <p>Reason: {visit.reason}</p>
              <p>Results: {visit.results}</p>
            </div>
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
                Name:
                <input
                  type="text"
                  name="name"
                  value={prescriptionData.name}
                  onChange={handlePrescriptionChange}
                />
              </label>
              <br />
              <label>
                Start Date:
                <input
                  type="text"
                  name="startDate"
                  value={prescriptionData.startDate}
                  onChange={handlePrescriptionChange}
                />
              </label>
              <br />
              <label>
                Dosage:
                <input
                  type="text"
                  name="dosage"
                  value={prescriptionData.dosage}
                  onChange={handlePrescriptionChange}
                />
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
              <button onClick={savePrescription}>{editPrescriptionId ? 'Save Changes' : 'Add Prescription'}</button>
              <button onClick={togglePrescriptionPopup}>Cancel</button>
            </div>
          </div>
        )}

        <h3>Current Prescriptions</h3>
        {prescriptions.length === 0 ? (
          <p>No prescriptions added.</p>
        ) : (
          prescriptions.map((prescription) => (
            <div key={prescription.id}>
              <p>Name: {prescription.name}</p>
              <p>Dosage: {prescription.dosage}</p>
              <p>Start Date: {prescription.startDate}</p>
              <p>Duration: {prescription.recurring ? 'Recurring' : `${prescription.duration} days`}</p>
              <button onClick={() => togglePrescriptionPopup(prescription)}>Edit</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Medical;
