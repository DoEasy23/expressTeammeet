const express = require('express');
const router = express.Router();
const Event = require('../schemas/event.schema');

// Create a new event
router.post('/', async (req, res) => {
    try {
        const { title, date, location, description, sport, createdBy } = req.body;
        const event = new Event({ title, date, location, description, sport, createdBy });
        const savedEvent = await event.save();
        res.json(savedEvent);
        console.log(savedEvent);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// Get all events
router.get('/', async (req, res) => {
    try {
        const events = await Event.find();
        res.json(events);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// Delete an event
router.delete('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ msg: 'Event not found' });
        }
        await event.remove();
        res.json({ msg: 'Event deleted' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
