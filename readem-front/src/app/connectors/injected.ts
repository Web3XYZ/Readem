import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'

import { chainId, rpcUrls, supportedChainIds } from '@/app/utils/config'

export const walletConnect = new WalletConnectConnector({
    rpc: { [chainId]: rpcUrls[0] },
    qrcode: true
})

export const injected = new InjectedConnector({
    supportedChainIds
})
