const express = require('express');
const {highlightModel, pdfModel} = require('../models/db');
const auth = require('../middleware/auth');

const router = express.Router();

// Create highlight
router.post('/', auth, async (req, res) => {
  try {
    const { pdfUuid, pageNumber, highlightedText, boundingBox, position } = req.body;
    
    // Input validation
    if (!pdfUuid || !pageNumber || !highlightedText) {
      return res.status(400).json({ 
        message: 'PDF UUID, page number, and highlighted text are required' 
      });
    }
    
    // Verify PDF belongs to user
    const pdf = await pdfModel.findOne({ 
      uuid: pdfUuid, 
      userId: req.user.userId 
    });
    
    if (!pdf) {
      return res.status(404).json({ 
        message: 'PDF not found or access denied' 
      });
    }

    const highlight = new highlightModel({
      pdfUuid,
      userId: req.user.userId,
      pageNumber: parseInt(pageNumber),
      highlightedText: highlightedText.trim(),
      boundingBox: boundingBox || {},
      position: position || {}
    });

    await highlight.save();
    
    res.status(201).json({
      success: true,
      highlight,
      message: 'Highlight created successfully'
    });
  } catch (error) {
    console.error('Create highlight error:', error);
    res.status(500).json({ 
      message: 'Error creating highlight' 
    });
  }
});

// Get highlights for a PDF
router.get('/:pdfUuid', auth, async (req, res) => {
  try {
    const { pdfUuid } = req.params;
    
    // Verify PDF belongs to user
    const pdf = await pdfModel.findOne({ 
      uuid: pdfUuid, 
      userId: req.user.userId 
    });
    
    if (!pdf) {
      return res.status(404).json({ 
        message: 'PDF not found or access denied' 
      });
    }

    const highlights = await highlightModel.find({ 
      pdfUuid, 
      userId: req.user.userId 
    }).sort({ pageNumber: 1, createdAt: 1 });
    
    res.json({
      success: true,
      highlights,
      count: highlights.length
    });
  } catch (error) {
    console.error('Get highlights error:', error);
    res.status(500).json({ 
      message: 'Error retrieving highlights' 
    });
  }
});

// Get highlights by page
router.get('/:pdfUuid/page/:pageNumber', auth, async (req, res) => {
  try {
    const { pdfUuid, pageNumber } = req.params;
    
    // Verify PDF belongs to user
    const pdf = await pdfModel.findOne({ 
      uuid: pdfUuid, 
      userId: req.user.userId 
    });
    
    if (!pdf) {
      return res.status(404).json({ 
        message: 'PDF not found or access denied' 
      });
    }

    const highlights = await highlightModel.find({ 
      pdfUuid, 
      userId: req.user.userId,
      pageNumber: parseInt(pageNumber)
    }).sort({ createdAt: 1 });
    
    res.json({
      success: true,
      highlights,
      count: highlights.length,
      pageNumber: parseInt(pageNumber)
    });
  } catch (error) {
    console.error('Get page highlights error:', error);
    res.status(500).json({ 
      message: 'Error retrieving page highlights' 
    });
  }
});

// Update highlight
router.put('/:id', auth, async (req, res) => {
  try {
    const { highlightedText } = req.body;
    
    if (!highlightedText || highlightedText.trim().length === 0) {
      return res.status(400).json({ 
        message: 'Highlighted text cannot be empty' 
      });
    }

    const highlight = await highlightModel.findOne({ 
      _id: req.params.id, 
      userId: req.user.userId 
    });
    
    if (!highlight) {
      return res.status(404).json({ 
        message: 'Highlight not found or access denied' 
      });
    }

    highlight.highlightedText = highlightedText.trim();
    await highlight.save();

    res.json({
      success: true,
      highlight,
      message: 'Highlight updated successfully'
    });
  } catch (error) {
    console.error('Update highlight error:', error);
    res.status(500).json({ 
      message: 'Error updating highlight' 
    });
  }
});

// Delete highlight
router.delete('/:id', auth, async (req, res) => {
  try {
    const highlight = await highlightModel.findOne({ 
      _id: req.params.id, 
      userId: req.user.userId 
    });
    
    if (!highlight) {
      return res.status(404).json({ 
        message: 'Highlight not found or access denied' 
      });
    }

    await highlightModel.deleteOne({ _id: req.params.id });
    
    res.json({ 
      success: true,
      message: 'Highlight deleted successfully' 
    });
  } catch (error) {
    console.error('Delete highlight error:', error);
    res.status(500).json({ 
      message: 'Error deleting highlight' 
    });
  }
});

// Delete all highlights for a PDF
router.delete('/pdf/:pdfUuid', auth, async (req, res) => {
  try {
    const { pdfUuid } = req.params;
    
    // Verify PDF belongs to user
    const pdf = await pdfModel.findOne({ 
      uuid: pdfUuid, 
      userId: req.user.userId 
    });
    
    if (!pdf) {
      return res.status(404).json({ 
        message: 'PDF not found or access denied' 
      });
    }

    const result = await highlightModel.deleteMany({ 
      pdfUuid, 
      userId: req.user.userId 
    });
    
    res.json({ 
      success: true,
      deletedCount: result.deletedCount,
      message: `${result.deletedCount} highlights deleted successfully` 
    });
  } catch (error) {
    console.error('Delete all highlights error:', error);
    res.status(500).json({ 
      message: 'Error deleting highlights' 
    });
  }
});

module.exports = router;