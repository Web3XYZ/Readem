import classnames from 'classnames'
import React, { CSSProperties, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import Footer from '@/app/components/Footer'
import UserBar from '@/app/components/UserBar'
import { useThemeContext } from '@/theme'

interface IProps {
    type?: number
    className?: string
    children: React.ReactNode
    style?: CSSProperties
}

export default (props: IProps): React.ReactElement => {
    const { className, type, children, style } = props
    const { currentThemeName } = useThemeContext()
    const navigate = useNavigate()

    useEffect(() => {
        document.body.scrollTop = 0
        window.scrollTo(0, 0)
    }, [navigate])

    return (
        <div className={classnames('lt-layout', currentThemeName, className)}>
            {type !== 1 ? <UserBar /> : null}
            <div className="lt-main" style={style}>
                {children}
            </div>
            {type !== 1 ? <Footer /> : null}
        </div>
    )
}
