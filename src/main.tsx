import React from 'react'
import ReactDOM from 'react-dom/client'
import { WagmiConfig, createConfig, configureChains, } from 'wagmi'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import PageRoutes from './pages/routes.jsx'
import '@rainbow-me/rainbowkit/styles.css';
import { ChakraProvider } from '@chakra-ui/react'
import {
  RainbowKitProvider,
  lightTheme
} from '@rainbow-me/rainbowkit';
import { publicProvider } from 'wagmi/providers/public'
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  metaMaskWallet,
  trustWallet,
  injectedWallet,
  rainbowWallet,
  walletConnectWallet,
  coinbaseWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { polygonZkEvm, polygonZkEvmTestnet, goerli } from 'wagmi/chains'
import { XRPLDevnet } from './Chain.tsx'

const projectId = "dcc5faa20825eedb0f5be1ed59efcbc6";
const { chains, publicClient } = configureChains(
  [ polygonZkEvm, polygonZkEvmTestnet, XRPLDevnet, goerli],
  [
    publicProvider()
  ]
);

const connectors = connectorsForWallets([
  {
    groupName: 'Recommended',
    wallets: [
      metaMaskWallet({ projectId, chains }),
      trustWallet({ projectId, chains }),
    ]
  },
  {
    groupName: 'Others',
    wallets: [
      coinbaseWallet({ chains, 
        appName: 'Spacetar | A Community Empowering Mental Well-Being' }),
      injectedWallet({ chains }),
      rainbowWallet({ projectId, chains }),
      walletConnectWallet({ projectId, chains }),
    ],
  },
]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient
})


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChakraProvider>
    <BrowserRouter>
    <WagmiConfig config={wagmiConfig}>
    <RainbowKitProvider 
      theme={lightTheme({
        accentColor: '#1570ef',
        accentColorForeground: 'white',
        borderRadius: 'small',
        fontStack: 'system',
        overlayBlur: 'small'
      },
      )} chains={chains}>
      <PageRoutes />
      </RainbowKitProvider>
    </WagmiConfig>
    
    </BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>,
)
