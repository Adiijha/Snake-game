//importing all the required modules
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;


//MongoDB Database
mongoose.connect('mongodb://localhost:27017/snakegame', { useNewUrlParser: true, useUnifiedTopology: true });

const ScoreSchema = new mongoose.Schema({
  name: String,
  score: Number,
  date: { type: Date, default: Date.now }
});

const Score = mongoose.model('Score', ScoreSchema);

app.use(bodyParser.json());

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/score', (req, res) => {
  const { name, score } = req.body;

  // Find the existing score for the player
  Score.findOne({ name }).then(existingScore => {
    if (existingScore) {
      // Update the score only if the new score is higher
      if (score > existingScore.score) {
        existingScore.score = score;
        existingScore.save().then(updatedScore => res.json(updatedScore));
      } else {
        res.json(existingScore);
      }
    } else {
      // Save the new score if no existing score is found
      const newScore = new Score({ name, score });
      newScore.save().then(newScore => res.json(newScore));
    }
  }).catch(error => res.status(500).json({ error: error.message }));
});


app.get('/api/leaderboard', (req, res) => {
  Score.find().sort({ score: -1 }).limit(10).then(scores => res.json(scores));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
