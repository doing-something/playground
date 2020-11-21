import dynamic from 'next/dynamic';
import '../styles/globals.css';

const DynamicComponentWithNoSSR = dynamic(() =>
  import('../components/Wrapper'),
  { ssr: false }
);

function MyApp({ Component, pageProps }) {
  return <DynamicComponentWithNoSSR>
    <Component {...pageProps} />
  </DynamicComponentWithNoSSR>;
}

export default MyApp
