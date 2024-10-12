import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/Diagnose.css';

const Diagnose = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [confidence, setConfidence] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageType, setImageType] = useState('internal'); // New state for selecting image type (internal/external)

  // Handle image upload and preview
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (example: max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should not exceed 5MB');
        return;
      }
      
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
    formData.append('imageType', imageType); // Add imageType to the formData

    try {
      const response = await axios.post('http://localhost:5005/api/classify', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { predictedCondition, predictedConfidence } = response.data;

      // Check for the expected data structure
      if (predictedCondition && predictedConfidence) {
        setDiagnosis(predictedCondition);
        setConfidence(predictedConfidence.toFixed(2));  // Show confidence with 2 decimals
      } else {
        alert('Unexpected response format');
      }

      setLoading(false);  // End loading state
    } catch (error) {
      console.error('Error diagnosing image:', error);
      alert('Error diagnosing image. Please try again.');
      setLoading(false);  // End loading state
    }
  };

  // Cleanup preview URL to avoid memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="diagnose-container">
      <h2>Upload and Diagnose Medical Image</h2>

      {/* Image Type Selection */}
      <div className="image-type-section">
        <label htmlFor="imageType">Select Image Type:</label>
        <select 
          id="imageType" 
          value={imageType} 
          onChange={(e) => setImageType(e.target.value)}
        >
          <option value="internal">Internal (X-ray/MRI)</option>
          <option value="external">External (Burns/Wounds)</option>
        </select>
      </div>

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

      {/* Loading Spinner */}
      {loading && <div className="loading-spinner">Diagnosing...</div>}

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
