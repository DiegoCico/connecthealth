import React, { useState } from "react";
import '../css/ImportPatientPopup.css';
import { db } from "../firebase";
import { doc, setDoc, collection } from "firebase/firestore";

/**
 * ImportPatientPopup is a component that allows users to upload a JSON file containing
 * patient data and import it into Firestore. The file is parsed, validated, and uploaded
 * to the appropriate collections in Firestore.
 *
 * @param {Function} onClose - Function to close the popup after submission or cancellation.
 */
export default function ImportPatientPopup({ onClose }) {
    const [file, setFile] = useState(null);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    /**
     * Handles file selection and clears any previous messages.
     * @param {Event} e - The file input change event.
     */
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        setErrorMsg("");
        setSuccessMsg("");
    };

    /**
     * Handles the submission of the file, parses and validates the JSON,
     * and uploads the data to Firestore if valid.
     */
    const handleSubmit = () => {
        if (!file) {
            setErrorMsg("Please upload a file.");
            return;
        }

        const reader = new FileReader();
        reader.onload = async function (event) {
            try {
                const json = JSON.parse(event.target.result);

                // Step 1: Validate the 'patients' structure in the JSON file
                if (!json.patients || typeof json.patients !== 'object') {
                    setErrorMsg("Invalid JSON structure: 'patients' key is missing.");
                    return;
                }

                // Step 2: Loop through each patient and upload their data to Firestore
                for (const patientId in json.patients) {
                    const patientData = json.patients[patientId];

                    // Step 3: Validate the structure of each patient's data
                    if (!patientData.Personal || typeof patientData.Personal !== 'object') {
                        setErrorMsg(`Invalid JSON structure for patient ${patientId}: 'Personal' key is missing.`);
                        continue;
                    }

                    const personalData = patientData.Personal;
                    const detailsData = personalData.Details || {};
                    const visitsData = patientData.MedicalVisits || {};
                    const prescriptionsData = patientData.Prescriptions || {};
                    const cardsData = patientData.Financial || {};

                    // Step 4: Upload the patient's data to Firestore
                    // 1. Create the main document under the 'patients' collection
                    const patientRef = doc(db, "patients", patientId);
                    await setDoc(patientRef, { userId: patientId });

                    // 2. Add 'Personal' data to the 'Personal' sub-collection
                    const personalRef = collection(patientRef, "Personal");
                    await setDoc(doc(personalRef, "Details"), detailsData);

                    // 3. Add each visit to the 'MedicalVisits' sub-collection
                    const visitsRef = collection(patientRef, "MedicalVisits");
                    for (const visitId in visitsData) {
                        const visitData = visitsData[visitId];
                        const visitRef = doc(visitsRef, visitId);
                        await setDoc(visitRef, visitData);
                    }

                    // 4. Add each prescription to the 'Prescriptions' sub-collection
                    const prescriptionsRef = collection(patientRef, "Prescriptions");
                    for (const prescriptionId in prescriptionsData) {
                        const prescriptionData = prescriptionsData[prescriptionId];
                        const prescriptionRef = doc(prescriptionsRef, prescriptionId);
                        await setDoc(prescriptionRef, prescriptionData);
                    }

                    // 5. Add each financial card to the 'Financial' sub-collection
                    const cardsRef = collection(patientRef, "Financial");
                    for (const cardId in cardsData) {
                        const cardData = cardsData[cardId];
                        const cardRef = doc(cardsRef, cardId);
                        await setDoc(cardRef, cardData);
                    }
                }

                // Step 5: Display a success message and close the popup
                setSuccessMsg("Data submitted successfully.");
                setErrorMsg(""); // Clear any previous error messages
                setTimeout(() => {
                    onClose();
                }, 2000); // Close the popup after 2 seconds

            } catch (error) {
                setErrorMsg("Invalid JSON format.");
                console.error("Error while importing:", error);
            }
        };

        reader.readAsText(file);
    };

    return (
        <>
            <div className="popup-overlay">
                {/* Display error messages */}
                {errorMsg && (
                    <div className="notification error">
                        <p>{errorMsg}</p>
                    </div>
                )}
                {/* Display success messages */}
                {successMsg && (
                    <div className="notification success">
                        <p>{successMsg}</p>
                    </div>
                )}
                <div className="popup">
                    <h2>Import Patient JSON</h2>
                    {/* Input for selecting a JSON file */}
                    <input type="file" accept=".json" onChange={handleFileChange} />
                    <div className="popup-buttons">
                        {/* Submit button is disabled until a file is selected */}
                        <button onClick={handleSubmit} disabled={!file}>
                            Submit
                        </button>
                        {/* Button to close the popup */}
                        <button onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        </>
    );
}
