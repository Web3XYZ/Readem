import { SpinLoading } from 'antd-mobile'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { postMyBooks } from '@/app/service/commonServer'

import Cover from './components/Cover'
import Reader from './components/Reader'
import fetchBookDetail2 from './utils/fetchBookDetail'
import { IBooks } from './utils/indexedDB'

export default (): React.ReactElement => {
    const params = useParams<{ ID: string }>()
    const [data, setData] = useState<IBooks>()
    const [showReader, setShowReader] = useState(false)

    const addBook = async (id?: string): Promise<void> => {
        if (id) {
            await postMyBooks(id)
            setShowReader(true)
        }
    }

    useEffect(() => {
        const fetch = async (): Promise<void> => {
            if (params.ID) {
                const res = await fetchBookDetail2(params.ID, false)
                setData(res.data)
                setShowReader(res.isCache)
            }
        }
        fetch()
        return () => {
            setData(undefined)
        }
    }, [params.ID])

    return params.ID && data ? (
        showReader ? (
            <Reader />
        ) : (
            <Cover data={data} addBook={() => addBook(params.ID)} />
        )
    ) : (
        <div className="lt-loading">
            <SpinLoading color={'#00FF85'} />
        </div>
    )
}
