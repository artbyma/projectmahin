import '../styles/globals.css';
import { Web3Provider } from '@ethersproject/providers'
import {Web3ReactProvider} from "../lib/web3wallet/core";


function getLibrary(provider, connector) {
  return new Web3Provider(provider);
}

function MyApp({ Component, pageProps }) {
  return (
      <Web3ReactProvider getLibrary={getLibrary}>
        <Component {...pageProps} />
      </Web3ReactProvider>
  )
}

export default MyApp
