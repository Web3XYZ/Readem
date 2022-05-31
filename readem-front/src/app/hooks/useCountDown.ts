import { useCallback, useEffect, useRef, useState } from 'react'

type IUseCountDown = {
    days: string | number
    hours: string | number
    minutes: string | number
    seconds: string | number
}

export const parseMs = (milliseconds: number): IUseCountDown => {
    const days = Math.floor(milliseconds / 86400000)
    const hours = Math.floor(milliseconds / 3600000) % 24
    const minutes = Math.floor(milliseconds / 60000) % 60
    const seconds = Math.floor(milliseconds / 1000) % 60
    return {
        days: days < 10 ? `0${days}` : days,
        hours: hours < 10 ? `0${hours}` : hours,
        minutes: minutes < 10 ? `0${minutes}` : minutes,
        seconds: seconds < 10 ? `0${seconds}` : seconds
    }
}

export const useCountDown = (endTimeStamp: number): IUseCountDown => {
    const timer = useRef<NodeJS.Timeout>()
    const [state, setState] = useState(endTimeStamp)

    const calcTimeDiff = useCallback((): void => {
        const currentTime = +new Date()
        const seconds = Math.floor((endTimeStamp || 0) - currentTime)
        if (seconds <= 0) {
            clearInterval(Number(timer.current))
            setState(0)
            return
        }
        setState(seconds)
    }, [endTimeStamp])

    useEffect(() => {
        calcTimeDiff()
        timer.current = setInterval(() => {
            calcTimeDiff()
        }, 1000)
        return () => {
            clearInterval(Number(timer.current))
        }
    }, [endTimeStamp, calcTimeDiff])

    const { days, hours, minutes, seconds } = parseMs(state)
    return { days, hours, minutes, seconds }
}

export const useSimpleCountDown = (s: number): [number, (s: number) => void] => {
    const [seconds, setSeconds] = useState(s)
    useEffect(() => {
        setTimeout(() => {
            if (seconds > 0) {
                setSeconds(seconds - 1)
            }
        }, 1000)
    }, [seconds])

    return [seconds, setSeconds]
}

export default useCountDown
