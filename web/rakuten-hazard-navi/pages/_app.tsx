import '@/styles/globals.css';
import { APIProvider } from '@vis.gl/react-google-maps';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <APIProvider apiKey="AIzaSyAvwRzItbKjCTwc9yl9BJmpU_xzLgCi6Xg">
      <Component {...pageProps} />
    </APIProvider>
  );
}
