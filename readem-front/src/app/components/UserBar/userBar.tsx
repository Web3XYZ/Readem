import { Image, Popup, SearchBar } from 'antd-mobile'
import { SearchBarRef } from 'antd-mobile/es/components/search-bar'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import Me from '@/app/components/Me'
import Wallet from '@/app/components/Wallet'
import useDebounce from '@/app/hooks/useDebounce'
import { IRootState } from '@/app/reducers/RootState'
import { bookStoreSearch, IBookStoreResponse } from '@/app/service/commonServer'
import Icon from '@/assets/icons'

import SearchIcon from './search.svg'
import WaltIcon from './wallet.svg'

interface IProps {
    className?: string
}

export default (props: IProps): React.ReactElement | null => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [visible, setVisible] = useState(false)
    const [walletVisible, setWalletVisible] = useState(false)
    const [meVisible, setMeVisible] = useState(false)
    const [searchData, setSearchData] = useState<IBookStoreResponse>()
    const { userInfo } = useSelector((store: IRootState) => store.base)
    const searchRef = useRef<SearchBarRef>(null)
    const [searchQuery, setSearchQuery] = useState<string>('')
    const debouncedQuery = useDebounce(searchQuery, 200)

    const onSearch = async (keyword: string): Promise<void> => {
        const res = await bookStoreSearch({ keyword, page: 0, size: 10 })
        if (res.data.code === 0) {
            setSearchData(res.data.data)
        }
    }

    useEffect(() => {
        if (debouncedQuery) {
            onSearch(debouncedQuery)
        }
        return () => {
            setSearchData(undefined)
        }
    }, [debouncedQuery])

    return (
        <div className="lt-user">
            <div className="left" onClick={() => setMeVisible(true)}>
                <Icon className="icon" name="equal" />
                <div className="userWrap">
                    <img src="./img/user.png" alt="" />
                    <div className="userName">
                        <div>Readem</div>
                    </div>
                </div>
            </div>
            <div className="right">
                <div className="search" onClick={() => setVisible(true)}>
                    <img src={SearchIcon} alt="" />
                </div>
                <div className="wallet" onClick={() => setWalletVisible(true)}>
                    <img src={WaltIcon} alt="" />
                </div>
            </div>
            <Popup
                visible={visible}
                onMaskClick={() => {
                    setVisible(false)
                }}
                position="bottom"
                bodyStyle={{ height: '100%' }}
                afterShow={() => {
                    searchRef.current?.focus()
                }}
                className="searchPopup"
            >
                <div style={{ padding: '15px' }}>
                    <div className="close" onClick={() => setVisible(false)}>
                        {t('common.close')}
                    </div>
                    <div className="title">{t('common.search')}</div>
                    <SearchBar
                        className="search"
                        ref={searchRef}
                        onCancel={() => setVisible(false)}
                        onChange={k => setSearchQuery(k)}
                        icon={<Icon name="search2" />}
                    />
                    {searchData && searchData?.items ? (
                        <div className="list">
                            {searchData.items.map((item, index) => (
                                <div className="item" key={`${index}_${item.id}`} onClick={() => navigate(`/BookDetail/${item.id}`)}>
                                    <div className="img">
                                        <Image width={120} height={140} fit="cover" src={item.cover_image} />
                                    </div>
                                    <div className="txt">
                                        <div className="name">{item.name}</div>
                                        <div className="author">{item.author}</div>
                                        <div className="desc">{item.description}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : null}
                </div>
            </Popup>
            <Popup
                visible={walletVisible}
                onMaskClick={() => {
                    setWalletVisible(false)
                }}
                position="bottom"
                bodyStyle={{ width: 'calc(100vw - 30px)', height: '50wh' }}
                className="walletPopup"
            >
                <div style={{ padding: '15px' }}>
                    <Wallet />
                </div>
            </Popup>
            <Popup
                visible={meVisible}
                onMaskClick={() => {
                    setMeVisible(false)
                }}
                position="bottom"
                bodyStyle={{ height: '100%' }}
                className="searchPopup"
            >
                <div style={{ padding: '15px' }}>
                    <div className="close" onClick={() => setMeVisible(false)}>
                        {t('common.close')}
                    </div>
                    <div className="title">{t('common.me')}</div>
                    <Me onClose={() => setMeVisible(false)} />
                </div>
            </Popup>
        </div>
    )
}
