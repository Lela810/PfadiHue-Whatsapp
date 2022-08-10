const { createUser } = require('../db.js')


async function whatsappPrivate(message) {

    const chat = await message.getChat()

    createUser(chat.id)

}

module.exports = { whatsappPrivate };