import { Toast } from 'antd-mobile'
import classnames from 'classnames'
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Header from '@/app/components/Header'
import NFTImage from '@/app/components/Image'
import Layout from '@/app/components/Layout'
import * as nftServer from '@/app/service/nftServer'
import { handleRequestError } from '@/app/utils/request'

import css from '../Market/nft.module.stylus'
import owlCss from './owl.module.stylus'

export interface CSSPropertiesWithVars extends React.CSSProperties {
    '--item-height': string
}

export default (): React.ReactElement => {
    const navigate = useNavigate()
    const [mine, setMine] = useState<nftServer.IGetNftMineResponse>()
    const listRef = useRef<HTMLDivElement>(null)

    const fetchNftMine = async (): Promise<void> => {
        try {
            const res = await nftServer.getNftMine({ lock_reason: 'ALL' })
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
            navigate('/')
        }
    }

    return (
        <Layout className={classnames(css.nft, owlCss.owl)} type={1}>
            <Header title={'Choose OWL'} />
            <div className={classnames('wrap', css.main, css.myNft)}>
                <div className={owlCss.main} ref={listRef}>
                    {mine?.items?.length ? (
                        <div
                            className={css.list}
                            style={
                                {
                                    '--item-height': `${listRef.current ? listRef.current.offsetWidth / 2 - 5 : 0}px`
                                } as CSSPropertiesWithVars
                            }
                        >
                            {mine.items.map((item, index) => (
                                <div className={css.item} key={item.id}>
                                    <div
                                        className={css.itemMain}
                                        onClick={() => {
                                            postNftStake(item.id)
                                        }}
                                    >
                                        <div className={classnames(css.itemTitle, owlCss.itemTitle)}>
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
                                        />
                                        <div className={css.itemMint}>
                                            <div>Mint:{item.id}</div>
                                            <div>Lv1</div>
                                        </div>
                                        <div className={css.progressBar}>
                                            <div style={{ width: '40%' }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="noData">No Data</div>
                    )}
                </div>
            </div>
        </Layout>
    )
}
