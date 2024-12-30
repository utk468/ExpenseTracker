const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const cors = require('cors');




const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));  // Serve static files (frontend files)
app.use(session({
  secret: '', 
  resave: false, 
  saveUninitialized: true,
}));

mongoose.connect('', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB', err));


const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
});

const User = mongoose.model('User', userSchema);


const expenseSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  description: String,
  amount: Number,
  date: Date,
});

const Expense = mongoose.model('Expense', expenseSchema);





app.delete('/api/expenses/:id', async (req, res) => {
    const { id } = req.params;
    await Expense.findByIdAndDelete(id);
    res.status(200).send('Expense deleted');
  });
  

  app.put('/api/expenses/:id', async (req, res) => {
    const { id } = req.params;
    const { description, amount, date } = req.body;
    const updatedExpense = await Expense.findByIdAndUpdate(id, { description, amount, date }, { new: true });
    res.status(200).json(updatedExpense);
  });



app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'Registered successfully!' });
  } catch (err) {
    res.status(400).json({ message: 'Registration failed' });
  }
});


app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  req.session.userId = user._id;
  res.json({ message: 'Login successful' });
});


app.post('/api/expenses', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { description, amount, date } = req.body;

  const expense = new Expense({
    userId: req.session.userId,
    description,
    amount,
    date,
  });

  try {
    await expense.save();
    res.status(201).json({ message: 'Expense added successfully!' });
  } catch {
    res.status(400).json({ message: 'Failed to add expense' });
  }
});


app.get('/api/expenses', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { startDate, endDate } = req.query;
  const query = { userId: req.session.userId };

  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  const expenses = await Expense.find(query);
  res.json(expenses);
});


app.listen(5000, () => console.log('Server running on http://localhost:5000'));
