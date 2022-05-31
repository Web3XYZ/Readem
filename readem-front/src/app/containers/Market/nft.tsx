import { Button, Image, Popup, SpinLoading, Toast } from 'antd-mobile'
import classnames from 'classnames'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'

import NFTImage from '@/app/components/Image'
import Layout from '@/app/components/Layout'
import * as nftServer from '@/app/service/nftServer'
import Icon from '@/assets/icons'

import css from './nft.module.stylus'

const auctionOptions = ['Auction', 'Done']

export interface CSSPropertiesWithVars extends React.CSSProperties {
    '--item-height': string
}

export default (): React.ReactElement => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [auction, setAuction] = useState<nftServer.IGetNftAuctionResponse>()
    const [visibleSelect, setVisibleSelect] = useState(false)
    const [auctionOption, setAuctionOption] = useState<string>('Auction')
    const [options, setOptions] = useState<string[]>()
    const [visibleConfirm, setVisibleConfirm] = useState(false)
    const listRef = useRef<HTMLDivElement>(null)
    const [loading, setLoading] = useState(false)
    const [item, setItem] = useState<nftServer.IGetNftAuctionResponseItem>()

    const fetchNftAuction = async (): Promise<void> => {
        const res = await nftServer.getNftAuction({ done: auctionOption === 'Auction' ? 0 : 1 })
        if (res.data.code === 0) {
            setAuction(res.data.data)
        }
    }

    const postAuctionBib = async (id: number): Promise<void> => {
        const res = await nftServer.postNftAuctionBib({ auction_id: id, bid_price: 101 })
        if (res.data.code !== 0) {
            Toast.show({
                icon: 'error',
                content: res.data.data
            })
        } else {
            Toast.show({
                icon: 'success',
                content: res.data.data
            })
            fetchNftAuction()
        }
    }

    const showMySelect = (a: string[], t: string): void => {
        setVisibleSelect(true)
        setOptions(a)
    }

    const onSelect = (i: string): void => {
        setAuctionOption(i)
        setVisibleSelect(false)
    }

    const onSubmit = async (): Promise<void> => {
        if (!item) return
        setLoading(true)
        await postAuctionBib(item.id)
        setLoading(false)
        setVisibleConfirm(false)
    }

    useEffect(() => {
        fetchNftAuction()
    }, [])

    useEffect(() => {
        if (!auction) return
        fetchNftAuction()
        return () => {
            setAuction(undefined)
        }
    }, [auctionOption])

    return (
        <Layout className={css.nft}>
            <div className={classnames('wrap', css.main, css.market)}>
                <div className="lt-filterBar" ref={listRef}>
                    <div className="lt-select" onClick={() => showMySelect(auctionOptions, 'Auction')}>
                        <span>{auctionOption}</span>
                        <Icon name="arrow" />
                    </div>
                </div>
                {auction?.items ? (
                    <div
                        className={css.list}
                        style={
                            {
                                height: 'calc(100vh - 208px)',
                                '--item-height': `${listRef.current ? listRef.current.offsetWidth / 2 - 5 : 0}px`
                            } as CSSPropertiesWithVars
                        }
                    >
                        {auction.items.map((item, index) => (
                            <div className={css.item} key={item.id}>
                                <div className={css.itemMain}>
                                    <div className={css.itemTitle}>#{item.user_nft_id}</div>
                                    <NFTImage
                                        className={css.itemImg}
                                        style={{
                                            '--height': `${listRef.current ? listRef.current.offsetWidth / 2 - 25 : 0}px`,
                                            '--width': `${listRef.current ? listRef.current.offsetWidth / 2 - 25 : 0}px`
                                        }}
                                        gene={item.owl.gene}
                                        onClick={() => navigate(`/NFTDetail/${item.user_nft_id}?type=market`)}
                                    />
                                    <div className={css.itemMint}>
                                        <div>Mint:{item.id}</div>
                                        <div>Lv1</div>
                                    </div>
                                    <div className={css.progressBar}>
                                        <div style={{ width: '40%' }} />
                                    </div>
                                    <div className={css.itemPrice}>
                                        <div className={css.price}>
                                            <img src="./img/matic.png" alt="" />
                                            <span>{item.base_price}</span>
                                        </div>
                                        <div
                                            className={css.btn}
                                            onClick={() => {
                                                setItem(item)
                                                setVisibleConfirm(true)
                                            }}
                                        >
                                            BUY
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="noData">No Data</div>
                )}
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
                {item ? (
                    <>
                        <div className="popupTitle">{t('marks.buy')}</div>
                        <div className="popupNFTConfirm">
                            <NFTImage gene={item.owl.gene} className="img" />
                            <div className="info">
                                <div className="title">#{item?.user_nft_id}</div>
                                <div className="subTitle">
                                    <div>Brave</div>
                                    <div>Hatch 2/7</div>
                                </div>
                                <div className="progressBar">
                                    <div style={{ width: '40%' }} />
                                </div>
                                <div className="subTitle">
                                    <div>Patience</div>
                                    <div>20%</div>
                                </div>
                                <div className="btn">Legend</div>
                                <div className="price">
                                    <img src="./img/matic.png" />
                                    <span>{item.base_price}</span>
                                </div>
                            </div>
                        </div>
                        <Button
                            loading={loading}
                            loadingIcon={<SpinLoading style={{ '--size': '24px', '--color': '#000' }} />}
                            className="popupSubmitBtn"
                            onClick={() => onSubmit()}
                        >
                            <span>{t('common.confirm')}</span>
                        </Button>
                    </>
                ) : null}
            </Popup>
        </Layout>
    )
}
