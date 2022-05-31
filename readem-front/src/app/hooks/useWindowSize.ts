import { useEffect, useState } from 'react'

const isClient = typeof window === 'object'

type ISize = {
    width: number | undefined
    height: number | undefined
}

function getSize(): ISize {
    return {
        width: isClient ? window.innerWidth : undefined,
        height: isClient ? window.innerHeight : undefined
    }
}

// https://usehooks.com/useWindowSize/
export default function useWindowSize(isRem?: boolean): ISize {
    const [windowSize, setWindowSize] = useState(getSize)

    const setRem = (): void => {
        if (isRem) {
            const width = getSize().width
            let font_size_value = (width || 0) / 19.2
            if (font_size_value < 46) font_size_value = 46
            if (width < 768) font_size_value = width / 3.75
            document.documentElement.style.fontSize = font_size_value + 'px'
        }
    }

    setRem()
    useEffect(() => {
        function handleResize(): void {
            setWindowSize(getSize())
        }
        if (isClient) {
            window.addEventListener('resize', handleResize)
            return () => {
                window.removeEventListener('resize', handleResize)
                document.documentElement.style.fontSize = 16 + 'px'
            }
        }
        return undefined
    }, [])

    return windowSize
}

// export function resize(): { height: number; width: number } {
//     const [size, setSize] = useState({
//         width: document.documentElement.clientWidth,
//         height: document.documentElement.clientHeight
//     })

//     const onResize = useCallback(() => {
//         setSize({
//             width: document.documentElement.clientWidth,
//             height: document.documentElement.clientHeight
//         })
//     }, [])

//     useEffect(() => {
//         window.addEventListener('resize', onResize)
//         return () => {
//             window.removeEventListener('resize', onResize)
//         }
//     }, [])

//     return size
// }
