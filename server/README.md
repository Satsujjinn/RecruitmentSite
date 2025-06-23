# TalentScout Backend

This directory contains the Express server and API routes for TalentScout.

## Development

```bash
cp .env.example .env
npm install
npm run dev
```

The server connects to MongoDB using the `MONGO_URI` environment variable. Set `JWT_SECRET` to sign authentication tokens. User avatars can be uploaded to an Amazon S3 bucket when AWS credentials and `AWS_BUCKET_NAME` are set.

## WebSocket API

Socket.IO is used for real-time chat. Connect to `ws://localhost:3001/socket.io` (replace host and port as needed) and optionally provide `userId` and `roomId` as query parameters. Clients can emit a `join` event with a room id to subscribe and send `message` events with `{ roomId, text, senderId }` to chat. All messages are broadcast to the room and persisted in MongoDB.
