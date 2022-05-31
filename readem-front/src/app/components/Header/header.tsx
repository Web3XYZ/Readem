import classnames from 'classnames'
import React from 'react'

import Icon from '@/assets/icons'

import css from './header.module.stylus'

interface IProps {
    title?: string
    className?: string
    right?: React.ReactNode
}

export default (props: IProps): React.ReactElement | null => {
    const { className, title, right } = props

    return (
        <header className={classnames(css.header, className)}>
            <div className={css.left} onClick={() => history.go(-1)}>
                <Icon className={css.icon} name="back" />
            </div>
            <div className={css.title}>{title}</div>
            <div className={css.right}>{right || null}</div>
        </header>
    )
}
