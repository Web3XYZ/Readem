import { useWeb3React } from '@web3-react/core'
import { Button, Input, Popup } from 'antd-mobile'
import QRCode from 'qrcode.react'
import React, { useEffect, useState } from 'react'

import { getTokenDepositInfo } from '@/app/service/nftServer'
import copy from '@/app/utils/copy'
import Icon from '@/assets/icons'

import css from './receive.module.stylus'

const options = ['Matic', 'RDM']

export default (): React.ReactElement => {
    const { chainId } = useWeb3React()
    const [visibleSelect, setVisibleSelect] = useState(false)
    const [curSelect, setCurSelect] = useState<string>('Matic')
    const [depositAddress, setDepositAddress] = useState('')

    const onSelect = (i: string): void => {
        setCurSelect(i)
        setVisibleSelect(false)
    }

    const fetchTokenDepositInfo = async (): Promise<void> => {
        if (!chainId) return
        const res = await getTokenDepositInfo(chainId)
        if (res.data.code === 0) {
            setDepositAddress(res.data.data.deposit_address)
        }
    }

    useEffect(() => {
        fetchTokenDepositInfo()
    }, [chainId])

    return (
        <>
            <div className={css.receive}>
                <div className={css.content}>
                    <div className="lt-select" onClick={() => setVisibleSelect(true)}>
                        <img src={`./img/${curSelect.toLowerCase()}.png`} alt="" />
                        <span>{curSelect}</span>
                        <Icon name="arrow" />
                    </div>
                    {depositAddress ? (
                        <>
                            <div className={css.main}>
                                <QRCode value={depositAddress} renderAs="canvas" />
                                <div className={css.tipTxt}>Scan address to receive payment</div>
                                <div className={css.erc20}>ERC-20</div>
                                <div className={css.address}>{depositAddress}</div>
                            </div>
                            <div className={css.copyBtn} onClick={() => copy(depositAddress)}>
                                Copy Address
                            </div>
                        </>
                    ) : null}
                </div>
            </div>
            <Popup
                visible={visibleSelect}
                onMaskClick={() => {
                    setVisibleSelect(false)
                }}
                position="bottom"
                className="popup"
                bodyStyle={{ width: 'calc(100vw - 30px)' }}
            >
                <div className="popupList">
                    {options?.map(item => (
                        <div className="item" key={item} onClick={() => onSelect(item)}>
                            {item}
                        </div>
                    ))}
                </div>
            </Popup>
        </>
    )
}
