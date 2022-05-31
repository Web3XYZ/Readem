import { Toast } from 'antd-mobile'
import { useCallback, useEffect, useState } from 'react'

import { ISignUpParams, ISignUpResponse, register } from '@/app/service/commonServer'
import storage from '@/app/utils/storage'

type Dispatch<A> = (form: A) => void
type Form = ISignUpParams
type Response = ISignUpResponse

export default function useRegister(): [boolean, Response | undefined, Dispatch<Form>] {
    const [loading, setLoading] = useState(false)
    const [response, setResponse] = useState<Response>()
    const [form, setForm] = useState<Form | undefined>()

    const setRegister = useCallback(
        (form?: Form | undefined): void => {
            setForm(form)
        },
        [form]
    )

    useEffect(() => {
        if (form?.email && form?.password) {
            const load = async (): Promise<void> => {
                setLoading(true)
                const res = await register(form)
                const data = res.data
                if (data?.code !== 0) {
                    Toast.clear()
                    Toast.show({
                        icon: 'fail',
                        content: data?.message
                    })
                } else {
                    setResponse(data.data)
                    storage.set('header', data.data.header)
                }
                setLoading(false)
                setRegister()
            }
            load()
        }
    }, [form])

    return [loading, response, setRegister]
}
