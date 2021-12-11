# media_request_bot
Media request queue for Discord, perfect for streamers

## How it works
1. A meme / video is posted to a channel
2. The bot mirrors the meme / video to a hidden channel, where mods can then decide to either allow it or deny it. Once it is mirrored, the meme in the public channel is deleted.
3. When mods deny it, it's just deleted, but when it's accepted its then mirrored to another hidden channel, where the streamer can go through the accepted memes.
4. Once the video / meme has been shown on stream, the streamer can click a button to delete it from the channel.

## Setup
- Create an application with a bot on the Discord developer portal to obtain a bot-token and the bots UID
- Setup the request, approval and accepted channels on your Discord
- Note down the channel IDs by enabling Discord developer mode, right clicking the desired channel and selecting 'Copy ID'
- Invite the bot by inserting your bots UUID into the following link
- Install the latest stable nodejs version
- Download the current `bot.js` file
- Run the bot with nodejs and pass `bot_token`, `bot_uid`, `request_channel`, `approval_channel` and `accepted_channel` as environment variables

## Planned / Todo
- [ ] Post accepted memes to a public channel as well
- [ ] Dynamic loading of past messages while the bot was offline instead of a fixed amount
- [ ] Make setup easier by providing easy commands to reassign the channel / assing channels at setup --> Requires storage
  - [ ] Make a hosted version so people don't have to self-host
