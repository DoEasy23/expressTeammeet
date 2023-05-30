    const express = require('express');
    const router = express.Router();
    const jwt = require('jsonwebtoken');
    const bcrypt = require('bcrypt');
    const User = require('../schemas/user.schema');
    const { check, validationResult } = require('express-validator');
    const auth = require("../auth/auth.MiddleWare")


    // User registration route
    router.post('/signup', [
        check('name', 'Name is required').notEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
        check('location', 'Location is required').notEmpty(),
        check("phone","phone is required").notEmpty(),
    ], async (req, res) => {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password, location, phone } = req.body;

        try {
            // Check if the user already exists
            let user = await User.findOne({ email });
            if (user) {
                return res.status(400).json({ msg: 'User already exists' });
            }

            // Create a new user
            user = new User({ name, email, password, location, phone });
            // Hash the password

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);


            // Save the user to the database
            await user.save();

            // Create a JWT token
            const payload = {
                user: {
                    id: user.id
                }
            };
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

            res.json({ token });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    });


    // User login route
    router.post('/login', [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password is required').exists()
    ], async (req, res) => {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            // Check if the user exists
            let user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ msg: 'Invalid Credentials' });
            }

            // Check if the password is correct
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ msg: 'Invalid Credentials' });
            }

            // Create a JWT token
            const payload = {
                user: {
                    id: user.id
                }
            };
            console.log(payload)
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

            res.json({ token });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    });

    // Get user profile
    router.get(':id',auth, async (req, res) => {
        try {
            const user = await User.findById(req.params.id).select('-password');
            if (!user) {
                return res.status(404).json({ msg: 'User not found' });
            }
            res.json(user);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    });

    router.get('/me', auth, async (req, res) => {
        try {
            // Find the user in the database using the id stored in the JWT token
            const user = await User.findById(req.user.id).select('-password');
            res.json(user);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    });
    // Update user's profile
    router.put("/updateProfile", auth, async (req, res) => {
        const { bio,name,location, birthday} = req.body;
        try {
            // Find the user in the database using the id stored in the JWT token
            let user = await User.findById(req.user.id);
            console.log(user)
            if (!user) {
                return res.status(400).json({ msg: 'User not found' });
            }
            // Update user properties
            if (name) user.name = name;
            if (location) user.location = location;
            if (bio) user.bio = bio;
            if (birthday) user.birthday = birthday;

            // Save the updated user to the database
            try {
                await user.save();
                res.json(user);
            } catch (err) {
                console.error(err.message);
                res.status(500).send('Server Error');
            }

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    });
    // Update user's email, phone, and password
    router.put('/update', auth, async (req, res) => {
        const { email, password,phone } = req.body;

        try {
            // Find the user in the database using the id stored in the JWT token
            let user = await User.findById(req.user.id);
            if (!user) {
                return res.status(400).json({ msg: 'User not found' });
            }
            // Update user properties
            if (email) user.email = email;
            if (phone) user.phone = phone;
            if (password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(password, salt);
            }
            // Save the updated user to the database
            await user.save();

            res.json(user);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    });
    // Delete user
    router.delete('/delete', auth, async (req, res) => {
        try {
            // Find the user in the database using the id stored in the JWT token
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json({ msg: 'User not found' });
            }

            // Delete the user from the database
            await user.remove();

            res.json({ msg: 'User deleted' });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    });

    module.exports = router;