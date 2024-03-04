const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const users = [];
const logs = [];

app.post('/api/users', (req, res) => {
  const { username } = req.body;
  const existingUser = users.find(user => user.username === username);
  if (existingUser) {
    return res.json({ error: 'Username already exists' });
  }

  const newUser = { _id: uuidv4().replace(/-/g, ''), username };
  users.push(newUser);
  res.json(newUser);
});

app.get('/api/users', (req, res) => {
  res.json(users);
});

app.post('/api/users/:_id/exercises', (req, res) => {
  const { description, duration, date } = req.body;
  const userId = req.params._id;

  const user = users.find(user => user._id === userId);
  if (!user) {
    return res.json({ error: 'User not found' });
  }

  const exercise = {
    userId,
    description,
    duration: parseInt(duration),
    date: date ? new Date(date).toDateString() : new Date().toDateString()
  };

  logs.push(exercise);

  res.json({
    _id: user['_id'],
    username: user['username'],
    date: exercise['date'],
    duration: exercise['duration'],
    description: exercise['description']
  });
});

app.get('/api/users/:_id/logs', (req, res) => {
  const userId = req.params._id;
  const { from, to, limit } = req.query;

  const user = users.find(user => user._id === userId);
  if (!user) {
    return res.json({ error: 'User not found' });
  }

  let filteredExercises = logs.filter(log => log.userId === userId);

  if (from) {
      filteredExercises = filteredExercises.filter(log => new Date(log.date) >= new Date(from));
  }
  if (to) {
      filteredExercises = filteredExercises.filter(log => new Date(log.date) <= new Date(to));
  }
  if (limit) {
      filteredExercises = filteredExercises.slice(0, parseInt(limit));
  }

  const formattedExercises = filteredExercises.map(exercise => ({
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date
  }));

  res.json({
    _id: user._id,
    username: user.username,
    count: formattedExercises.length,
    log: formattedExercises
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
