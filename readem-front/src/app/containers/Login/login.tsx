import { Button, Input, SafeArea, SpinLoading } from 'antd-mobile'
import classnames from 'classnames'
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import * as basicAction from '@/app/actions/baseAction'
import { useSimpleCountDown } from '@/app/hooks/useCountDown'
import useEmailCode from '@/app/hooks/useEmailCode'
import useLogin from '@/app/hooks/useLogin'

import css from './login.module.styl'

export default (): JSX.Element => {
    const [loading, loginResponse, setLogin] = useLogin()
    const navigate = useNavigate()
    const [time, setTime] = useSimpleCountDown(0)
    const [, , getCode] = useEmailCode()
    const [code, setCode] = useState('')
    const [email, setEmail] = useState('')
    const [error, setError] = useState<string>()
    const reg = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    const [emailFocus, setEmailFocus] = useState(false)
    const [codeFocus, setCodeFocus] = useState(false)
    const dispatch = useDispatch()

    const getEmailCode = async (): Promise<void> => {
        try {
            if (!reg.test(email)) {
                setError('Please enter correct email!')
                return
            }
            setTime(60)
            await getCode({ email })
        } catch (e) {
            console.error(e)
        }
    }
    const onSubmit = async (): Promise<void> => {
        if (!reg.test(email)) {
            setError('Please enter correct email!')
            return
        }
        if (code.length !== 6 || !/[a-zA-Z0-9]/.test(code)) {
            setError('Please enter correct code!')
            return
        }
        try {
            setLogin({ code, email, signin_type: 'code' })
        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => {
        if (loginResponse?.data) {
            dispatch(basicAction.getUserInfo())
            navigate('/')
        }
    }, [loginResponse, navigate, dispatch])

    return (
        <div className={css.login}>
            <div className={css.title}>Login</div>
            <div className={css.main}>
                <div className={classnames(css.formItem, { [css.formItemFocus]: emailFocus })}>
                    <Input
                        className={css.input}
                        placeholder="Email address"
                        onChange={e => setEmail(e)}
                        onFocus={e => {
                            setEmailFocus(true)
                        }}
                        onBlur={e => {
                            setEmailFocus(false)
                        }}
                    />
                </div>
                <div className={classnames(css.formItem, { [css.formItemFocus]: codeFocus })}>
                    <Input
                        className={css.input}
                        placeholder="Verification code"
                        onChange={e => setCode(e)}
                        onFocus={e => {
                            setCodeFocus(true)
                        }}
                        onBlur={e => {
                            setCodeFocus(false)
                        }}
                    />
                    <div className={css.codeBtn} onClick={() => getEmailCode()}>
                        {time ? `${time}s` : 'Send'}
                    </div>
                </div>
                <div className={css.notice}>New users will be automatically registered</div>
                <Button
                    loading={loading}
                    loadingIcon={<SpinLoading style={{ '--size': '24px', '--color': '#000' }} />}
                    className={classnames(css.btn, css.loading)}
                    onClick={() => onSubmit()}
                >
                    Login
                </Button>
            </div>
            {error ? (
                <div className={css.error}>
                    {error} <SafeArea position="bottom" />
                </div>
            ) : null}
        </div>
    )
}
