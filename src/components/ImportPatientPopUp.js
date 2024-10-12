import React, { useState } from "react";
import '../css/ImportPatientPopup.css';
import { db } from "../firebase";
import { doc, setDoc, collection } from "firebase/firestore";

export default function ImportPatientPopup({ onClose }) {
    const [file, setFile] = useState(null);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        setErrorMsg("");
        setSuccessMsg("");
    };

    const handleSubmit = () => {
        if (!file) {
            setErrorMsg("Please upload a file.");
            return;
        }

        const reader = new FileReader();
        reader.onload = async function (event) {
            try {
                const json = JSON.parse(event.target.result);

                // Step 1: Validate 'patients' structure
                if (!json.patients || typeof json.patients !== 'object') {
                    setErrorMsg("Invalid JSON structure: 'patients' key is missing.");
                    return;
                }

                // Step 2: Loop through each patient in the JSON file
                for (const patientId in json.patients) {
                    const patientData = json.patients[patientId];

                    // Step 3: Validate patient structure
                    if (!patientData.Personal || typeof patientData.Personal !== 'object') {
                        setErrorMsg(`Invalid JSON structure for patient ${patientId}: 'Personal' key is missing.`);
                        continue;
                    }

                    const personalData = patientData.Personal;
                    const detailsData = personalData.Details || {};
                    const visitsData = patientData.MedicalVisits || {};
                    const prescriptionsData = patientData.Prescriptions || {};
                    const cardsData = patientData.Financial || {};

                    // Step 4: Upload the data to Firestore

                    // 1. Create the main document under 'patients' collection with the patientId
                    const patientRef = doc(db, "patients", patientId);
                    await setDoc(patientRef, { userId: patientId });

                    // 2. Add 'Personal' data to the 'Personal' sub-collection
                    const personalRef = collection(patientRef, "Personal");
                    await setDoc(doc(personalRef, "Details"), detailsData);

                    // 3. Add each visit to the 'MedicalVisits' sub-collection
                    const visitsRef = collection(patientRef, "MedicalVisits");
                    for (const visitId in visitsData) {
                        const visitData = visitsData[visitId];
                        const visitRef = doc(visitsRef, visitId);  // Use the visitId as the document ID
                        await setDoc(visitRef, visitData);
                    }

                    // 4. Add each prescription to the 'Prescriptions' sub-collection
                    const prescriptionsRef = collection(patientRef, "Prescriptions");
                    for (const prescriptionId in prescriptionsData) {
                        const prescriptionData = prescriptionsData[prescriptionId];
                        const prescriptionRef = doc(prescriptionsRef, prescriptionId);  // Use prescriptionId as the document ID
                        await setDoc(prescriptionRef, prescriptionData);
                    }

                    // 5. Add each financial card to the 'Financial' sub-collection
                    const cardsRef = collection(patientRef, "Financial");
                    for (const cardId in cardsData) {
                        const cardData = cardsData[cardId];
                        const cardRef = doc(cardsRef, cardId);  // Use cardId as the document ID
                        await setDoc(cardRef, cardData);
                    }
                }

                // Step 5: Show success message and close the popup
                setSuccessMsg("Data submitted successfully.");
                setErrorMsg("");  // Clear any previous error messages
                setTimeout(() => {
                    onClose();
                }, 2000);  // Close the popup after 2 seconds

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
                {errorMsg && (
                    <div className="notification error">
                        <p>{errorMsg}</p>
                    </div>
                )}
                {successMsg && (
                    <div className="notification success">
                        <p>{successMsg}</p>
                    </div>
                )}
                <div className="popup">
                    <h2>Import Patient JSON</h2>
                    <input type="file" accept=".json" onChange={handleFileChange} />
                    <div className="popup-buttons">
                        <button onClick={handleSubmit} disabled={!file}>
                            Submit
                        </button>
                        <button onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        </>
    );
}
