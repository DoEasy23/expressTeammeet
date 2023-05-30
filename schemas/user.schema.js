const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    location: String,
    bio: {
        type: String,
        default: 'Bio is empty'
    },
    avatarUrl: {
        type: String,
        default: ''
    },
    birthday: Date,
    joinedEvents: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
        default: []
    },
    preferredSports: {
        type: String,
        default: ''
    }
});


module.exports = mongoose.model('User', UserSchema);
