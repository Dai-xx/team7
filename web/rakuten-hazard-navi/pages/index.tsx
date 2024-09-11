import Image from 'next/image';
import localFont from 'next/font/local';
import GoogleMapsApi from '@/components/GoogleMapsApi';
import useSWR from 'swr';
import axios from 'axios';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

const center = {
  lat: 35.4550426,
  lon: 139.6312741,
};

export default function Home() {
  return (
    <main>
      <GoogleMapsApi lat={center.lat} lon={center.lon} mapType={0} />
    </main>
  );
}
