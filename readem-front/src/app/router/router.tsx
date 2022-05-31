import { SpinLoading } from 'antd-mobile'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Route, Routes, useNavigate } from 'react-router-dom'

import * as basicAction from '@/app/actions/baseAction'
import ScrollToTop from '@/app/components/ScrollToTop'
import BookDetail from '@/app/containers/BookDetail'
import App from '@/app/containers/Home'
import Login from '@/app/containers/Login'
import Market from '@/app/containers/Market'
import MyBooks from '@/app/containers/MyBooks'
import NFT from '@/app/containers/NFT'
import NFTDetail from '@/app/containers/NFTDetail'
import OWL from '@/app/containers/OWL'
import Store from '@/app/containers/Store'
import StoreCategory from '@/app/containers/Store/category'
import { IRootState } from '@/app/reducers/RootState'
import sleep from '@/app/utils/sleep'

export default (): JSX.Element => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const { userInfo } = useSelector((store: IRootState) => store.base)

    useEffect(() => {
        const fetch = async (): Promise<void> => {
            try {
                setLoading(true)
                const res = await dispatch(basicAction.getUserInfo())
                setLoading(false)
                await sleep(0.1)
                if (!(await res.payload).data.data.email) {
                    navigate('/login')
                }
            } catch (error) {
                navigate('/login')
            }
        }
        fetch()
    }, [dispatch])

    useEffect(() => {
        if (userInfo.email) {
            setLoading(false)
        }
    }, [userInfo])

    return (
        <ScrollToTop>
            <Routes>
                <Route path="/login" element={<Login />} />
                {loading ? (
                    <Route
                        path="*"
                        element={
                            <div className="lt-loading">
                                <SpinLoading color={'#00FF85'} />
                            </div>
                        }
                    />
                ) : (
                    <Route>
                        <Route path="/Store" element={<Store />} />
                        <Route path="/StoreCategory/:category" element={<StoreCategory />} />
                        <Route path="/BookDetail/:ID" element={<BookDetail />} />
                        <Route path="/NFT" element={<NFT />} />
                        <Route path="/NFTDetail/:ID" element={<NFTDetail />} />
                        <Route path="/Market" element={<Market />} />
                        <Route path="/OWL" element={<OWL />} />
                        <Route path="/MyBooks" element={<MyBooks />} />
                        <Route path="/" element={<App />} />
                    </Route>
                )}
            </Routes>
        </ScrollToTop>
    )
}
