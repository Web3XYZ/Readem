import { useWeb3React } from '@web3-react/core'
import { useEffect, useState } from 'react'

import storage from '@/app/utils/storage'
import { isMobile } from '@/app/utils/tool'

import { injected, walletConnect } from '../connectors/injected'

export function useEagerConnect(): boolean {
    const { activate, active } = useWeb3React()

    const [tried, setTried] = useState(false)

    useEffect(() => {
        injected.isAuthorized().then(isAuthorized => {
            if (isAuthorized && !storage.get('isLogout')) {
                activate(injected, undefined, true).catch(() => {
                    setTried(true)
                })
            } else {
                setTried(true)
            }
        })
    }, [activate])

    useEffect(() => {
        if (!tried && active) {
            setTried(true)
        }
    }, [tried, active])

    return tried
}

export function useInactiveListener(suppress = false): void {
    const { active, error, activate } = useWeb3React()

    useEffect(() => {
        const { ethereum } = window
        if (ethereum && ethereum.on && !active && !error && !suppress) {
            const handleConnect = (): void => {
                console.log("Handling 'connect' event")
                activate(injected)
            }
            const handleChainChanged = (chainId: string): void => {
                console.log("Handling 'chainChanged' event with payload", chainId)
                activate(injected)
            }
            const handleAccountsChanged = (accounts: string | any[]): void => {
                console.log("Handling 'accountsChanged' event with payload", accounts)
                if (accounts.length > 0) {
                    activate(injected)
                }
            }
            const handleNetworkChanged = (networkId: any): void => {
                console.log("Handling 'networkChanged' event with payload", networkId)
                activate(injected)
            }

            ethereum.on('connect', handleConnect)
            ethereum.on('chainChanged', handleChainChanged)
            ethereum.on('accountsChanged', handleAccountsChanged)
            ethereum.on('networkChanged', handleNetworkChanged)

            return () => {
                if (ethereum.removeListener) {
                    ethereum.removeListener('connect', handleConnect)
                    ethereum.removeListener('chainChanged', handleChainChanged)
                    ethereum.removeListener('accountsChanged', handleAccountsChanged)
                    ethereum.removeListener('networkChanged', handleNetworkChanged)
                }
            }
        }
    }, [active, error, suppress, activate])
}
