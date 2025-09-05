import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PDFUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  //todo zod part
  const validateFile = (selectedFile) => {
    if (!selectedFile) {
      console.error('Please select a file');
      return false;
    }
    
    if (selectedFile.type !== 'application/pdf') {
      console.error('Only PDF files are allowed');
      return false;
    }

    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (selectedFile.size > maxSize) {
      console.eror('File size must be less than 50MB');
      return false;
    }
    
    return true;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (validateFile(selectedFile)) {
      setFile(selectedFile);
    } else {
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a PDF file first');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const formData = new FormData();
      formData.append('pdf', file);

      const response = await axios.post('http://localhost:5000/api/pdf/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': token
        }
      });

      if (response.data.success) {
        // Success callback
        if (onUploadSuccess) {
          onUploadSuccess(response.data);
        }
        
        // Reset form
        setFile(null);
        
        // Clear file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        console.error(response.data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
        console.error(error.response?.data?.message || 'Upload failed. Please try again.');
    } 
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">Upload New PDF</h3>
      <div className="mb-4">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-medium
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100
            file:cursor-pointer cursor-pointer"
        />
        <p className="text-xs text-gray-500 mt-2">
          Maximum file size: 50MB. Only PDF files are supported.
        </p>
      </div>

      
      {file && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate" title={file.name}>
                {file.name}
              </p>
              <p className="text-xs text-gray-500">
                Size: {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={clearFile}
              disabled={uploading}
              className="ml-3 text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        </div>
      )}
      
      <button
        onClick={handleUpload}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors"
      >
        Upload PDF
      </button>
      
    </div>
  );
};

export default PDFUpload;