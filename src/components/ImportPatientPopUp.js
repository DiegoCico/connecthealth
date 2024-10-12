import React, {useState} from "react";
import '../css/ImportPatientPopup.css'

export default function ImportPatientPopup({ onClose }) {
    const [file, setFile] = useState(null)
    const [errorMsg, setErrorMsg] = useState("")

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0]
        setFile(selectedFile)
        setErrorMsg("")
    }

    const handleSubmit = () => {
        if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
                try {
                    const jsonData = JSON.parse(e.target.result)
                    const keys = Object.keys(jsonData)
                    if (keys.length === 1 && keys[0] === 'patients' && typeof jsonData.patients === 'object') {
                        console.log('Valid JSON')
                        // process the json here
                        console.log("JSON Parsed:", jsonData)
                        onClose()
                    } else {
                        setErrorMsg("JSON Must follow a proper structure")
                        throw new Error("Invalid structure: JSON must contain exactly one 'patients' key.")
                    }
                } catch (error) {
                    console.error("Error parsing JSON", error)
                    setErrorMsg(error.message)
                }
            }
            reader.readAsText(file)
        }
    }

    return (
        <>
            <div className="popup-overlay">
                {errorMsg && (
                    <div className="notification">
                    <p>{errorMsg}</p>
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
    )
}