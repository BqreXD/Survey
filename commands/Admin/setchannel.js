const Discord = require('discord.js')
const Guild = require('../../models/guild')

module.exports = {
    name: 'setchannel',
    permissionError: 'You do not have permission to run this command.',
    devOnly: false,
    permissions: ['ADMINISTRATOR'],
    requiredRoles: [],
    callback: async (message, args, client) => {
        let channel = '';
        let epic = '';
        const filter = m => m.author.id === message.author.id
        message.channel.send('What channel should surveys be sent to?')
        do {
            await message.channel.send('Please reply with a valid ID or channel tag.\nYou may type \`cancel\` at any time to stop this process.')
            const entry = await message.channel.awaitMessages(filter, {
                max: 1,
                time: 60000,
                errors: ['time']
            })
            epic = entry.first().content
            channel = entry.first().guild.channels.cache.get(entry.first().content) || entry.first().mentions.channels.first()
            if (epic.toLowerCase() === 'cancel') return message.reply('Cancelled.')
        } while (!channel && epic.toLowerCase() !== 'cancel')
        await Guild.findOne({
            guildID: message.guild.id
        }, async (err, channelNew) => {
            if (err) console.error(err)
            if (!channelNew) {
                newChannel = new Guild({
                    guildID: message.guild.id,
                    channelID: channel.id,
                })

                await newChannel.save().then(async () => {
                    const epic = await Guild.findOne({
                        guildID: message.guild.id
                    })
                    message.channel.send(`I have updated the surveys channel to be ${channel}!`)
                    channel.send(`This is now the surveys channel!\nSurvey answers will be sent here!`)
                    channel.setTopic('This is a survey channel. Surveys will be sent here :)')
                }).catch(err => console.error(err));
            } else {
                const currentChannel = channelNew.channelID ? message.guild.channels.cache.get(channelNew.channelID) : ''
                if (currentChannel && channel.id === currentChannel.id) return message.reply('That\'s already the surveys channel!')
                if (currentChannel) currentChannel.setTopic('')
                Guild.updateOne({
                    guildID: message.guild.id
                }, {
                    guildID: message.guild.id,
                    channelID: channel.id,
                }, {
                    upsert: true
                }).then(async () => {
                    const epic2 = await Guild.findOne({
                        guildID: message.guild.id
                    })
                    message.channel.send(`I have updated the surveys channel to be ${channel}!`)
                    channel.send(`This is now the surveys channel!\nSurveys will be sent here!`)
                    channel.setTopic('This is a surveys channel! Surveys will be sent here :)')
                }).catch(err => console.error(err));
            }
        })
    }
}
