import { Image, Skeleton, Toast } from 'antd-mobile'
import BigNumber from 'bignumber.js'
import classnames from 'classnames'
import dayjs from 'dayjs'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import CountUp from 'react-countup'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'

import CommonSkeleton from '@/app/components/CommonSkeleton'
import NFTImage from '@/app/components/Image'
import Layout from '@/app/components/Layout'
import { IMyBockResponse, myBooks } from '@/app/service/commonServer'
import * as nftServer from '@/app/service/nftServer'
import storage from '@/app/utils/storage'
import { formatMoney } from '@/app/utils/tool'
import Icon from '@/assets/icons'

import css from './home.module.stylus'

export interface CSSPropertiesWithVars extends React.CSSProperties {
    '--working-height': string
}

export default (): React.ReactElement => {
    const { t } = useTranslation()
    const [isRead, setIsRead] = useState(!!storage.get('isRead'))
    const [myData, setMyData] = useState<IMyBockResponse>()
    const navigate = useNavigate()
    const [mine, setMine] = useState<nftServer.IGetNftMineResponse>()
    const [tokenAmount, setTokenAmount] = useState(0)
    const [preTokenAmount, setPreTokenAmount] = useState(0)
    const workingWrapRef = useRef<HTMLDivElement>(null)
    const [workingWrapWidth, setWorkingWrapWidth] = useState(0)
    const [loading, setLoading] = useState(true)

    const onJumpWebview = (): void => {
        storage.set('isRead', true)
        setIsRead(true)
        window.location.href = 'https://readem.gitbook.io/readem/get-started/how-to-read-to-earn-in-readem'
    }

    const fetchMyBook = async (): Promise<void> => {
        const res = await myBooks()
        if (res.data.code === 0) {
            setMyData(res.data.data)
        }
    }

    const fetchNftMine = async (): Promise<void> => {
        const res = await nftServer.getNftMine({ lock_reason: 'stake' })
        if (res.data.code === 0) {
            setMine(res.data.data)
        }
    }

    useEffect(() => {
        const fetch = async (): Promise<void> => {
            setLoading(true)
            await fetchMyBook()
            await fetchNftMine()
            setLoading(false)
        }
        fetch()
        return () => {
            setMyData(undefined)
            setMine(undefined)
        }
    }, [])

    useEffect(() => {
        if (mine?.items?.length) {
            setTokenAmount(pre => {
                setPreTokenAmount(pre)
                return +new BigNumber(dayjs().diff(mine.items[0].lock_at, 's')).multipliedBy(mine.items[0].earn_base)
            })
        }
    }, [mine])

    useEffect(() => {
        if (workingWrapRef.current) {
            setWorkingWrapWidth(workingWrapRef.current.offsetWidth)
        }
    }, [workingWrapRef, loading])

    return (
        <Layout className={css.home}>
            {loading ? (
                <CommonSkeleton />
            ) : (
                <div className={classnames('wrap', css.earn)}>
                    {!isRead ? (
                        <div className={css.tip} onClick={() => onJumpWebview()}>
                            <div className={css.left}>
                                <div className={css.tipTxt}>How It Works?</div>
                                <div className={css.tipDesc}>Choose a NFT, starting earning now</div>
                            </div>
                            <Icon className={css.right} name="arrowhead" />
                        </div>
                    ) : null}
                    {myData?.items?.length ? (
                        <>
                            <div className={css.title}>
                                <div className={css.name}>
                                    <span>📖</span>
                                    {t('home.myBooks')}
                                </div>
                                <Link to={`/MyBooks`}>
                                    <span>{t('common.more')}</span>
                                    <Icon className={css.icon} name="arrow" />
                                </Link>
                            </div>
                            <div className={css.books}>
                                {myData.items.map((item, index) =>
                                    index < 3 ? (
                                        <div className={css.item} key={item.book.id} onClick={() => navigate(`/BookDetail/${item.book.id}`)}>
                                            <div className={css.imgWrap}>
                                                <Image
                                                    className={css.img}
                                                    src={item.book.cover_image}
                                                    height={120}
                                                    fit="cover"
                                                    placeholder={
                                                        <Skeleton
                                                            animated
                                                            style={{
                                                                '--height': '100%',
                                                                background: 'linear-gradient(90deg, #272727 25%,  #191919 37%, #272727 63%)',
                                                                backgroundSize: '400% 100%'
                                                            }}
                                                        />
                                                    }
                                                />
                                            </div>
                                            <div className={css.tit}>{item.book.name}</div>
                                            <div className={css.read}>
                                                Read <em>12%</em>
                                            </div>
                                        </div>
                                    ) : null
                                )}
                            </div>
                        </>
                    ) : null}

                    <div className={css.title}>
                        <div className={css.name}>
                            <span>🦉</span>
                            {t('home.owl')}
                        </div>
                    </div>
                    <div
                        className={css.working}
                        ref={workingWrapRef}
                        style={{ '--working-height': `${workingWrapWidth}px` } as CSSPropertiesWithVars}
                    >
                        {mine && mine.items?.length ? (
                            <div className={css.workingMain}>
                                <div className={css.header}>
                                    <div className={css.titleWrap}>
                                        <div className={css.tit}>#{mine.items[0].id}</div>
                                        <div className={css.box}>
                                            <div className={css.item}>Lv{mine.items[0].level}</div>
                                            <div className={css.item}>Rare</div>
                                            <div className={css.item}>
                                                <div style={{ width: '40%' }} />
                                                <span>30/100</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={css.tagWrap}>
                                        <span>Brave</span>
                                        <span>#Science #Fiction</span>
                                    </div>
                                </div>
                                <div className={css.img}>
                                    <NFTImage
                                        height={workingWrapWidth - 30}
                                        className={css.image}
                                        gene={mine.items[0].gene}
                                        onClick={() => navigate('/OWL')}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className={css.workingMain}>
                                <div className={css.header} />
                                <div className={css.img}>
                                    <div className={css.block} onClick={() => navigate('/Nft')}>
                                        <div className={css.add}>
                                            <Icon className={css.icon} name="add" />
                                        </div>
                                        <div className={css.addText}>{t('home.addText')}</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className={css.title}>{t('home.myEarn')}</div>
                    <div className={css.myEarn}>
                        <div className={css.tit}>Total</div>
                        <div className={css.box}>
                            <div className={css.left}>
                                <img src="./img/rdm.png" alt="" />
                                <div className={css.info}>
                                    <div className={css.symbol}>RDM</div>
                                    <div className={css.rewords}>Today +200 RDM</div>
                                </div>
                            </div>
                            <div className={css.right}>
                                <div className={css.amount}>
                                    <CountUp formattingFn={formatMoney} start={preTokenAmount} end={tokenAmount} />
                                </div>
                                <div className={css.price}>
                                    $<CountUp formattingFn={formatMoney} start={preTokenAmount * 0.01} end={tokenAmount * 0.01} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    )
}
