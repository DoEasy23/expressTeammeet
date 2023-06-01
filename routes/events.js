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
            return res.status(404).json({ message: 'Event not found.' });
        }

        await event.remove();
        await event.save();

        res.json({ message: 'Event deleted successfully.' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});
// put an event
router.put('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found.' });
        }
        if (req.body.title) event.title = req.body.title;
        if (req.body.date) event.date = req.body.date;
        if (req.body.location) event.location = req.body.location;
        if (req.body.description) event.description = req.body.description;
        if (req.body.sport) event.sport = req.body.sport;
        try {
            await event.save();
            res.json(event);
        }
        catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }


        res.json({ message: 'Event updated successfully.' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
