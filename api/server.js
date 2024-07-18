const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Replace with your MongoDB Atlas connection string
const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://adityakumarjha276:1234@cluster0.ox3rpvh.mongodb.net/cluster0?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGO_URI, {
  
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

const ScoreSchema = new mongoose.Schema({
  name: String,
  score: Number,
  date: { type: Date, default: Date.now }
});

const Score = mongoose.model('Score', ScoreSchema);

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, '../public')));

app.post('/api/score', async (req, res) => {
  const { name, score } = req.body;

  try {
    const existingScore = await Score.findOne({ name });
    if (existingScore) {
      if (score > existingScore.score) {
        existingScore.score = score;
        const updatedScore = await existingScore.save();
        res.json(updatedScore);
      } else {
        res.json(existingScore);
      }
    } else {
      const newScore = new Score({ name, score });
      const savedScore = await newScore.save();
      res.json(savedScore);
    }
  } catch (error) {
    console.error('Error saving score:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/leaderboard', async (req, res) => {
  try {
    const scores = await Score.find().sort({ score: -1 }).limit(10);
    res.json(scores);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
