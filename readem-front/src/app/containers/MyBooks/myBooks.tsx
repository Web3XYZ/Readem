import { Button, Image, InfiniteScroll, Popup, SpinLoading } from 'antd-mobile'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Header from '@/app/components/Header'
import Layout from '@/app/components/Layout'
import { deleteBooks, IMyBockResponseItem, myBooks } from '@/app/service/commonServer'
import * as nftServer from '@/app/service/nftServer'
import Icon from '@/assets/icons'

import css from './myBooks.module.stylus'

const InfiniteScrollContent = ({ hasMore }: { hasMore?: boolean }): React.ReactElement => {
    return (
        <>
            {
                hasMore ? (
                    <>
                        <SpinLoading color={'#00FF85'} />
                    </>
                ) : null
                // <div>--- No more ---</div>
            }
        </>
    )
}

export default (): React.ReactElement => {
    const navigate = useNavigate()
    const [data, setData] = useState<IMyBockResponseItem[]>([])
    const [hasMore, setHasMore] = useState(true)
    const [index, setIndex] = useState(0)
    const [manage, setManage] = useState(false)
    const [delArr, setDelArr] = useState<number[]>([])
    const [show, setShow] = useState(false)
    const [loading, setLoading] = useState(false)
    const [visible, setVisible] = useState(false)
    const [status, setStatus] = useState(0)

    const [mine, setMine] = useState<nftServer.IGetNftMineResponse>()

    const fetchNftMine = async (): Promise<void> => {
        const res = await nftServer.getNftMine()
        if (res.data.code === 0) {
            setMine(res.data.data)
        }
    }

    useEffect(() => {
        fetchNftMine()
        return () => {}
    }, [])

    const loadMore = async (i?: number): Promise<void> => {
        const page = i === undefined ? index : i
        const res = await myBooks({
            size: 18,
            page
        })
        if (res.data.code === 0 && res.data.data.items?.length) {
            setData(val => [...val, ...res.data.data.items])
            setIndex(page + 1)
            setHasMore(res.data.data.items.length > 0)
        } else {
            setHasMore(false)
        }
    }

    const onSubmit = async (): Promise<void> => {
        setLoading(true)
        const res = await deleteBooks({ book_ids: delArr })
        if (res.data.code === 0) {
            setData([])
            setManage(false)
            setDelArr([])
            setShow(false)
            loadMore(0)
        }
        setLoading(false)
    }

    useEffect(() => {
        if (delArr.length) {
            setShow(true)
        } else {
            setShow(false)
        }
    }, [delArr])

    return (
        <Layout className={css.myBooks} type={1}>
            <Header
                title={'My Books'}
                right={
                    <div className={css.headerBtn} onClick={() => setManage(!manage)}>
                        {manage ? 'Done' : 'Manage'}
                    </div>
                }
            />
            <div className={css.list}>
                {data.map(item => (
                    <div
                        className={css.item}
                        key={item.book.id}
                        onClick={() => {
                            if (manage) {
                                const index = delArr.findIndex(i => item.book.id === i)
                                const arr = delArr.concat([])
                                if (index === -1) {
                                    arr.push(item.book.id)
                                } else {
                                    arr.splice(index, 1)
                                }
                                setDelArr(arr)
                            } else {
                                if (mine) {
                                    if (!mine.items.length) {
                                        setVisible(true)
                                        setStatus(1)
                                    } else if (!mine.items.filter(item => item.lock_reason === 'stake').length) {
                                        setVisible(true)
                                        setStatus(2)
                                    } else {
                                        navigate(`/BookDetail/${item.book.id}`)
                                    }
                                }
                            }
                        }}
                    >
                        <div className={css.box}>
                            <Image className={css.img} src={item.book.cover_image} />
                            {manage ? (
                                <div className={css.checkbox}>
                                    {delArr.findIndex(i => i === item.book.id) !== -1 ? <Icon className={css.icon} name="selected" /> : null}
                                </div>
                            ) : null}
                        </div>
                        <div className={css.name}>{item.book.name}</div>
                        <div className={css.author}>{item.book.author}</div>
                    </div>
                ))}
            </div>
            <InfiniteScroll loadMore={loadMore} hasMore={hasMore}>
                <InfiniteScrollContent hasMore={hasMore} />
            </InfiniteScroll>
            <Popup visible={show} position="bottom" className="delectPopup" mask={false}>
                <Button
                    loading={loading}
                    className="btn"
                    onClick={() => onSubmit()}
                    loadingIcon={<SpinLoading style={{ '--size': '24px', '--color': '#000' }} />}
                >
                    Delete
                </Button>
            </Popup>
            <Popup
                visible={visible}
                onMaskClick={() => {
                    setVisible(false)
                }}
                position="bottom"
                className="popup"
                bodyStyle={{ width: 'calc(100vw - 30px)' }}
            >
                {status === 1 ? (
                    <>
                        <div className="popupTitle">You have no bird</div>
                        <div className="popupWrap">
                            <div className="txt2">You cn only make money when there are birds at work</div>
                        </div>
                        <Button
                            loadingIcon={<SpinLoading style={{ '--size': '24px', '--color': '#000' }} />}
                            className="popupSubmitBtn"
                            onClick={() => navigate('/Market')}
                        >
                            <span>Get a bird</span>
                        </Button>
                        <div className="still" onClick={() => history.go(-1)}>
                            Still read
                        </div>
                    </>
                ) : (
                    <>
                        <div className="popupTitle">No bird working</div>
                        <div className="popupWrap">
                            <div className="txt2">You cn only make money when there are birds at work</div>
                        </div>
                        <Button
                            loadingIcon={<SpinLoading style={{ '--size': '24px', '--color': '#000' }} />}
                            className="popupSubmitBtn"
                            onClick={() => navigate('/OWL')}
                        >
                            <span>Choose a bird</span>
                        </Button>
                        <div className="still" onClick={() => history.go(-1)}>
                            Still read
                        </div>
                    </>
                )}
            </Popup>
        </Layout>
    )
}
