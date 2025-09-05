import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PDFList = ({ refreshTrigger }) => {
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchPDFs = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/pdf/list', {
        headers: {
          'Authorization': token
        }
      });

      if (response.data.success) {
        setPdfs(response.data.pdfs || []);
      } else {
        console.log('Failed to load PDFs');
      }
    } catch (error) {
      console.error('Error fetching PDFs:', error);
      console.log(error.response?.data?.message || 'Failed to load PDFs');
    } 
  };

  useEffect(() => {
    fetchPDFs();
  }, [refreshTrigger]);

  const handleDelete = async (uuid, filename) => {

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`http://localhost:5000/api/pdf/${uuid}`, {
        headers: {
          'Authorization': token
        }
      });

      if (response.data.success) {
        setPdfs(prevPdfs => prevPdfs.filter(pdf => pdf.uuid !== uuid));
        console.log('PDF deleted successfully');
      } else {
        console.log('Failed to delete PDF');
      }
    } catch (error) {
      console.error('Error deleting PDF:', error);
      alert(error.response?.data?.message || 'Error deleting PDF');
    }
  };

  const handleOpen = (uuid) => {
    navigate(`/pdf/${uuid}`);
  };

  if (pdfs.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">My Library</h3>
        <div className="text-center py-8">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">No PDFs yet</h4>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          My Library
        </h3>
        <button
          onClick={fetchPDFs}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 transition-colors"
        >
          <svg className='h-4 w-4' xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
</svg>
          Refresh
        </button>
      </div>
      
      <div className="space-y-3">
        {pdfs.map((pdf) => (
          <div key={pdf.uuid} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate" title={pdf.originalName}>
                    {pdf.originalName}
                  </h4>
                  <p className="text-sm text-gray-500">
                    Uploaded on {new Date(pdf.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => handleOpen(pdf.uuid)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                title="Open and view PDF"
              >
                <span className="hidden sm:inline">Open</span>
                {/* heroicons is used below */}
                <svg className="w-4 h-4 sm:hidden " xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>

              </button>
              
              <button
                onClick={() => handleDelete(pdf.uuid, pdf.originalName)}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                title="Delete PDF"
              >
                <span className="hidden sm:inline">Delete</span>
                <svg className="w-4 h-4 sm:hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>

              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PDFList;