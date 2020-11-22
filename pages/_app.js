import dynamic from 'next/dynamic';
import '../styles/globals.css';
import Layout from '../components/Layout'

const DynamicComponentWithNoSSR = dynamic(() =>
  import('../components/Wrapper'),
  { ssr: false }
);

function MyApp({ Component, pageProps }) {
  return <DynamicComponentWithNoSSR>
    <Layout>
      <Component {...pageProps} />
    </Layout>
  </DynamicComponentWithNoSSR>;
}

export default MyApp
