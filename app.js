const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer');
const connectDB = require('./db'); // Import the MongoDB connection module

const secretKey = 'your_secret_key';

// Connect to MongoDB
connectDB();

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Directory where images will be stored
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Ensure unique filenames
    }
});
const upload = multer({ storage });

// User Schema
const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    name: String,
    username: String,
    password: String,
    profilePicture: String // Store the file path of the uploaded image
});

const User = mongoose.model('User', userSchema);

// Transaction Schema
const transactionSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    amount: Number,
    date: { type: Date, default: Date.now },
    description: String
});

const Transaction = mongoose.model('Transaction', transactionSchema);

// Middleware to authenticate user
const authenticate = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Access denied' });
    }

    try {
        const decoded = jwt.verify(token, secretKey);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// Create the Express app instance
const app = express();
const port = 3001;

// Middleware
app.use(bodyParser.json());
app.use(cors()); // Enable CORS
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static('uploads')); // Serve uploaded images

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API route to sign up a new user with profile picture upload
app.post('/api/signup', upload.single('profile-picture'), async (req, res) => {
    const { name, username, password } = req.body;
    const profilePicture = req.file ? req.file.path : null; // Store file path if uploaded
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = new User({ name, username, password: hashedPassword, profilePicture });

    try {
        await user.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Error creating user' });
    }
});

// API route to log in a user
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '1h' });
        res.status(200).json({ token, name: user.name });
    } catch (error) {
        res.status(400).json({ message: 'Error logging in' });
    }
});

// API route to create a new transaction
app.post('/api/transactions', authenticate, async (req, res) => {
    const { amount, description, date } = req.body;
    const transaction = new Transaction({ userId: req.userId, amount, description, date });

    try {
        await transaction.save();
        res.status(201).json(transaction);
    } catch (error) {
        res.status(400).json({ message: 'Error creating transaction' });
    }
});

// API route to get all transactions for a user or search by date
app.get('/api/transactions', authenticate, async (req, res) => {
    const { date } = req.query; // Get date from query parameters
    const userId = req.userId; // Use the authenticated user's ID

    let query = { userId }; // Basic query to find transactions by userId

    if (date) {
        // Create a Date object from the provided date
        const startDate = new Date(date);
        const endDate = new Date(startDate);
        
        // Set to start of the day (UTC)
        startDate.setUTCHours(0, 0, 0, 0);
        
        // Set to end of the day (UTC)
        endDate.setUTCHours(23, 59, 59, 999);

        // Filter transactions for that specific date
        query.date = { $gte: startDate, $lt: endDate };
    }

    try {
        const transactions = await Transaction.find(query);
        res.status(200).json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ message: 'Error fetching transactions' });
    }
});


// API route to get user data
app.get('/api/user', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        res.status(200).json({ name: user.name, profilePicture: user.profilePicture });
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ message: 'Error fetching user data' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
