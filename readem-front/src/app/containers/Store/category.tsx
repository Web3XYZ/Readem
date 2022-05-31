import { Image, InfiniteScroll, SpinLoading } from 'antd-mobile'
import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import Header from '@/app/components/Header'
import Layout from '@/app/components/Layout'
import { bookStore, getRecommend, IBookStoreResponseItem, IGetRecommendResponseItem } from '@/app/service/commonServer'

import css from './category.module.stylus'

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
    const { category } = useParams<{ category: string }>()
    const [data, setData] = useState<IBookStoreResponseItem[]>([])
    const [recommendData, setRecommendData] = useState<IGetRecommendResponseItem[]>([])
    const [hasMore, setHasMore] = useState(true)
    const [index, setIndex] = useState(0)

    const loadMore = async (): Promise<void> => {
        if (category === 'Recommended') {
            const res = await getRecommend({
                size: 18,
                page: index
            })
            if (res.data.code === 0 && res.data.data.length) {
                setRecommendData(val => [...val, ...res.data.data])
                // setIndex(index + 1)
                // setHasMore(res.data.data.length > 0)
                setHasMore(false)
            } else {
                setHasMore(false)
            }
            return
        }
        const res = await bookStore({
            category,
            size: 18,
            page: index
        })
        if (res.data.code === 0 && res.data.data.items?.length) {
            setData(val => [...val, ...res.data.data.items])
            setIndex(index + 1)
            setHasMore(res.data.data.items.length > 0)
        } else {
            setHasMore(false)
        }
    }

    return (
        <Layout className={css.category} type={1}>
            <Header title={category} />
            <div className={css.list}>
                {(category === 'Recommended' ? recommendData : data).map(item => (
                    <div className={css.item} key={item.id} onClick={() => navigate(`/BookDetail/${item.id}`)}>
                        <Image className={css.img} src={item.cover_image} />
                        <div className={css.name}>{item.name}</div>
                        <div className={css.author}>{item.author}</div>
                    </div>
                ))}
            </div>
            <InfiniteScroll loadMore={loadMore} hasMore={hasMore}>
                <InfiniteScrollContent hasMore={hasMore} />
            </InfiniteScroll>
        </Layout>
    )
}
