import { Toast } from 'antd-mobile'
import { useCallback, useEffect, useState } from 'react'

import { ISignUpCodeParams, ISignUpCodeResponse, signUpCode } from '@/app/service/commonServer'

type Dispatch<A> = (form: A) => void
type Form = ISignUpCodeParams
type Response = IContent<ISignUpCodeResponse>

export default function useEmailCode(): [boolean, Response | undefined, Dispatch<Form>] {
    const [loading, setLoading] = useState(false)
    const [response, setResponse] = useState<Response>()
    const [form, setForm] = useState<Form | undefined>()

    const setCode = useCallback((form?: Form | undefined): void => {
        setForm(form)
    }, [])

    useEffect(() => {
        if (form?.email) {
            const load = async (): Promise<void> => {
                setLoading(true)
                const res = await signUpCode(form)
                const data = res.data
                if (data?.code !== 0) {
                    Toast.clear()
                    Toast.show({
                        icon: 'fail',
                        content: data?.message
                    })
                } else {
                    setResponse(data)
                }
                setLoading(false)
                setCode()
            }
            load()
        }
        return () => {
            setResponse(undefined)
        }
    }, [form, setCode])

    return [loading, response, setCode]
}
