import { blockExplorerUrls, chainId, chainName, rpcUrls } from '@/app/utils/config'

export default async (): Promise<boolean> => {
    const provider = window.ethereum
    if (provider) {
        try {
            await provider.request({
                method: 'wallet_addEthereumChain',
                params: [
                    {
                        chainId: `0x${parseInt(chainId, 10).toString(16)}`,
                        chainName: `${chainName}`,
                        nativeCurrency: {
                            name: 'FRA',
                            symbol: 'fra',
                            decimals: 18
                        },
                        rpcUrls,
                        blockExplorerUrls
                    }
                ]
            })
            return true
        } catch (error) {
            console.error('Failed to setup the network in Metamask:', error)
            return false
        }
    } else {
        console.error("Can't setup the Findora network on metamask because window.ethereum is undefined")
        return false
    }
}
