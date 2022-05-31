import { Button, Popup, SpinLoading, Toast } from 'antd-mobile'
import { useLiveQuery } from 'dexie-react-hooks'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { Swiper as ISwiper } from 'swiper'
import { Virtual } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'

import Layout from '@/app/components/Layout'
import getBookText from '@/app/utils/fileLoad'
import { splitChapterToPageLines } from '@/app/utils/helpers'
import Icon from '@/assets/icons'

import fetchBookDetail from '../../utils/fetchBookDetail'
import { db, IBooks, IRecord, ISlide } from '../../utils/indexedDB'
import css from './reader.module.stylus'

const PaginationInfo = (props: { info: IRecord }): React.ReactElement => {
    const { chapterIndex, pageIndex, pageCount } = props.info
    return (
        <div className={css.footer}>
            {/* Chapter {chapterIndex + 1} / Page{' '} */}
            {/* <span>
                {pageIndex + 1}/{pageCount}
            </span> */}
            <span>{pageIndex >= 9 ? pageIndex + 1 : `0${pageIndex + 1}`}</span>
        </div>
    )
}

const convertTxtArr = (chapterIndex: number, lineData: string[][], maxChapter: number): ISlide[] => {
    const arr: ISlide[] = []
    const pageCount = lineData.length
    lineData.forEach((text, pageIndex) => {
        arr.push({ chapterIndex, text, pageIndex, pageCount, index: 0, maxChapter })
    })
    return arr
}

