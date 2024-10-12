// import React, { useState, useEffect } from "react";
// import { collection, doc, getDocs, getDoc } from "firebase/firestore"; // Import necessary Firebase functions
// import { db } from "../firebase"; // Ensure db is correctly initialized
// import "../css/SearchPatient.css"; // Add any relevant CSS styles
// import { useNavigate } from 'react-router-dom';

// const SearchPatient = () => {
//   const [searchTerm, setSearchTerm] = useState(""); // Search term input by user
//   const [patients, setPatients] = useState([]); // Array of patients found
//   const [noResults, setNoResults] = useState(false); // Boolean for no results
//   const [loading, setLoading] = useState(false); // Boolean to indicate loading state
//   const navigate = useNavigate();

//   // Function to handle searching patients by name
//   const handleSearch = async () => {
//     if (searchTerm.trim() === "") {
//       setNoResults(false);
//       setPatients([]);
//       return;
//     }

//     setLoading(true); // Show loading state

//     try {
//       const patientsQuery = collection(db, "patients"); // Reference to the 'patients' collection
//       const patientsSnapshot = await getDocs(patientsQuery); // Get all patients

//       const results = []; // Array to store matching patients
      
//       // Iterate over each patient and check their 'Personal' sub-collection for matching names
//       for (const patientDoc of patientsSnapshot.docs) {
//         const personalRef = doc(db, "patients", patientDoc.id, "Personal", "Details"); // Reference to the 'Personal' document
//         const personalSnap = await getDoc(personalRef); // Get personal details of patient

//         if (personalSnap.exists()) {
//           const personalData = personalSnap.data();
//           console.log('Fetched personal data: ', personalData); // Log fetched personal data for debugging

//           // Check if the name matches the search term
//           if (personalData.name.toLowerCase().includes(searchTerm.toLowerCase())) {
//             results.push({
//               id: patientDoc.id, // Push the patient's ID
//               ...personalData // Add personal data to the results
//             });
//           }
//         }
//       }

//       setLoading(false); // Stop loading state

//       // Set patients if matches are found
//       if (results.length > 0) {
//         console.log('Found patients: ', results); // Log results for debugging
//         setPatients(results);
//         setNoResults(false); // Reset noResults state
//       } else {
//         console.log('No patients found'); // Log if no results found
//         setPatients([]);
//         setNoResults(true); // Set noResults state to true
//       }
//     } catch (error) {
//       console.error('Error searching for patients:', error);
//       setLoading(false); // Stop loading if an error occurs
//     }
//   };

//   // Automatically search when searchTerm changes
//   useEffect(() => {
//     if (searchTerm.trim() !== "") {
//       handleSearch(); // Call handleSearch when searchTerm is updated
//     } else {
//       setPatients([]); // Reset patients when searchTerm is empty
//       setNoResults(false); // Reset noResults when searchTerm is empty
//     }
//   }, [searchTerm]);

//   // Navigate to the patient details page when a patient is clicked
//   const handlePatientClick = (userId) => {
//     navigate(`/patient/${userId}`);
//   };

//   // Navigate to the "Create New Patient" page
//   const handleCreatePatient = () => {
//     navigate("/patient/new", { state: { modificationMode: true } });
//   };

//   return (
//     <div className="search-patient-container">
//       <div className="search-bar">
//         <input
//           type="text"
//           className="search-input"
//           placeholder="Search patient by name..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)} // Update search term on input change
//         />
//         <button onClick={() => setSearchTerm("")} className="clear-button">Clear</button> {/* Clear button */}
//       </div>

//       {loading && <div className="loading">Loading...</div>} {/* Show loading message */}

//       {noResults && (
//         <div className="no-results">
//           <p>No patient found. <span onClick={handleCreatePatient} className="create-patient-link">Create Patient</span></p> {/* Create new patient link */}
//         </div>
//       )}

//       {/* Display list of matching patients */}
//       {patients.length > 0 && (
//         <ul className="patient-list">
//           {patients.map((patient, index) => (
//             <li key={index} onClick={() => handlePatientClick(patient.id)} className="patient-item">
//               <strong>{patient.name}</strong> <br />
//               DOB: {patient.DOB} <br />
//               Email: {patient.email} <br />
//               Phone: {patient.phoneNumber} <br />
//               Address: {patient.address} <br />
//               Emergency Contact: {patient.emergencyContact}
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// };

// export default SearchPatient;

// import React, { useState, useEffect } from "react";
// import { collection, doc, getDocs, getDoc } from "firebase/firestore"; // Import necessary Firebase functions
// import { db } from "../firebase"; // Ensure db is correctly initialized
// import "../css/SearchPatient.css"; // Add any relevant CSS styles
// import { useNavigate } from 'react-router-dom';

// const SearchPatient = () => {
//   const [searchTerm, setSearchTerm] = useState(""); // Search term input by user
//   const [patients, setPatients] = useState([]); // Array of patients found
//   const [noResults, setNoResults] = useState(false); // Boolean for no results
//   const [loading, setLoading] = useState(false); // Boolean to indicate loading state
//   const [suggestions, setSuggestions] = useState([]); // Array for dropdown suggestions
//   const [allNames, setAllNames] = useState([]); // Array to hold all patient names
//   const navigate = useNavigate();

//   // Fetch all patient names from the Firestore
//   const fetchAllPatientNames = async () => {
//     try {
//       const patientsQuery = collection(db, "patients"); // Reference to the 'patients' collection
//       const patientsSnapshot = await getDocs(patientsQuery); // Get all patients

