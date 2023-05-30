const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const User = require('./schemas/user.schema');
const authRoutes = require('./routes/users');
const eventsRoute = require('./routes/events');
const joinController = require('./routes/join');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.log(`Error connecting to MongoDB: ${err}`));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventsRoute);
app.use('/api/join', joinController);
// JWT authentication middleware
app.use((req, res, next) => {
    // Check header or url parameters or post parameters for token
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized access' });
    }

    // Verify JWT token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        // Attach user object to request object for use in later middleware functions
        User.findById(decoded.userId)
            .then(user => {
                if (!user) {
                    return res.status(401).json({ message: 'User not found' });
                }
                req.user = user;
                next();
            })
            .catch(err => {
                return res.status(401).json({ message: 'User not found' });
            });
    });
});

// Start server
app.listen(process.env.PORT || 3000, () => console.log('Server started'));
