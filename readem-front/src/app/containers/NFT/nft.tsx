import { Image, Popup, Toast } from 'antd-mobile'
import classnames from 'classnames'
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import NFTImage from '@/app/components/Image'
import Layout from '@/app/components/Layout'
import * as nftServer from '@/app/service/nftServer'
import { handleRequestError } from '@/app/utils/request'
import Icon from '@/assets/icons'

import css from '../Market/nft.module.stylus'

export interface CSSPropertiesWithVars extends React.CSSProperties {
    '--item-height': string
}

const myNftOptions = ['All', 'Stake', 'Auction']

export default (): React.ReactElement => {
    const navigate = useNavigate()
    const [mine, setMine] = useState<nftServer.IGetNftMineResponse>()
    const [visibleSelect, setVisibleSelect] = useState(false)
    const [myNftOption, setMyNftOption] = useState<string>('All')
    const [options, setOptions] = useState<string[]>()
    const [curSelect, setCurSelect] = useState<string>()
    const listRef = useRef<HTMLDivElement>(null)

    const fetchNftMine = async (): Promise<void> => {
        try {
            const params = myNftOption === 'All' ? {} : { lock_reason: myNftOption.toLowerCase() }
            const res = await nftServer.getNftMine({ ...params })
            if (res.data.code === 0) {
                setMine(res.data.data)
            }
        } catch (error) {
            handleRequestError(error, () => navigate('/login'))
        }
    }

    useEffect(() => {
        fetchNftMine()
    }, [])

    useEffect(() => {
        if (!mine) return
        fetchNftMine()
        return () => {
            setMine(undefined)
        }
    }, [myNftOption])

    const postNftMint = async (): Promise<void> => {
        const res = await nftServer.postNftMint()
        if (res.data.code !== 0) {
            Toast.show({
                icon: 'error',
                content: res.data.data
            })
        } else {
            Toast.show({
                icon: 'success',
                content: 'success'
            })
            fetchNftMine()
        }
    }

    const postNftStake = async (id: number): Promise<void> => {
        const res = await nftServer.postNftStake(id)
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
            fetchNftMine()
        }
    }

    const postNftWithdraw = async (id: number): Promise<void> => {
        const res = await nftServer.postNftWithdraw(id)
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
            fetchNftMine()
        }
    }

    const postAuction = async (id: number): Promise<void> => {
        const res = await nftServer.postNftAuction({ user_nft_id: id, base_price: 100, duration: 100000 })
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
            fetchNftMine()
        }
    }

    const deleteAuction = async (id: number): Promise<void> => {
        const res = await nftServer.deleteNftAuction(id)
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
            fetchNftMine()
        }
    }

    const showMySelect = (a: string[], t: string): void => {
        setVisibleSelect(true)
        setOptions(a)
        setCurSelect(myNftOption)
    }

    const onSelect = (i: string): void => {
        setMyNftOption(i)
        setCurSelect(i)
        setVisibleSelect(false)
    }

    return (
        <Layout className={css.nft}>
            <div className={classnames('wrap', css.main, css.myNft)}>
                <div className="lt-filterBar" ref={listRef}>
                    <div className="lt-select" onClick={() => showMySelect(myNftOptions, 'myNft')}>
                        <span>{myNftOption}</span>
                        <Icon name="arrow" />
                    </div>
                </div>
                <div className={css.tip} onClick={() => postNftMint()}>
                    <div className={css.left}>
                        <div className={css.tipTxt}>Mint</div>
                    </div>
                    <Icon className={css.right} name="arrowhead" />
                </div>
                {mine?.items?.length ? (
                    <div
                        className={css.list}
                        style={
                            {
                                height: 'calc(100vh - 270px)',
                                '--item-height': `${listRef.current ? listRef.current.offsetWidth / 2 - 5 : 0}px`
                            } as CSSPropertiesWithVars
                        }
                    >
                        {mine.items.map((item, index) => (
                            <div className={css.item} key={item.id}>
                                <div className={css.itemMain}>
                                    <div className={css.itemTitle}>
                                        <span>#{item.id}</span>
                                        {item.lock_reason === 'stake' ? <em>Reading</em> : null}
                                    </div>
                                    <NFTImage
                                        className={css.itemImg}
                                        style={{
                                            '--height': `${listRef.current ? listRef.current.offsetWidth / 2 - 25 : 0}px`,
                                            '--width': `${listRef.current ? listRef.current.offsetWidth / 2 - 25 : 0}px`
                                        }}
                                        gene={item.gene}
                                        onClick={() => navigate(`/NFTDetail/${item.id}?type=nft`)}
                                    />
                                    <div className={css.itemMint}>
                                        <div>Mint:{item.id}</div>
                                        <div>Lv1</div>
                                    </div>
                                    <div className={css.progressBar}>
                                        <div style={{ width: '40%' }} />
                                    </div>
                                    <div className={css.itemPrice}>
                                        {/* <div className={css.price}>
                                            <img src="./img/matic.png" alt="" />
                                            <span>{item.earn_base}</span>
                                        </div> */}
                                        {/* {myNftOption === 'All' ? (
                                            <>
                                                {item.lock_reason ? (
                                                    <div className={css.btn} onClick={() => deleteAuction(item.id)}>
                                                        Cancel
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className={css.btn} onClick={() => postAuction(item.id)}>
                                                            Sell
                                                        </div>
                                                        <div className={css.btn} onClick={() => postNftStake(item.id)}>
                                                            Stake
                                                        </div>
                                                    </>
                                                )}
                                            </>
                                        ) : null}
                                        {myNftOption === 'Auction' ? (
                                            <div className={css.btn} onClick={() => deleteAuction(item.id)}>
                                                Cancel
                                            </div>
                                        ) : null}
                                        {myNftOption === 'Stake' ? (
                                            <div className={css.btn} onClick={() => postNftWithdraw(item.id)}>
                                                Withdraw
                                            </div>
                                        ) : null} */}
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
        </Layout>
    )
}
