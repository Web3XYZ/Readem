import { useWeb3React } from '@web3-react/core'
import { Button, Input, Popup, SpinLoading, Toast } from 'antd-mobile'
import classnames from 'classnames'
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import * as basicAction from '@/app/actions/baseAction'
import { IRootState } from '@/app/reducers/RootState'
import { postTokenWithdraw } from '@/app/service/nftServer'
import { filterInput } from '@/app/utils/tool'
import Icon from '@/assets/icons'

import css from './receive.module.stylus'

const options = ['Matic', 'RDM']

export default (): React.ReactElement => {
    const { account, chainId } = useWeb3React()
    const [visibleSelect, setVisibleSelect] = useState(false)
    const [visibleConfirm, setVisibleConfirm] = useState(false)
    const [value, setValue] = useState('0')
    const [curSelect, setCurSelect] = useState<string>('Matic')
    const { userInfo } = useSelector((store: IRootState) => store.base)
    const [loading, setLoading] = useState(false)
    const dispatch = useDispatch()

    const onSelect = (i: string): void => {
        setCurSelect(i)
        setVisibleSelect(false)
    }

    const onWithdraw = async (): Promise<void> => {
        if (!Number(value) || !chainId) return
        setLoading(true)
        const res = await postTokenWithdraw(chainId, Number(value))
        if (res.data.code === 0) {
            Toast.show({
                icon: 'success'
            })
            await dispatch(basicAction.getUserInfo())
            setLoading(false)
        } else {
            Toast.show({
                icon: 'error',
                content: res.data.message
            })
            setLoading(false)
        }
        setVisibleConfirm(false)
    }

    return (
        <>
            <div className={css.receive}>
                <div className={css.content}>
                    <div className="lt-select" onClick={() => setVisibleSelect(true)}>
                        <img src={`./img/${curSelect.toLowerCase()}.png`} alt="" />
                        <span>{curSelect}</span>
                        <Icon name="arrow" />
                    </div>
                    {account ? (
                        <>
                            <div className={css.main}>
                                <Input className={css.input} onChange={e => setValue(filterInput(e))} value={value} />
                                <div className={css.balance}>Balance: {userInfo.score}</div>
                            </div>
                            <div
                                className={classnames(css.sendBtn, { [css.disabled]: !Number(value) || Number(value) > Number(userInfo.score) })}
                                onClick={() => setVisibleConfirm(true)}
                            >
                                <Icon className={css.icon} name="arrowBold" />
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
            <Popup
                visible={visibleConfirm}
                onMaskClick={() => {
                    setVisibleConfirm(false)
                }}
                position="bottom"
                className="popup"
                bodyStyle={{ width: 'calc(100vw - 30px)' }}
            >
                <div className="popupTitle">Tip</div>
                <div className="popupWrap">
                    <div className="txt">Confirm Withdraw?</div>
                </div>
                <Button
                    loading={loading}
                    loadingIcon={<SpinLoading style={{ '--size': '24px', '--color': '#000' }} />}
                    className="popupSubmitBtn"
                    onClick={() => onWithdraw()}
                >
                    <span>Confirm</span>
                </Button>
            </Popup>
        </>
    )
}