export default (): React.ReactElement => {
    const params = useParams<{ ID: string }>()
    const [show, setShow] = useState(false)
    const [visible, setVisible] = useState(Boolean)

    const [loading, setLoading] = useState(false)
    const [textLoading, setTextLoading] = useState(false)
    const [data, setData] = useState<IBooks>()
    const boxRef = useRef<HTMLDivElement>(null)
    const [controlledSwiper, setControlledSwiper] = useState<ISwiper | null>(null)
    const [patienceVisible, setPatienceVisible] = useState(false)

    const [pageInfo, setPageInfo] = useState({
        pageIndex: 0,
        pageCount: 0,
        chapterIndex: 0,
        index: 0,
        maxChapter: 0
    })

    const [txtArr, setTxtArr] = useState<ISlide[]>()
    const [initialSlide, setInitialSlide] = useState<number>()
    const [isInit, setInit] = useState(false)

    const books = useLiveQuery(() => db.books)

    const fetchDataArr = async (index: number, data: IBooks): Promise<{ prev: number; arr: ISlide[] }> => {
        if (!books) return { prev: 0, arr: [] }
        if (!params.ID) return { prev: 0, arr: [] }

        const { chapters, recordArr, fontInfo } = data
        const len = chapters.length
        const arr = recordArr.concat([])
        let prev = 0

        const loadData = async (i: number): Promise<void> => {
            if (arr[i]?.length === 0 && boxRef.current) {
                const getText = async (): Promise<string> => {
                    const book = await books.where({ bookID: params.ID })
                    const cacheBook = await book.first()
                    if (cacheBook?.loadedChapters[i]) {
                        return cacheBook.loadedChapters[i]
                    } else {
                        const res = await getBookText(chapters[i].content_location)
                        await book.modify(item => {
                            item.loadedChapters[i] = res
                        })
                        return res
                    }
                }
                const txt = await getText()
                const offsetHeight = boxRef.current.offsetHeight - (72 + 48) // footer height + status height
                const offsetWidth = boxRef.current.offsetWidth
                const fontHeight = fontInfo.height
                const fontWidth = fontInfo.width - 1.7
                const pageLineNum = Math.floor(offsetHeight / fontHeight)
                const lineFontNum = Math.floor(offsetWidth / fontWidth)
                const lineData = splitChapterToPageLines(txt, pageLineNum, lineFontNum)
                arr[i] = convertTxtArr(i, lineData, len)
            }
        }

        if (arr[index]) {
            setTextLoading(true)
            await loadData(index)
            if (index === 0) {
                await loadData(index + 1)
                await loadData(index + 2)
            } else if (index === len) {
                await loadData(index - 1)
                await loadData(index - 2)
                prev = arr[index - 1]?.length || 0 + arr[index - 2]?.length || 0
            } else {
                await loadData(index + 1)
                await loadData(index - 1)
                await loadData(index + 2)
                await loadData(index - 2)
                prev = arr[index - 1]?.length || 0 + arr[index - 2]?.length || 0
            }
        }

        const tmpTxtArr = arr.flat().map((item, index) => {
            item.index = index
            return item
        })

        const book = await books.where({ bookID: params.ID })
        await book.modify(item => {
            item.recordArr = arr
        })

        if (!isInit) {
            const index = tmpTxtArr.findIndex(item => item.chapterIndex === data.record.chapterIndex && item.pageIndex === data.record.pageIndex)
            setInitialSlide(index)
            setInit(true)
        }

        setTxtArr(tmpTxtArr)
        setLoading(false)
        setTextLoading(false)

        return { prev, arr: tmpTxtArr }
    }

    useLayoutEffect(() => {
        const fetch = async (): Promise<void> => {
            if (params.ID && books && boxRef.current) {
                try {
                    setLoading(true)
                    const res = await fetchBookDetail(params.ID, true)
                    if (res.data) {
                        setData(res.data)
                        await fetchDataArr(res.data?.record.chapterIndex || 0, res.data)
                    }
                    setLoading(false)
                } catch (error) {
                    setLoading(false)
                }
            }
        }
        fetch()
    }, [params.ID, books, boxRef])

    return (
        <Layout className={css.bookReader} type={1}>
            <div className={css.main}>
                <div className={css.box} ref={boxRef}>
                    {!loading && initialSlide !== undefined && txtArr?.length ? (
                        <>
                            <div className={css.status}>
                                <div className={css.status1} onClick={() => setPatienceVisible(true)}>
                                    🐦 #128 is reading to earn
                                </div>
                                {/* <div className={css.status2}>🐦 #128 is reading to earn, but he is impatient</div>
                                <div className={css.status3}>🐦 #128 is reading to earn, but he too tired</div> */}
                            </div>
                            <Swiper
                                className={css.swiper}
                                observer
                                modules={[Virtual]}
                                virtual
                                observeParents
                                slidesPerView={1}
                                initialSlide={initialSlide}
                                speed={800}
                                onSwiper={s => {
                                    setControlledSwiper(s)
                                }}
                                onSlideNextTransitionStart={async s => {
                                    const cur = txtArr[s.activeIndex]
                                    if (!cur) return
                                    if (!books) return
                                    const book = await books.where({ bookID: params.ID })
                                    const cacheBook = await book.first()
                                    const next = txtArr.find(item => item.chapterIndex === cur.chapterIndex + 2)
                                    setPageInfo(i => {
                                        return {
                                            ...i,
                                            pageCount: cur.pageCount,
                                            chapterIndex: cur.chapterIndex,
                                            pageIndex: cur.pageIndex
                                        }
                                    })
                                    await book.modify(item => {
                                        item.record = {
                                            ...item.record,
                                            pageIndex: cur.pageIndex,
                                            chapterIndex: cur.chapterIndex,
                                            pageCount: cur.pageCount,
                                            index: cur.index
                                        }
                                    })
                                    if (!next && cacheBook) {
                                        await fetchDataArr(cur.chapterIndex + 2, cacheBook)
                                    }
                                }}
                                onSlidePrevTransitionStart={async s => {
                                    const cur = txtArr[s.activeIndex]
                                    if (!cur) return
                                    if (!books) return
                                    const book = await books.where({ bookID: params.ID })
                                    const cacheBook = await book.first()
                                    const prev = txtArr.find(item => item.chapterIndex === cur.chapterIndex - 2)
                                    setPageInfo(i => {
                                        return {
                                            ...i,
                                            pageCount: cur.pageCount,
                                            chapterIndex: cur.chapterIndex,
                                            pageIndex: cur.pageIndex
                                        }
                                    })
                                    await book.modify(item => {
                                        item.record = {
                                            ...item.record,
                                            pageIndex: cur.pageIndex,
                                            chapterIndex: cur.chapterIndex,
                                            pageCount: cur.pageCount,
                                            index: cur.index
                                        }
                                    })
                                    if (!prev && cacheBook && controlledSwiper) {
                                        // Add loading and disable Swiper if necessary
                                        const { prev } = await fetchDataArr(cur.chapterIndex - 2, cacheBook)
                                        controlledSwiper.slideTo(controlledSwiper.activeIndex + prev, 0)
                                    }
                                }}
                                onClick={(s, e) => {
                                    e.stopPropagation()
                                    setTimeout(() => {
                                        if (boxRef.current) {
                                            const item = boxRef.current.offsetWidth / 3
                                            if (s.touches.startX < item) {
                                                s.slidePrev()
                                            } else if (s.touches.startX > item * 2) {
                                                s.slideNext()
                                            } else {
                                                setShow(true)
                                            }
                                        }
                                    }, 1)
                                }}
                            >
                                {txtArr.map((item, index) => {
                                    return (
                                        <SwiperSlide key={`${params.ID}_${item.chapterIndex}_${item.index}_${index}`}>
                                            {item.text.map((text, i) => (
                                                <div
                                                    key={`${params.ID}_${item.chapterIndex}_${item.index}_${index}_${i}`}
                                                    dangerouslySetInnerHTML={{ __html: text }}
                                                />
                                            ))}
                                        </SwiperSlide>
                                    )
                                })}
                            </Swiper>
                            <PaginationInfo info={{ ...pageInfo }} />
                        </>
                    ) : (
                        <div className="lt-loading">
                            <SpinLoading color={'#00FF85'} />
                        </div>
                    )}
                </div>
            </div>
            <Popup
                visible={show}
                position="top"
                className="readerPopup"
                onMaskClick={() => {
                    setShow(false)
                }}
            >
                <div className="header">
                    <div className="iconWrap">
                        <div
                            className="btn"
                            onTouchEnd={e => {
                                e.stopPropagation()
                                history.go(-1)
                            }}
                        >
                            <Icon name="back" />
                        </div>
                    </div>
                    <div className="title">{data?.name}</div>
                    <div className="number">Part {pageInfo.pageIndex + 1} Info</div>
                    <div className="status">
                        <div className="status1">
                            <span>+26.23 RDM</span>
                            <Icon name="rise" />
                        </div>
                        {/* <div className={css.status2}>🐦 #128 is reading to earn, but he is impatient</div>
                                <div className={css.status3}>🐦 #128 is reading to earn, but he too tired</div> */}
                    </div>
                </div>
            </Popup>
            <Popup visible={show} position="bottom" className="readerPopup" mask={false}>
                <div className="footer">
                    <div
                        onTouchEnd={e => {
                            e.stopPropagation()
                            setVisible(true)
                        }}
                        className="left"
                    >
                        <Icon name="equal" />
                    </div>
                    <div className="txt">{pageInfo.pageIndex + 1}</div>
                    <div className="right">Chapter {pageInfo.chapterIndex + 1}</div>
                </div>
            </Popup>
            <Popup visible={visible} position="bottom" bodyStyle={{ height: '100%' }} className="readerPopup">
                <div style={{ padding: '15px' }}>
                    <div className="close" onClick={() => setVisible(false)}>
                        Close
                    </div>
                    <div className="title">Content</div>
                    <div className="list">
                        {data?.chapters.map((item, index) => (
                            <div
                                key={item.chapter_index}
                                className="item"
                                onClick={async () => {
                                    Toast.show({
                                        content: <SpinLoading color={'#00FF85'} />,
                                        duration: 50000
                                    })
                                    const { arr } = await fetchDataArr(index, data)
                                    if (arr && controlledSwiper) {
                                        const txtItem = arr.find(i => Number(i.chapterIndex) === index)
                                        controlledSwiper.slideTo(txtItem?.index || 0, 0)
                                        setVisible(false)
                                        setShow(false)
                                    }
                                    Toast.clear()
                                }}
                            >
                                <div className="subTitle">Character {index + 1}</div>
                                <div className="name">{item.title}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </Popup>
            <Popup
                visible={patienceVisible}
                onMaskClick={() => {
                    setPatienceVisible(false)
                }}
                position="bottom"
                className="popup"
                bodyStyle={{ width: 'calc(100vw - 30px)' }}
            >
                <div className="popupTitle">Improve patience?</div>
                <div className="popupWrap">
                    <div className="txt2">Spend $RDM to restore patience ti 100%</div>
                    <div className="txt">The speed of obtaining RDM will be increased by 20%</div>
                </div>
                <Button loadingIcon={<SpinLoading style={{ '--size': '24px', '--color': '#000' }} />} className="popupSubmitBtn">
                    <span>200 $RDM</span>
                </Button>
            </Popup>
        </Layout>
    )
}
