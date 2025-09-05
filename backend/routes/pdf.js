const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const {pdfModel} = require('../models/db');
const auth = require('../middleware/auth');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uuid = uuidv4();
    cb(null, `${uuid}.pdf`);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Upload PDF
router.post('/upload', auth, (req, res) => {
  upload.single('pdf')(req, res, async (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'File too large. Maximum size is 50MB.' });
        }
        return res.status(400).json({ message: 'Upload error: ' + err.message });
      }
      return res.status(400).json({ message: err.message });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No PDF file uploaded' });
      }

      const uuid = path.parse(req.file.filename).name;
      
      const pdf = new pdfModel({
        uuid,
        filename: req.file.filename,
        originalName: req.file.originalname,
        userId: req.user.userId,
        filePath: req.file.path
      });

      await pdf.save();

      res.json({
        success: true,
        uuid,
        filename: req.file.originalname,
        message: 'PDF uploaded successfully'
      });
    } catch (error) {
      console.error('PDF upload error:', error);
      // Delete uploaded file if database save fails
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ message: 'Error saving PDF information' });
    }
  });
});

// Get user's PDFs
router.get('/list', auth, async (req, res) => {
  try {
    const pdfs = await pdfModel.find({ userId: req.user.userId })
      .select('uuid originalName createdAt')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      pdfs,
      count: pdfs.length
    });
  } catch (error) {
    console.error('PDF list error:', error);
    res.status(500).json({ message: 'Error fetching PDF list' });
  }
});

// Get specific PDF file
router.get('/:uuid', auth, async (req, res) => {
  try {
    const pdf = await pdfModel.findOne({ 
      uuid: req.params.uuid, 
      userId: req.user.userId 
    });
    
    if (!pdf) {
      return res.status(404).json({ message: 'PDF not found' });
    }

    // Check if file exists on filesystem
    if (!fs.existsSync(pdf.filePath)) {
      return res.status(404).json({ message: 'PDF file not found on server' });
    }

    // Set appropriate headers for PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${pdf.originalName}"`);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'no-cache');
    
    // Send the file
    res.sendFile(path.resolve(pdf.filePath));
  } catch (error) {
    console.error('PDF get error:', error);
    res.status(500).json({ message: 'Error retrieving PDF' });
  }
});

// Delete PDF
router.delete('/:uuid', auth, async (req, res) => {
  try {
    const pdf = await pdfModel.findOne({ 
      uuid: req.params.uuid, 
      userId: req.user.userId 
    });
    
    if (!pdf) {
      return res.status(404).json({ message: 'PDF not found' });
    }

    // Delete file from filesystem
    if (fs.existsSync(pdf.filePath)) {
      try {
        fs.unlinkSync(pdf.filePath);
      } catch (fileError) {
        console.error('Error deleting file:', fileError);
        // Continue with database deletion even if file deletion fails
      }
    }

    await pdfModel.deleteOne({ _id: pdf._id });
    
    res.json({ 
      success: true,
      message: 'PDF deleted successfully' 
    });
  } catch (error) {
    console.error('PDF delete error:', error);
    res.status(500).json({ message: 'Error deleting PDF' });
  }
});

// // Update PDF name (bonus feature)
// router.put('/:uuid/rename', auth, async (req, res) => {
//   try {
//     const { newName } = req.body;
    
//     if (!newName || newName.trim().length === 0) {
//       return res.status(400).json({ message: 'New name is required' });
//     }

//     const pdf = await pdfModel.findOne({ 
//       uuid: req.params.uuid, 
//       userId: req.user.userId 
//     });
    
//     if (!pdf) {
//       return res.status(404).json({ message: 'PDF not found' });
//     }

//     pdf.originalName = newName.trim();
//     await pdf.save();
    
//     res.json({ 
//       success: true,
//       message: 'PDF renamed successfully',
//       pdf: {
//         uuid: pdf.uuid,
//         originalName: pdf.originalName,
//         createdAt: pdf.createdAt
//       }
//     });
//   } catch (error) {
//     console.error('PDF rename error:', error);
//     res.status(500).json({ message: 'Error renaming PDF' });
//   }
// });

module.exports = router;