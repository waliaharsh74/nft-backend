const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    walletAddress: {
        type: String,
        unique: true,
        required: true
    },
    email: {
        type: String,
    },
    otp: {
        type: String,
    },
    time: {
        type: Date,
    },
    isVerified: {
        type: Boolean
    }



}, { timestamps: true })


const User = mongoose.model('User', userSchema)

module.exports = User