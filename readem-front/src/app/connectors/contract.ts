import { Contract, ContractInterface, providers, Signer } from 'ethers'

let provider: providers.JsonRpcProvider

const connect = async (): Promise<any> => {
    return window.ethereum?.request({ method: 'eth_requestAccounts' }).catch((error: any) => {
        if (error.code === 4001) {
            // EIP-1193 userRejectedRequest error
            console.error('Please connect to MetaMask.')
        } else {
            console.error(error)
        }
    })
}

const setProvider = async (): Promise<void> => {
    if (window.ethereum) {
        await connect()
        provider = new providers.Web3Provider(window.ethereum)
    } else if (window.web3) {
        provider = new providers.Web3Provider(window.web3.currentProvider)
    } else {
        throw new Error("can't find default provider")
    }
}

const getProvider = (url?: string): Promise<providers.JsonRpcProvider> => {
    return new Promise(async (resolve, _reject) => {
        if (url) {
            resolve(new providers.JsonRpcProvider(url))
        } else if (provider) {
            resolve(provider)
        } else {
            await setProvider()
            resolve(provider)
        }
    })
}

function getSigner(provider: providers.JsonRpcProvider, account: string): Signer {
    return provider.getSigner(account).connectUnchecked()
}

window.addEventListener('load', async () => {
    setProvider()
})

export default async (address: string, abi: ContractInterface, account?: string): Promise<Contract> => {
    const provider = await getProvider()
    if (account) return new Contract(address, abi, getSigner(provider, account))
    return new Contract(address, abi, provider)
}
