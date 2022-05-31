import { Toast } from 'antd-mobile'
import { useCallback, useEffect, useState } from 'react'

import { ILogin, ISignInParams, login } from '@/app/service/commonServer'
import storage from '@/app/utils/storage'

type Dispatch<A> = (form: A) => void
type Form = ISignInParams

export default function useLogin(): [boolean, ILogin | undefined, Dispatch<Form>] {
    const [loading, setLoading] = useState(false)
    const [response, setResponse] = useState<ILogin>()
    const [form, setForm] = useState<Form | undefined>()

    const setLogin = useCallback((form?: Form | undefined): void => {
        setForm(form)
    }, [])

    useEffect(() => {
        if (form?.email && form?.code) {
            const load = async (): Promise<void> => {
                setLoading(true)
                const res = await login(form)
                const data = res.data
                if (data?.code !== 0) {
                    Toast.clear()
                    Toast.show({
                        icon: 'fail',
                        content: data?.message
                    })
                } else {
                    setResponse(data)
                    storage.set('header', data.data.header)
                }
                setLoading(false)
                setLogin()
            }
            load()
        }
        return () => {
            setResponse(undefined)
        }
    }, [form, setLogin])

    return [loading, response, setLogin]
}
