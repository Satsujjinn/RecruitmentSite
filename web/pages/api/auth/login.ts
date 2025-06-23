import type { NextApiRequest, NextApiResponse } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

  if (!API_URL) {
    res.status(500).json({ message: 'API URL not configured' });
    return;
  }

  try {
    const backendRes = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    const body = await backendRes.text();
    res.status(backendRes.status);
    res.setHeader(
      'Content-Type',
      backendRes.headers.get('content-type') || 'application/json'
    );
    res.send(body);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}
