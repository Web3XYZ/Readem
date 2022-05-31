import { useWeb3React } from '@web3-react/core'
import { Popup } from 'antd-mobile'
import dayjs from 'dayjs'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import ConnectWallet from '@/app/components/ConnectWallet'
import { IRootState } from '@/app/reducers/RootState'
import { getTokenHistory, getWalletAddress, IGetTokenHistoryResponseItem, postWalletAddress } from '@/app/service/nftServer'
import { getShortenAddress } from '@/app/utils/tool'
import Icon from '@/assets/icons'

import Receive from './receive'
import Send from './send'
import css from './wallet.module.stylus'

export default (): React.ReactElement => {
    const { t } = useTranslation()
    const [sendVisible, setSendVisible] = useState(false)
    const [receiveVisible, setReceiveVisible] = useState(false)
    const { account, library, chainId } = useWeb3React()
    const [isBind, setIsBind] = useState(false)
    const { userInfo } = useSelector((store: IRootState) => store.base)
    const [historyList, setHistoryList] = useState<IGetTokenHistoryResponseItem[]>()
    const fetchWalletAddress = async (): Promise<void> => {
        const res = await getWalletAddress()
        if (res.data.code === 0 && res.data.data.address) {
            setIsBind(true)
        }
    }
    const fetchTokenHistory = async (): Promise<void> => {
        if (!chainId) return
        const res = await getTokenHistory(chainId, { page: 0, size: 50 })
        if (res.data.code === 0 && res.data.data.items) {
            setHistoryList(res.data.data.items)
        }
    }

    const onSign = async (): Promise<void> => {
        if (!userInfo.email || !chainId || !account) return
        const sign = await library.eth.personal.sign(`email=${userInfo.email},address=${account},chain_id=${chainId}`, account)
        const res = await postWalletAddress({
            address: account,
            chain_id: chainId,
            email: userInfo.email,
            sign
        })
        if (res.data.code === 0) {
            fetchWalletAddress()
        }
    }

    useEffect(() => {
        if (isBind) {
            fetchTokenHistory()
        }
    }, [isBind])

    useEffect(() => {
        fetchWalletAddress()
    }, [])

    return (
        <>
            {account && isBind ? (
                <>
                    <div className="title">{t('common.wallet')}</div>
                    <div className={css.wallet}>
                        <div className={css.balance}>
                            <span>$</span>
                            <em>18,202.63</em>
                        </div>
                        <div className={css.btnWrap}>
                            <div className={css.btn} onClick={() => setSendVisible(true)}>
                                <Icon className={css.icon} name="send" />
                            </div>
                            <div className={css.btn} onClick={() => setReceiveVisible(true)}>
                                <Icon className={css.icon} name="receive" />
                            </div>
                        </div>
                        <div className={css.tokenList}>
                            <div className={css.item}>
                                <img src="./img/matic.png" alt="" />
                                <div className={css.token}>
                                    <div className={css.name}>Matic</div>
                                    <div className={css.num}>
                                        <div>0.0002BTC</div>
                                        <span>$1111</span>
                                    </div>
                                </div>
                            </div>
                            <div className={css.item}>
                                <img src="./img/rdm.png" alt="" />
                                <div className={css.token}>
                                    <div className={css.name}>RDM</div>
                                    <div className={css.num}>
                                        <div>0.0002BTC</div>
                                        <span>$1111</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={css.record}>
                            <div className={css.title}>{t('common.activity')}</div>
                            <div className={css.list}>
                                {historyList?.map(item => (
                                    <div className={css.item} key={item.id}>
                                        <div className={css.img}>
                                            <Icon className={css.icon} name={item.history_type === 'withdraw' ? 'up' : 'down'} />
                                        </div>
                                        <div className={css.info}>
                                            <div className={css.amountType}>
                                                <div className={css.type}>{item.history_type}</div>
                                                <div className={css.amount}>
                                                    {item.value}
                                                    {item.symbol}
                                                </div>
                                            </div>
                                            <div className={css.timeWrap}>
                                                <div className={css.from}>
                                                    From <span>{getShortenAddress(item.from)}</span> to <span>{getShortenAddress(item.to)}</span>
                                                </div>
                                                <div className={css.time}>{dayjs(item.updated_at).format('DD/MM/YYYY')}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <div className="title">{t('common.connectWallet')}</div>
                    <ConnectWallet onSign={() => onSign()} />
                </>
            )}
            <Popup visible={sendVisible} position="bottom" bodyStyle={{ width: '100vw', height: '100%' }} className="searchPopup">
                <div style={{ padding: '15px' }}>
                    <div className="close" onClick={() => setSendVisible(false)}>
                        {t('common.close')}
                    </div>
                    <div className="title">{t('common.send')}</div>
                    <Send />
                </div>
            </Popup>
            <Popup visible={receiveVisible} position="bottom" bodyStyle={{ width: '100vw', height: '100%' }} className="searchPopup">
                <div style={{ padding: '15px' }}>
                    <div className="close" onClick={() => setReceiveVisible(false)}>
                        {t('common.close')}
                    </div>
                    <div className="title">{t('common.receive')}</div>
                    <Receive />
                </div>
            </Popup>
        </>
    )
}
