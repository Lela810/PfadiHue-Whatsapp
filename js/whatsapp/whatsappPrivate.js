const { createActivity } = require('../db.js')


async function whatsappPrivate(message) {

    const chat = await message.getChat()

    //createActivity(chat.id)

}

module.exports = { whatsappPrivate };