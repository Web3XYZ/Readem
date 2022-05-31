import * as ethers from 'ethers'

import abi from '@/abi/erc20Abi.json'
import Contract from '@/app/connectors/contract'

export default async (address: string, account?: string | null | undefined): Promise<ethers.ethers.Contract> => {
    return account ? await Contract(address, abi, account) : await Contract(address, abi)
}
