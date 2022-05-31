import { Button, Image, Popup, SafeArea, SpinLoading } from 'antd-mobile'
import classnames from 'classnames'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Header from '@/app/components/Header'
import Layout from '@/app/components/Layout'
import * as nftServer from '@/app/service/nftServer'

import { IBooks } from '../../utils/indexedDB'
import css from './cover.module.stylus'

interface IProps {
    data: IBooks
    addBook(id: string): void
}

export default (props: IProps): React.ReactElement => {
    const { data, addBook } = props
    const [visible, setVisible] = useState(false)
    const [status, setStatus] = useState(0)
    const navigate = useNavigate()
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

    return (
        <Layout className={css.bookDetail} type={1}>
            <Header title={'Book Detail'} />
            <div className={css.main}>
                {data ? (
                    <>
                        <Image className={css.img} width={150} fit="cover" src={`${data.cover_image}`} />
                        <div className={css.name}>{data.name}</div>
                        <div className={css.author}>
                            Author<span>{data.author}</span>
                        </div>
                        <div className={css.desc}>
                            <div className={css.title}>Info</div>
                            <div className={css.description}>{data.description}</div>
                        </div>
                    </>
                ) : null}
                <div
                    className={classnames(css.btn)}
                    onClick={() => {
                        if (mine) {
                            if (!mine.items.length) {
                                setVisible(true)
                                setStatus(1)
                            } else if (!mine.items.filter(item => item.lock_reason === 'stake').length) {
                                setVisible(true)
                                setStatus(2)
                            } else {
                                addBook(data.bookID)
                            }
                        }
                    }}
                >
                    <div>Read now</div>
                    <SafeArea position="bottom" />
                </div>
            </div>
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
