import classnames from 'classnames'
import React from 'react'

const files = (require as NodeRequire).context('.', true, /\.svg$/)
const requireAll = (requireContext: __WebpackModuleApi.RequireContext): unknown[] => requireContext.keys().map(requireContext)
requireAll(files)

type IProps = {
    name: string
    className?: string
}

const Icon = (props: IProps): JSX.Element => {
    return (
        <svg className={classnames(props.className, 'icon')}>
            <use xlinkHref={'#' + props.name} />
        </svg>
    )
}

export default Icon
