import { useWeb3React } from '@web3-react/core'
import { Modal, Toast } from 'antd-mobile'
import classnames from 'classnames'
import React, { forwardRef, useImperativeHandle, useState } from 'react'

import copy from '@/app/utils/copy'
import storage from '@/app/utils/storage'
import { getShortenAddress2 } from '@/app/utils/tool'
import Icon from '@/assets/icons'

import css from './logoutDialog.module.stylus'

export interface ILogoutDialog {
    show(): void
    hide(): void
}

const LongDialog = forwardRef((props, ref) => {
    const [LogoutDialogOpen, setLogoutDialogOpen] = useState(false)
    const { account, deactivate, chainId } = useWeb3React()

    useImperativeHandle(ref, () => ({
        show: () => {
            setLogoutDialogOpen(true)
        },
        hide: () => {
            setLogoutDialogOpen(false)
        }
    }))

    return account ? (
        <>
            <Modal
                visible={LogoutDialogOpen}
                // onCancel={() => setLogoutDialogOpen(false)}
                // footer={null}
                // wrapClassName={classnames('customizeDialog', css.dialog)}
                // centered
                // destroyOnClose={true}
                // closable={false}
                // width={440}
            >
                <div className={css.modalTitle}>
                    <div className={css.title}>Account</div>
                    <span onClick={() => setLogoutDialogOpen(false)}>
                        <Icon name="close" />
                    </span>
                </div>
                <div className={css.modalMain}>
                    <div className={css.title}>Connected with MetaMask</div>
                    <div className={css.content}>
                        <img src={require('./img/matemask.png')} alt="" />
                        <div className={css.text}>{getShortenAddress2(account)}</div>
                        <span onClick={() => copy(account)}>
                            <Icon name="copy" />
                        </span>
                    </div>
                    <div className={css.info}>
                        <div className={css.text}>Total Balance</div>
                        <div className={css.num}>$0.11111FRA</div>
                    </div>
                </div>
                <div
                    className={css.modalBtn}
                    onClick={() => {
                        deactivate()
                        storage.set('isLogout', true)
                        setLogoutDialogOpen(false)
                        Toast.show({
                            icon: 'success',
                            content: 'You are successfully logged out.'
                        })
                    }}
                >
                    Logout
                </div>
            </Modal>
        </>
    ) : null
})

export default LongDialog
