import './errorDialog.stylus'

import { useWeb3React } from '@web3-react/core'
import { Modal } from 'antd-mobile'
import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react'

export interface IErrorDialog {
    show(): void
    hide(): void
}

interface IProps {
    chainId: number | undefined
}

export default forwardRef((props: IProps, ref) => {
    const [errorDialogOpen, setErrorDialogOpen] = useState(false)
    useImperativeHandle(ref, () => ({
        show: () => {
            setErrorDialogOpen(true)
        },
        hide: () => {
            setErrorDialogOpen(false)
        }
    }))

    return (
        <>
            <Modal
                visible={errorDialogOpen}
                // onCancel={() => setErrorDialogOpen(false)}
                // footer={null}
                // wrapClassName="errorDialog"
                // centered
                // destroyOnClose={true}
                // closable={false}
            >
                <div className="modalTitle">
                    <em onClick={() => setErrorDialogOpen(false)}>x</em>
                </div>
                <div className="modalMain error">
                    <div className="title">Connect network</div>
                    <div className="text">Please switch to BSC Mainnet</div>
                </div>
            </Modal>
        </>
    )
})
