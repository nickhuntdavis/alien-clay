# Spawn Prawn relay

The multiplayer race needs this small relay running somewhere on the internet. It has no dependencies:
plain Node 18 or newer. Players type its address into MULTIPLAYER RACE > Relay server.

## Run it on Render (free)

1. Go to render.com and sign in with GitHub.
2. New > Web Service, pick this repository.
3. Root directory: `storm-directive/server`. Build command: leave empty. Start command: `node relay.js`.
4. Instance type: Free. Create.
5. When it's live, copy its address (for example `spawn-prawn-relay.onrender.com`) into the game's Relay server box.

The free tier sleeps after about 15 minutes idle; the first connection after that takes up to a minute.

## Run it on your own computer (same Wi-Fi)

    cd storm-directive/server
    node relay.js

Then enter your computer's local address in the game, for example `192.168.1.20:8787`.

Opening the address in a browser shows how many rooms and swimmers are live.
