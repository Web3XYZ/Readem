import { NoBscProviderError } from '@binance-chain/bsc-connector'
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core'
import { NoEthereumProviderError, UserRejectedRequestError as UserRejectedRequestErrorInjected } from '@web3-react/injected-connector'
import { UserRejectedRequestError as UserRejectedRequestErrorWalletConnect, WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { Toast } from 'antd-mobile'
import classnames from 'classnames'
import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { injected, walletConnect } from '@/app/connectors/injected'
import setupNetwork from '@/app/connectors/setupNetwork'
import { useEagerConnect, useInactiveListener } from '@/app/hooks/web3'
import * as config from '@/app/utils/config'
import storage from '@/app/utils/storage'
import { getShortenAddress } from '@/app/utils/tool'
import { isMobile } from '@/app/utils/tool'

import LogoutDialog, { ILogoutDialog } from '../LogoutDialog'
import styleMax from './connectWallet.max.module.stylus'
import style from './connectWallet.module.stylus'

interface IProps {
    max?: boolean
    className?: string
    onSign(): void
}

export default (props: IProps): React.ReactElement | null => {
    const { t } = useTranslation()
    const LogoutDialogRef = useRef<ILogoutDialog>()
    const { account, activate, library, error, chainId } = useWeb3React()
    const triedEager = useEagerConnect()
    const { max, className } = props

    useInactiveListener(!triedEager)

    useEffect(() => {
        if (chainId && !(chainId === Number(config.chainId)) && error) {
            Toast.show({
                icon: 'fail',
                content: error.message
            })
        }
    }, [chainId, error])

    useEffect(() => {
        if (account) {
            storage.set('isLogout', false)
        }
    }, [account])

    const login = async (): Promise<void> => {
        const connector = isMobile ? walletConnect : injected
        await activate(connector, async e => {
            if (e instanceof UnsupportedChainIdError) {
                const hasSetup = await setupNetwork()
                if (hasSetup) {
                    activate(connector)
                    storage.set('isLogout', false)
                }
            } else {
                let message = ''
                let description = ''
                if (error instanceof NoEthereumProviderError || error instanceof NoBscProviderError) {
                    message = 'Provider Error'
                    description = 'No provider was found'
                } else if (e instanceof UserRejectedRequestErrorInjected || e instanceof UserRejectedRequestErrorWalletConnect) {
                    if (connector instanceof WalletConnectConnector) {
                        const walletConnector = connector as WalletConnectConnector
                        walletConnector.walletConnectProvider = undefined
                    }
                    message = 'Authorization Error'
                    description = 'Please authorize to access your account'
                } else {
                    message = e.name
                    description = e.message
                }
                Toast.show({
                    icon: 'fail',
                    content: message
                })
                storage.set('isLogout', true)
            }
        })
    }

    const userDom = account ? (
        <div
            className={classnames(max ? styleMax.connect : style.connect, max ? null : style.active)}
            // onClick={() => LogoutDialogRef.current?.show()}
            onClick={() => props.onSign()}
        >
            Bind {getShortenAddress(account)}
        </div>
    ) : (
        <div className={max ? styleMax.connect : style.connect} onClick={() => login()}>
            {t('connectNow')}
        </div>
    )

    return (
        <>
            <div className={classnames(max ? styleMax.connectWalletMax : style.connectWallet, className)}>{userDom}</div>
            <LogoutDialog ref={LogoutDialogRef} />
        </>
    )
}
