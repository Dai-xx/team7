import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { lat1, lon1, lat2, lon2, lat3, lon3 } = req.query;
  console.log('dataInApi', lat1, lon1);

  // Flask APIのエンドポイント
  // const flaskApiUrl = `https://shelter-13ps.onrender.com/api/shelter/35.38904996691165/139.5703125/35.4606699514953/139.658203125/35.4550426/139.6312741`;
  const flaskApiUrl = `https://shelter-13ps.onrender.com/api/shelter/${lat1}/${lon1}/${lat2}/${lon2}/${lat3}/${lon3}`;

  try {
    // axiosでFlask APIを呼び出す
    const response = await axios.get(flaskApiUrl);
    const data = response.data;

    // Next.jsのAPIレスポンスとして返す
    res.status(200).json(data);
  } catch (error) {
    console.error('Error calling Flask API:', error);
    res.status(500).json({ message: 'Error fetching data from Flask API' });
  }
}
