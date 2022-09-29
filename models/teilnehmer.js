const mongoose = require("mongoose")

const teilnehmerSchema = new mongoose.Schema({
    telephone: {
        type: Number,
        unique: true,
        index: true
    },
    scoutname: {
        type: String,
        index: true,
        required: false
    },
    pushname: {
        type: String,
        required: false
    },
    chatid: {
        type: Object,
        required: false
    }
})





module.exports = mongoose.model('teilnehmer', teilnehmerSchema)