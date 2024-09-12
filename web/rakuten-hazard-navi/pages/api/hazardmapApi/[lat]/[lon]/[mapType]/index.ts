import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { lat, lon, mapType } = req.query;

  // Flask APIのエンドポイント
  // const flaskApiUrl = `https://hazardmap-9liw.onrender.com/api/hazard/35.4550426/139.6312741/12/0.7/0`;
  const flaskApiUrl = `https://hazardmap-9liw.onrender.com/api/hazard/${lat}/${lon}/13/0.7/${mapType}`;

  try {
    // axiosでFlask APIを呼び出す
    const response = await axios.get(flaskApiUrl);
    const data = response.data;

    // Next.jsのAPIレスポンスとして返す
    res.status(200).json({ mapType: mapType, ...data });
  } catch (error) {
    console.error('Error calling Flask API:', error);
    res.status(500).json({ message: 'Error fetching data from Flask API' });
  }
}
