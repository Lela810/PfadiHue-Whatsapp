async function bot(client) {

    client.on('message', async(message) => {
        const mentions = await message.getMentions();
        const chat = await message.getChat()

        for (const contact of mentions) {
            if (contact.isMe) {
                chat.sendMessage('Bitte verwende für alle Kommunikation mit mir *<< @Pfadi Hü >>*\n *1)* Zeige alle Aktivitäten\n *2)* Alle Abmeldungen für die Nächste Aktivität');
            }
        } else {

        }

    });

}
module.exports = { bot };