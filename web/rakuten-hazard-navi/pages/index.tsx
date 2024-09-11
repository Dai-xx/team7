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

export default function Home() {
  return (
    <main>
      <GoogleMapsApi />
      {/* <div className="relative h-[100px] w-[100px]">
        <Image
          src={orverlyaImage}
          alt=""
          style={{ objectFit: 'cover' }}
          height={100}
          width={100}
        />
      </div> */}
    </main>
  );
}
