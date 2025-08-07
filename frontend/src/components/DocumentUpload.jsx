import React, { useState, useCallback } from 'react';

const DocumentUpload = ({ onUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'image/jpeg',
      'image/jpg',
      'image/png'
    ];

    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a PDF, DOCX, DOC, or image file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB.');
      return;
    }

    setUploading(true);
    try {
      await onUpload(file);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-4">Upload Permit Application</h3>
      <p className="text-gray-600 mb-6">
        Upload your completed or in-progress permit application to receive automated feedback and rejection risk scoring.
      </p>
      
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleChange}
          accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
          disabled={uploading}
        />
        
        <div className="space-y-4">
          <div className="text-4xl">📄</div>
          
          {uploading ? (
            <div className="text-blue-600">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p>Processing document...</p>
            </div>
          ) : (
            <>
              <div>
                <p className="text-lg font-medium text-gray-700">
                  Drop your permit application here, or click to browse
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Supports PDF, DOCX, DOC, JPG, PNG (max 10MB)
                </p>
              </div>
              
              <button
                type="button"
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-200"
                onClick={() => document.getElementById('file-upload').click()}
              >
                Choose File
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-semibold text-yellow-800 mb-2">What we'll check:</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Missing signatures, fields, or required attachments</li>
          <li>• Zoning and code compliance violations</li>
          <li>• Inconsistent or incomplete project narratives</li>
          <li>• Proper formatting and documentation standards</li>
          <li>• Overall rejection risk assessment</li>
        </ul>
      </div>
    </div>
  );
};

export default DocumentUpload;