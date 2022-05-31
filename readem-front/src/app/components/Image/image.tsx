import { Image, Skeleton } from 'antd-mobile'
import React, { useEffect, useState } from 'react'

import { genByGene, generateImg } from '@/app/utils/nft'

interface IProps {
    gene: string
    className?: string
    height?: number
    onClick?: () => void
    style?: CSSPropertiesWithVars
}

interface CSSPropertiesWithVars extends React.CSSProperties {
    '--height': string
    '--width': string
}

export default (props: IProps): React.ReactElement => {
    const { className, gene, height, onClick, style } = props
    const [img, setImg] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetch = async (): Promise<void> => {
            setLoading(true)
            const pathArr = genByGene(gene)
            const res = await generateImg(pathArr)
            setImg(res)
            setLoading(false)
        }
        fetch()
    }, [gene])

    return (
        <Image
            src={img}
            className={className}
            height={height}
            onClick={onClick}
            style={style}
            placeholder={
                loading ? (
                    <Skeleton
                        animated
                        style={{
                            '--height': '100%',
                            background: 'linear-gradient(90deg, #272727 25%,  #191919 37%, #272727 63%)',
                            backgroundSize: '400% 100%'
                        }}
                    />
                ) : undefined
            }
            fallback={
                <Skeleton
                    animated
                    style={{
                        '--height': '100%',
                        background: 'linear-gradient(90deg, #272727 25%,  #191919 37%, #272727 63%)',
                        backgroundSize: '400% 100%'
                    }}
                />
            }
        />
    )
}
