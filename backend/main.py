const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import Models
const Detection = require('./models/Detection');
const User = require('./models/User');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log(' Connected to weed_detection_db'))
  .catch(err => console.error(' MongoDB connection error:', err));

// --- DETECTION ROUTES ---

// 1. POST: Save any detection (AI identified or Unrecognized)
app.post('/api/detections', async (req, res) => {
  try {
    const newDetection = new Detection(req.body);
    const savedDetection = await newDetection.save();
    res.status(201).json(savedDetection);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save detection' });
  }
});

// 2. GET: Fetch detection history for the dashboard
app.get('/api/detections', async (req, res) => {
  try {
    const detections = await Detection.find().sort({ timestamp: -1 });
    res.status(200).json(detections);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// 3. PATCH: Manually label an "Unrecognized" plant
app.patch('/api/detections/:id/manual-label', async (req, res) => {
  try {
    const { manualLabelName, status } = req.body;
    const updatedDetection = await Detection.findByIdAndUpdate(
      req.params.id,
      {
        manualLabelName: manualLabelName,
        isManuallyLabeled: true,
        status: status // Allows user to mark it as 'weed' or 'crop'
      },
      { new: true }
    );
    res.status(200).json(updatedDetection);
  } catch (error) {
    res.status(500).json({ message: 'Manual labeling failed', error: error.message });
  }
});

// --- USER & AUTH ROUTES [cite: 3, 6] ---

// Register Profile
app.post('/api/users/register', async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json({ message: "Farmer profile created successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login using Login ID (Email)
app.post('/api/users/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, password });
    if (user) {
      res.status(200).json({
        message: "Login successful",
        userId: user._id,
        username: user.username
      });
    } else {
      res.status(401).json({ error: "Invalid Login ID or Password" });
    }
  } catch (err) {
    res.status(500).json({ error: "Server error during login" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));