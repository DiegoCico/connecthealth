import React, { useState } from 'react';
import axios from 'axios';

const Diagnose = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [confidence, setConfidence] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle image upload and preview
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
      const previewUrl = URL.createObjectURL(file);
      setPreviewUrl(previewUrl);
    }
  };

  // Handle the diagnosis request
  const diagnoseImage = async () => {
    if (!image) {
      alert('Please upload an image first.');
      return;
    }

    setLoading(true);  // Start loading state

    const formData = new FormData();
    formData.append('file', image);

    try {
      const response = await axios.post('http://localhost:5005/api/classify', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { predictedCondition, predictedConfidence } = response.data;

      setDiagnosis(predictedCondition);
      setConfidence(predictedConfidence.toFixed(2));  // Show confidence with 2 decimals

      setLoading(false);  // End loading state
    } catch (error) {
      console.error('Error diagnosing image:', error);
      alert('Error diagnosing image. Please try again.');
      setLoading(false);  // End loading state
    }
  };

  return (
    <div className="diagnose-container">
      <h2>Upload and Diagnose Medical Image</h2>

      {/* Image Upload Section */}
      <div className="upload-section">
        <label htmlFor="imageUpload" className="upload-label">Upload an Image</label>
        <input type="file" id="imageUpload" accept="image/*" onChange={handleImageUpload} />
      </div>

      {/* Image Preview Section */}
      {previewUrl && (
        <div className="image-preview">
          <img src={previewUrl} alt="Uploaded Preview" />
        </div>
      )}

      {/* Diagnose Button */}
      <button onClick={diagnoseImage} disabled={loading}>
        {loading ? 'Diagnosing...' : 'Diagnose'}
      </button>

      {/* Diagnosis Result Section */}
      {diagnosis && (
        <div className="diagnosis-result">
          <h3>Diagnosis: {diagnosis}</h3>
          <p>Confidence: {confidence}</p>
        </div>
      )}
    </div>
  );
};

export default Diagnose;
