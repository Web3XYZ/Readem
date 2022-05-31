import classnames from 'classnames'
import React from 'react'
import { useLongPress } from 'react-use'

import css from './index.module.stylus'

interface IProps {
    className?: boolean
    children: React.ReactNode
    onLongPress: () => void
}

export default (props: IProps): React.ReactElement | null => {
    const { className, children, onLongPress } = props
    const longPressEvent = useLongPress(
        () => {
            onLongPress()
        },
        {
            isPreventDefault: true,
            delay: 500
        }
    )

    return (
        <div className={classnames(css.longPress, className)} {...longPressEvent}>
            {children}
        </div>
    )
}
