
const express = require('express');
const router = express.Router();
const JoinRequest = require('../schemas/join.request.schema');
const Event = require('../schemas/event.schema');

// Etkinliklere katılma talebi gönderme
router.post('/', async (req, res) => {
    try {
        const { userId, eventId, requestUserName } = req.body;
        console.log(userId, eventId);
        console.log(req.body)

        // Kullanıcının var olan bir talebi olup olmadığını kontrol etmek için JoinRequest modelini sorgulayın
        const existingRequest = await JoinRequest.findOne({ user: userId, event: eventId });

        if (existingRequest) {
            return res.status(400).json({ message: 'You have already sent a join request for this event.' });
        }

        // Yeni JoinRequest nesnesi oluşturun
        const joinRequest = new JoinRequest({ user: userId, event: eventId, requestUserName: requestUserName });

        // JoinRequest'i kaydedin
        await joinRequest.save();

        res.json({ message: 'Join request sent successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

router.get('/', async (req, res) => {
    try {
        const joinRequests = await JoinRequest.find();
        res.json(joinRequests);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// Etkinliklerin statüsünü değiştirme

router.put('/:id', async (req, res) => {
    try {
        const joinRequest = await JoinRequest.findById(req.params.id);

        if (!joinRequest) {
            return res.status(404).json({ message: 'Join request not found.' });
        }

        if (req.body.status) joinRequest.status = req.body.status;

        await joinRequest.save();

        res.json({ message: 'Join request updated successfully.' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
}
);
module.exports = router;
