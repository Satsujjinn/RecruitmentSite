# TalentScout Backend

This directory contains the Express server and API routes for TalentScout.

## Development

```bash
cp .env.example .env
npm install
npm run dev
```

The server connects to MongoDB using the `MONGO_URI` environment variable. User avatars can be uploaded to an Amazon S3 bucket when AWS credentials and `AWS_BUCKET_NAME` are set.
