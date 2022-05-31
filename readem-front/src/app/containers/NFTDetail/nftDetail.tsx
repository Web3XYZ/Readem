import { Button, Image, InfiniteScroll, Popup, SpinLoading, Toast } from 'antd-mobile'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import Header from '@/app/components/Header'
import NFTImage from '@/app/components/Image'
import Layout from '@/app/components/Layout'
import * as nftServer from '@/app/service/nftServer'
import Icon from '@/assets/icons'

import css from './nftDetail.module.stylus'

export default (): React.ReactElement => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [data, setData] = useState<nftServer.IGetNFTByIdResponse>()
    const [loading, setLoading] = useState(false)
    const params = useParams<{ ID: string }>()
    const [search] = useSearchParams()
    const [visibleConfirm, setVisibleConfirm] = useState(false)

    const onSubmit = async (): Promise<void> => {
        if (!data) return
        setLoading(true)
        await postAuctionBib(data.id)
        setLoading(false)
        setVisibleConfirm(false)
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
            navigate(`/NFTDetail/${params.ID}?type=nft`, { replace: true })
        }
    }

    useEffect(() => {
        const fetch = async (): Promise<void> => {
            if (params.ID) {
                const res = await nftServer.getNFTById(params.ID)
                if (res.data.code === 0) {
                    setData(res.data.data)
                }
            }
        }
        fetch()
        return () => {
            setData(undefined)
        }
    }, [params])

    return data ? (
        <Layout className={css.nftDetail} type={1}>
            <Header
                className={css.header}
                title="Details"
                right={
                    <div className={css.btn}>
                        <Icon className={css.icon} name="share" />
                    </div>
                }
            />
            <div className={css.box}>
                <NFTImage gene={data.gene} className={css.img} />
            </div>
            <div className={css.info}>
                <div className={css.title}>#{data.id}</div>
                <div className={css.subTitle}>
                    <div>Brave</div>
                    <div>Hatch 2/7</div>
                </div>
                <div className={css.progressBar}>
                    <div style={{ width: '40%' }} />
                </div>
                <div className={css.subTitle}>
                    <div>Patience</div>
                    <div>20%</div>
                </div>
            </div>
            <div className={css.attr}>
                <div className={css.title}>Attribures</div>
                <div className={css.callage}>
                    <div className={css.item}>
                        <div className={css.tit}>Intelligence</div>
                        <div className={css.num}>{data.intelligence}</div>
                    </div>
                    <div className={css.item}>
                        <div className={css.tit}>Lucky</div>
                        <div className={css.num}>{data.lucky}</div>
                    </div>
                    <div className={css.item}>
                        <div className={css.tit}>Brave</div>
                        <div className={css.num}>{data.brave}</div>
                    </div>
                </div>
                <div className={css.title}>Properties</div>
                <div className={css.callage}>
                    <div className={css.item}>
                        <div className={css.tit}>Intelligence</div>
                        <div className={css.num}>{data.intelligence}</div>
                    </div>
                </div>
            </div>
            {search.get('type') === 'market' ? (
                <Button className={css.submit} loading={loading} onClick={() => setVisibleConfirm(true)}>
                    <span className={css.txt}>Buy</span>
                    <img src="./img/matic.png" />
                    <span className={css.price}>{data.earn_base}</span>
                </Button>
            ) : (
                <Button className={css.submit} loading={loading}>
                    <span className={css.txt}>Manage</span>
                </Button>
            )}
            <Popup
                visible={visibleConfirm}
                onMaskClick={() => {
                    setVisibleConfirm(false)
                }}
                position="bottom"
                className="popup"
                bodyStyle={{ width: 'calc(100vw - 30px)' }}
            >
                {data ? (
                    <>
                        <div className="popupTitle">{t('marks.buy')}</div>
                        <div className="popupNFTConfirm">
                            <NFTImage gene={data.gene} className="img" />
                            <div className="info">
                                <div className="title">#{data?.id}</div>
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
                                    <span>{data?.earn_base}</span>
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
    ) : (
        <div className="lt-loading">
            <SpinLoading color={'#00FF85'} />
        </div>
    )
}
