import { createConfig, http } from 'wagmi'
import { bscTestnet } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

export const config = createConfig({
  chains: [bscTestnet],
  connectors: [injected()],
  transports: {
    [bscTestnet.id]: http('https://bsc-testnet.4everland.org/v1/37fa9972c1b1cd5fab542c7bdd4cde2f'),
  },
})