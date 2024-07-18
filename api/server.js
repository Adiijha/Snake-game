const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Replace with your MongoDB Atlas connection string
const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://adityakumarjha276:fTCQSgSqzgJW9O38@cluster0.ox3rpvh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGO_URI);

const ScoreSchema = new mongoose.Schema({
  name: String,
  score: Number,
  date: { type: Date, default: Date.now }
});

const Score = mongoose.model('Score', ScoreSchema);

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, '../public')));

app.post('/api/score', (req, res) => {
  const { name, score } = req.body;

  Score.findOne({ name }).then(existingScore => {
    if (existingScore) {
      if (score > existingScore.score) {
        existingScore.score = score;
        existingScore.save().then(updatedScore => res.json(updatedScore));
      } else {
        res.json(existingScore);
      }
    } else {
      const newScore = new Score({ name, score });
      newScore.save().then(newScore => res.json(newScore));
    }
  }).catch(error => res.status(500).json({ error: error.message }));
});

app.get('/api/leaderboard', (req, res) => {
  Score.find().sort({ score: -1 }).limit(10).then(scores => res.json(scores));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