//       const names = []; // Array to store patient names
//       for (const patientDoc of patientsSnapshot.docs) {
//         const personalRef = doc(db, "patients", patientDoc.id, "Personal", "Details"); // Reference to the 'Personal' document
//         const personalSnap = await getDoc(personalRef); // Get personal details of patient

//         if (personalSnap.exists()) {
//           const personalData = personalSnap.data();
//           names.push({ id: patientDoc.id, name: personalData.name }); // Add patient name to names array
//         }
//       }

//       setAllNames(names); // Set all names in the state
//       console.log('All patient names:', names); // Log all names for debugging
//     } catch (error) {
//       console.error('Error fetching patient names:', error);
//     }
//   };

//   // Fetch all patient names on component mount
//   useEffect(() => {
//     fetchAllPatientNames();
//   }, []);

//   // Function to handle searching patients by name
//   const handleSearch = async () => {
//     if (searchTerm.trim() === "") {
//       setNoResults(false);
//       setPatients([]);
//       setSuggestions([]); // Clear suggestions if search term is empty
//       return;
//     }

//     setLoading(true); // Show loading state

//     try {
//       const patientsQuery = collection(db, "patients"); // Reference to the 'patients' collection
//       const patientsSnapshot = await getDocs(patientsQuery); // Get all patients

//       const results = []; // Array to store matching patients
//       const foundSuggestions = []; // Array for patient names for dropdown suggestions
      
//       // Iterate over each patient and check their 'Personal' sub-collection for matching names
//       for (const patientDoc of patientsSnapshot.docs) {
//         const personalRef = doc(db, "patients", patientDoc.id, "Personal", "Details"); // Reference to the 'Personal' document
//         const personalSnap = await getDoc(personalRef); // Get personal details of patient

//         if (personalSnap.exists()) {
//           const personalData = personalSnap.data();
//           console.log('Fetched personal data: ', personalData); // Log fetched personal data for debugging

//           // Add to suggestions
//           foundSuggestions.push({ id: patientDoc.id, name: personalData.name });

//           // Check if the name matches the search term
//           if (personalData.name.toLowerCase().includes(searchTerm.toLowerCase())) {
//             results.push({
//               id: patientDoc.id, // Push the patient's ID
//               ...personalData // Add personal data to the results
//             });
//           }
//         }
//       }

//       setLoading(false); // Stop loading state

//       // Set patients if matches are found
//       if (results.length > 0) {
//         console.log('Found patients: ', results); // Log results for debugging
//         setPatients(results);
//         setNoResults(false); // Reset noResults state
//       } else {
//         console.log('No patients found'); // Log if no results found
//         setPatients([]);
//         setNoResults(true); // Set noResults state to true
//       }

//       // Update suggestions state
//       setSuggestions(foundSuggestions.filter(suggestion => 
//         suggestion.name.toLowerCase().includes(searchTerm.toLowerCase())
//       ));
//     } catch (error) {
//       console.error('Error searching for patients:', error);
//       setLoading(false); // Stop loading if an error occurs
//     }
//   };

//   // Automatically search when searchTerm changes
//   useEffect(() => {
//     handleSearch(); // Call handleSearch when searchTerm is updated

//     // Log suggestions to console every time searchTerm changes
//     console.log('Suggested names:', suggestions);
//   }, [searchTerm]);

//   // Navigate to the patient details page when a patient is clicked
//   const handlePatientClick = (userId) => {
//     navigate(`/patient/${userId}`);
//   };

//   // Navigate to the "Create New Patient" page
//   const handleCreatePatient = () => {
//     navigate("/patient/new", { state: { modificationMode: true } });
//   };

//   // Handle suggestion click
//   const handleSuggestionClick = (name, userId) => {
//     setSearchTerm(name); // Set search term to the clicked suggestion
//     setSuggestions([]); // Clear suggestions
//     handleSearch(); // Initiate search
//   };

//   return (
//     <div className="search-patient-container">
//       <div className="search-bar">
//         <input
//           type="text"
//           className="search-input"
//           placeholder="Search patient by name..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)} // Update search term on input change
//         />
//         <button onClick={() => setSearchTerm("")} className="clear-button">Clear</button> {/* Clear button */}
//       </div>

//       {loading && <div className="loading">Loading...</div>} {/* Show loading message */}

//       {noResults && (
//         <div className="no-results">
//           <p>No patient found. <span onClick={handleCreatePatient} className="create-patient-link">Create Patient</span></p> {/* Create new patient link */}
//         </div>
//       )}

//       {/* Dropdown for suggestions */}
//       {suggestions.length > 0 && (
//         <ul className="suggestions-dropdown">
//           {suggestions.map((suggestion) => (
//             <li 
//               key={suggestion.id} 
//               onClick={() => handleSuggestionClick(suggestion.name, suggestion.id)} 
//               className="suggestion-item"
//             >
//               {suggestion.name}
//             </li>
//           ))}
//         </ul>
//       )}

//       {/* Display list of matching patients */}
//       {patients.length > 0 && (
//         <ul className="patient-list">
//           {patients.map((patient, index) => (
//             <li key={index} onClick={() => handlePatientClick(patient.id)} className="patient-item">
//               <strong>{patient.name}</strong> <br />
//               DOB: {patient.DOB} <br />
//               Email: {patient.email} <br />
//               Phone: {patient.phoneNumber} <br />
//               Address: {patient.address} <br />
//               Emergency Contact: {patient.emergencyContact}
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// };

// export default SearchPatient;
