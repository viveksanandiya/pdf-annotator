import { useState } from 'react';
import PDFUpload from '../components/PDF/PDFUpload';
import PDFList from '../components/PDF/PDFList';

const Dashboard = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadSuccess = (data) => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <p className="text-gray-600">Upload and manage your PDF documents with annotations</p>
        </div>
        
        <div className="space-y-8">
          <PDFUpload onUploadSuccess={handleUploadSuccess} />
          <PDFList refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;