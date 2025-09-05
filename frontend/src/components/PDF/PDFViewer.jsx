import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import axios from 'axios';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFViewer = () => {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const [pdfFile, setPdfFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [highlights, setHighlights] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [scale, setScale] = useState(1.2);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const pdfContainerRef = useRef(null);

  useEffect(() => {
    loadPDF();
    loadHighlights();
  }, [uuid]);

  const loadPDF = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Create a direct URL with token for the PDF
      const pdfUrl = `http://localhost:5000/api/pdf/${uuid}`;
      
      // Create a custom file object that includes authorization
      const fileObject = {
        url: pdfUrl,
        httpHeaders: {
          'Authorization': token
        }
      };

      setPdfFile(fileObject);
      console.log('PDF file object created with auth headers');
      
    } catch (error) {
      console.error('Error setting up PDF:', error);
    }
  };

  const loadHighlights = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(`http://localhost:5000/api/highlight/${uuid}`, {
        headers: {
          'Authorization': token 
        }
      });
      
      if (response.data.success) {
        setHighlights(response.data.highlights || []);
      }
    } catch (error) {
      console.error('Error loading highlights:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeUser('user');
        navigate('/login');
      }
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    if (text && text.length > 0) {
      setSelectedText(text);
      setIsSelecting(true);
    }
  };

  const createHighlight = async () => {
    if (!selectedText) return;

    try {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        const highlight = {
          pdfUuid: uuid,
          pageNumber: currentPage,
          highlightedText: selectedText,
          boundingBox: {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height
          },
          position: {
            start: range.startOffset,
            end: range.endOffset
          }
        };

        const token = localStorage.getItem('token');
        const response = await axios.post('http://localhost:5000/api/highlight', highlight, {
          headers: {
            'Authorization': token, // Fixed: removed 'Bearer ' prefix
            'Content-Type': 'application/json'
          }
        });

        if (response.data.success) {
          setHighlights([...highlights, response.data.highlight]);
          
          // Clear selection
          selection.removeAllRanges();
          setSelectedText('');
          setIsSelecting(false);
          
          alert('Highlight created successfully!');
        }
      }
    } catch (error) {
      console.error('Error creating highlight:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        alert('Error creating highlight. Please try again.');
      }
    }
  };

  const deleteHighlight = async (highlightId) => {
    if (!window.confirm('Are you sure you want to delete this highlight?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`http://localhost:5000/api/highlight/${highlightId}`, {
        headers: {
          'Authorization': token // Fixed: removed 'Bearer ' prefix
        }
      });
      
      if (response.data.success) {
        setHighlights(highlights.filter(h => h._id !== highlightId));
        alert('Highlight deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting highlight:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        alert('Error deleting highlight. Please try again.');
      }
    }
  };

  const goToPrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, numPages || 1));
  };

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 2.0));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.6));
  };

  const cancelSelection = () => {
    setIsSelecting(false);
    setSelectedText('');
    window.getSelection().removeAllRanges();
  };

  const jumpToPage = (pageNum) => {
    setCurrentPage(pageNum);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading PDF...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-md">
            <h3 className="font-bold mb-2">Error Loading PDF</h3>
            <p className="mb-4">{error}</p>
            <div className="space-x-3">
              <button
                onClick={loadPDF}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-xl font-bold text-gray-900">PDF Viewer</h1>
            <div></div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={goToPrevPage}
                disabled={currentPage <= 1}
                className="px-4 py-2 bg-gray-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
              >
                Previous
              </button>
              
              <span className="text-gray-700 font-medium">
                Page {currentPage} of {numPages || 0}
              </span>
              
              <button
                onClick={goToNextPage}
                disabled={currentPage >= numPages}
                className="px-4 py-2 bg-gray-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
              >
                Next
              </button>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={zoomOut}
                disabled={scale <= 0.6}
                className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                Zoom Out
              </button>
              
              <span className="text-gray-700 font-medium min-w-[60px] text-center">
                {Math.round(scale * 100)}%
              </span>
              
              <button
                onClick={zoomIn}
                disabled={scale >= 2.0}
                className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                Zoom In
              </button>
            </div>
          </div>

          {/* Selection Actions */}
          {isSelecting && (
            <div className="mt-4 p-4 bg-yellow-100 rounded-lg border border-yellow-300">
              <p className="text-sm mb-3 text-gray-700">
                <strong>Selected text:</strong> "{selectedText.substring(0, 100)}{selectedText.length > 100 ? '...' : ''}"
              </p>
              <div className="flex gap-2">
                <button
                  onClick={createHighlight}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md text-sm hover:bg-yellow-700 transition-colors"
                >
                  Create Highlight
                </button>
                <button
                  onClick={cancelSelection}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* PDF Viewer */}
          <div className="lg:col-span-3">
            <div 
              ref={pdfContainerRef}
              className="bg-white p-6 rounded-lg shadow-md overflow-auto"
              onMouseUp={handleTextSelection}
              style={{ maxHeight: '80vh' }}
            >
              {pdfFile && (
                <Document
                  file={pdfFile}
                  onLoadSuccess={onDocumentLoadSuccess}
                  className="flex justify-center"
                  error={
                    <div className="text-center p-8">
                      <p className="text-red-600">Failed to load PDF document.</p>
                      <button 
                        onClick={loadPDF}
                        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
                      >
                        Retry
                      </button>
                    </div>
                  }
                  loading={
                    <div className="text-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-gray-600">Loading document...</p>
                    </div>
                  }
                >
                  <Page 
                    pageNumber={currentPage} 
                    scale={scale}
                    className="shadow-lg border border-gray-300"
                    error={
                      <div className="text-center p-8">
                        <p className="text-red-600">Failed to load page {currentPage}.</p>
                      </div>
                    }
                    loading={
                      <div className="text-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-gray-600">Loading page...</p>
                      </div>
                    }
                  />
                </Document>
              )}
            </div>
          </div>

          {/* Highlights Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">
                Highlights ({highlights.length})
              </h3>
              
              {/* Current Page Highlights */}
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-700 mb-3">Current Page</h4>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {highlights
                    .filter(h => h.pageNumber === currentPage)
                    .map((highlight) => (
                      <div key={highlight._id} className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                        <p className="text-sm font-medium text-gray-800 mb-1">
                          Page {highlight.pageNumber}
                        </p>
                        <p className="text-sm text-gray-700 mb-2">
                          "{highlight.highlightedText.substring(0, 80)}
                          {highlight.highlightedText.length > 80 ? '...' : ''}"
                        </p>
                        <button
                          onClick={() => deleteHighlight(highlight._id)}
                          className="text-xs text-red-600 hover:text-red-800 font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                
                  {highlights.filter(h => h.pageNumber === currentPage).length === 0 && (
                    <p className="text-sm text-gray-500 italic">
                      No highlights on this page
                    </p>
                  )}
                </div>
              </div>

              {/* All Highlights Navigation */}
              <div className="border-t pt-4">
                <h4 className="text-md font-medium text-gray-700 mb-3">All Highlights</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {highlights
                    .sort((a, b) => a.pageNumber - b.pageNumber)
                    .map((highlight) => (
                      <div key={highlight._id} className="flex items-center justify-between">
                        <button
                          onClick={() => jumpToPage(highlight.pageNumber)}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Page {highlight.pageNumber}
                        </button>
                        <span className="text-xs text-gray-400">
                          {new Date(highlight.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  
                  {highlights.length === 0 && (
                    <p className="text-sm text-gray-500 italic">
                      No highlights created yet
                    </p>
                  )}
                </div>
              </div>

              {/* Instructions */}
              <div className="border-t pt-4 mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">How to highlight:</h4>
                <p className="text-xs text-gray-600">
                  Select any text in the PDF and click "Create Highlight" to save it.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;