async function whatsappGroup(message) {

    const chat = await message.getChat()
    const mentions = await message.getMentions();

    for (const contact of mentions) {
        if (contact.isMe) {
            await chat.sendMessage("message");
        }
    }

}

module.exports = { whatsappGroup };