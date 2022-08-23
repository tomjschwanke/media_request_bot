# media_request_bot
Media request queue for Discord, perfect for streamers

## How it works
1. A meme / video is posted to a channel
2. The bot mirrors the meme / video to a hidden channel, where mods can then decide to either allow it or deny it. Once it is mirrored, the meme in the public channel is deleted.
3. When mods deny it, it's just deleted, but when it's accepted its then mirrored to another hidden channel, where the streamer can go through the accepted memes.
4. Once the video / meme has been shown on stream, the streamer can click a button to delete it from the channel.

#### The bot only accepts media with URLs, that means Images uploaded directly will work as they're are just a URL pointing to the image on Discords servers. Plain text messages will be deleted without going to the approval channel.

## Setup
- Create an application with a bot on the Discord developer portal to obtain a bot-token and the bots UID
- Setup the request, approval and accepted channels on your Discord
- Note down the channel IDs by enabling Discord developer mode, right clicking the desired channel and selecting 'Copy ID'
- Invite the bot by inserting your bots application client-id into the following link `https://discord.com/api/oauth2/authorize?client_id=[CLIENT_ID]&permissions=92160&scope=bot`
- Install the latest stable nodejs version
- Download the current `bot.js` file
- Run the bot with nodejs and pass `bot_token`, `bot_uid`, `request_channel`, `approval_channel` and `accepted_channel` as environment variables

## Planned / Todo
- [ ] Post accepted memes to a public channel as well
- [ ] Better error handling and explanation of errors
- [ ] Filter for URLs (eg. to only allow images directly uploaded by filtering for the domain or only images by filtering the file extension)
- [X] Dynamic loading of past messages while the bot was offline instead of a fixed amount
- [ ] Make setup easier by providing easy commands to reassign the channel / assing channels at setup --> Requires storage
  - [ ] Make a hosted version so people don't have to self-host
