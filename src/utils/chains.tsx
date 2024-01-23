import { Chain } from 'wagmi';

export const KlaytnBaobab = {
  id: 1001,
  name: 'Klaytn Baobab',
  network: 'Klaytn Baobab',
  nativeCurrency: {
    decimals: 18,
    name: 'KLAY',
    symbol: 'KLAY',
  },
  rpcUrls: {
    public: { http: ['https://public-en-baobab.klaytn.net'] },
    default: { http: ['https://public-en-baobab.klaytn.net'] },
  },
  blockExplorers: {
    etherscan: { name: 'Klatyn Scan', url: 'https://baobab.scope.klaytn.com' },
    default: { name: 'Klatyn Scan', url: 'https://baobab.scope.klaytn.com' },
  },

} as const satisfies Chain