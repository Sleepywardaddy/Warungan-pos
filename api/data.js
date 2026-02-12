import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const data = await kv.get('warungan_data');
      return res.status(200).json(data || {});
    } else if (req.method === 'POST') {
      await kv.set('warungan_data', req.body);
      return res.status(200).json({ success: true });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
