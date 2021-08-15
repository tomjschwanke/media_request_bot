const { Client, Intents, MessageActionRow, MessageButton} = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

const bot_token         = process.env['bot_token'];
const bot_uid           = process.env['bot_uid'];

const request_channel   = process.env['request_channel'];
const approval_channel  = process.env['approval_channel'];
const accepted_channel  = process.env['accepted_channel'];

client.once('ready', () => {
    console.log('Ready!');
});

client.on('messageCreate', async message => {
    if(message.channelId === request_channel && message.author.id !== bot_uid) {
        if(containsURL(message.content)) {
            // Post to hidden vote channel
            messageToApproval(message);
        }else {
            message.delete().catch();
        }
    }
})

async function messageToApproval(message) {
    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('approve')
                .setLabel('Approve')
                .setStyle('SUCCESS'),
            new MessageButton()
                .setCustomId('deny')
                .setLabel('Deny')
                .setStyle('DANGER'),
        );
    await client.channels.cache.get(approval_channel).send({ content: `Media request from ${message.author}\n\n${message.content}`, components: [row]}).catch();
    message.delete().catch();
}

client.on('interactionCreate', async interaction => {
    if((interaction.channelId !== approval_channel && interaction.channelId !== accepted_channel) || !interaction.isButton()) return;
    if(interaction.customId === 'approve') {
        // approved
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('watched')
                    .setLabel('Watched')
                    .setStyle('PRIMARY'),
            );
        await client.channels.cache.get(accepted_channel).send({ content: interaction.message.content, components: [row] }).catch();
        interaction.message.delete().catch();
    }else if(interaction.customId === 'deny' || interaction.customId === 'watched') {
        // delete message if denied or watched
        interaction.message.delete().catch();
    }
})

client.login(bot_token)
    .catch(error => {
        console.error(error);
        process.exit(1);
    });

function containsURL(string) {
    const regex = new RegExp("^.*(https?:\\/\\/.+\\.\\S+)\\s?.*");
    return regex.test(string);
}