import { Image } from 'antd-mobile'
import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { Swiper as ISwiper } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'

import CommonSkeleton from '@/app/components/CommonSkeleton'
import Layout from '@/app/components/Layout'
import { bookStore, getCategory, getRecommend, IBookStoreResponseItem, IGetRecommendResponseItem } from '@/app/service/commonServer'
import Icon from '@/assets/icons'

import css from './store.module.stylus'

interface IList {
    data: IBookStoreResponseItem[] | IGetRecommendResponseItem[]
}

const List = (props: IList): React.ReactElement | null => {
    const { data } = props
    const navigate = useNavigate()
    const swiperRef = useRef<ISwiper>()
    const [activeIndex, setActiveIndex] = useState(0)

    return data ? (
        <div className={css.list}>
            <div className={css.books}>
                <Swiper
                    slidesPerView={3}
                    onSlideChange={s => {
                        setActiveIndex(s.realIndex)
                    }}
                    onSwiper={swiper => {
                        swiperRef.current = swiper
                    }}
                    // centeredSlides
                    // initialSlide={1}
                    loop
                    spaceBetween={30}
                >
                    {data.map((item, index) => (
                        <SwiperSlide className={css.item} key={`${index}_${item.id}`} onClick={() => navigate(`/BookDetail/${item.id}`)}>
                            <div className={css.box}>
                                <div className={css.img}>
                                    <Image height={140} fit="cover" src={item.cover_image} />
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
            <div className={css.txt}>
                <div className={css.name}>{data[activeIndex]?.name}</div>
                <div className={css.desc}>{data[activeIndex]?.description}</div>
            </div>
        </div>
    ) : null
}

interface IData {
    category: string
    list: IBookStoreResponseItem[]
}

export default (): React.ReactElement => {
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<IData[]>([])
    const [recommendData, setRecommendData] = useState<IGetRecommendResponseItem[]>([])

    const fetchCategory = async (): Promise<void> => {
        const res = await getCategory()
        if (res.data.code === 0) {
            const { data } = res.data
            const arr: IData[] = []
            for (let i = 0; i < data.length; i++) {
                const res = await bookStore({
                    category: data[i]
                })
                if (res.data.code === 0) {
                    const item = { list: res.data.data.items, category: data[i] }
                    arr.push(item)
                }
            }
            setData(arr)
        }
    }

    const fetchRecommend = async (): Promise<void> => {
        const res = await getRecommend()
        if (res.data.code === 0) {
            setRecommendData(res.data.data)
        }
    }

    useEffect(() => {
        const fetch = async (): Promise<void> => {
            setLoading(true)
            await fetchRecommend()
            await fetchCategory()
            setLoading(false)
        }
        fetch()
        return () => {
            setData([])
            setRecommendData([])
            setLoading(false)
        }
    }, [])

    return (
        <Layout className={css.store}>
            {loading ? (
                <CommonSkeleton />
            ) : (
                <div className={css.wrap}>
                    {recommendData?.length ? (
                        <div className={css.block}>
                            <div className={css.header}>
                                <div className={css.title}>
                                    <span>🌈</span>Recommended
                                </div>
                                <Link to={`/StoreCategory/Recommended`}>
                                    <span>More</span>
                                    <Icon className={css.icon} name="arrow" />
                                </Link>
                            </div>
                            <List data={recommendData} />
                        </div>
                    ) : null}
                    {data.length ? (
                        data.map(
                            item =>
                                item.list?.length && (
                                    <div className={css.block} key={item.category}>
                                        <div className={css.header}>
                                            <div className={css.title}>{item.category}</div>
                                            <Link to={`/StoreCategory/${item.category}`}>
                                                <span>More</span>
                                                <Icon className={css.icon} name="arrow" />
                                            </Link>
                                        </div>
                                        <List data={item.list} />
                                    </div>
                                )
                        )
                    ) : (
                        <div className="noData">No Data</div>
                    )}
                </div>
            )}
        </Layout>
    )
}
