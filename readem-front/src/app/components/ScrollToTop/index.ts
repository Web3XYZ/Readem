import { useEffect } from 'react'

interface IProps {
    children: JSX.Element
}

export default (props: IProps): JSX.Element => {
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [window.location.href])

    return props.children
}
