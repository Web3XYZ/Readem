import { Button, Input, Popup, SpinLoading } from 'antd-mobile'
import classnames from 'classnames'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import * as basicAction from '@/app/actions/baseAction'
import { IRootState } from '@/app/reducers/RootState'
import storage from '@/app/utils/storage'
import Icon from '@/assets/icons'

import css from './me.module.stylus'

interface IProps {
    onClose(): void
}

const options = ['English', '简体中文']

export default (props: IProps): React.ReactElement => {
    const { t } = useTranslation()
    const [username, setUsername] = useState('')
    const [loading, setLoading] = useState(false)
    const [visible, setVisible] = useState(false)
    const navigate = useNavigate()
    const { userInfo } = useSelector((store: IRootState) => store.base)
    const [visibleSelect, setVisibleSelect] = useState(false)
    const [focus, setFocus] = useState(false)
    const dispatch = useDispatch()

    const logout = (): void => {
        storage.remove('header')
        dispatch(basicAction.setUserInfo())
        props.onClose()
    }

    const onSubmit = async (): Promise<void> => {}

    const onSelect = (i: string): void => {}

    return (
        <div className={css.me}>
            <div className={css.content}>
                <div className={css.user}>
                    <img src="./img/user.png" alt="" />
                    <div className={css.box}>
                        <div className={css.name} onClick={() => setVisible(true)}>
                            <div>{userInfo.user_name}</div>
                            <Icon className={css.icon} name="edit" />
                        </div>
                        <div className={css.email}>{userInfo.email}</div>
                    </div>
                </div>
                <div className={css.list}>
                    <div className={css.title}>{t('common.setting')}</div>
                    <div className={css.main}>
                        <div className={css.item}>
                            <div className={css.left}>{t('common.language')}</div>
                            <Icon className={css.icon} name="arrow" />
                        </div>
                        <div className={css.item}>
                            <div className={css.left}>{t('common.version')}</div>
                            <div className={css.right}>1.0.0</div>
                        </div>
                        <div className={css.item} onClick={() => logout()}>
                            <div className={classnames(css.left, css.logout)}>{t('common.logout')}</div>
                        </div>
                    </div>
                </div>
            </div>
            <Popup
                visible={visible}
                onMaskClick={() => {
                    setVisible(false)
                }}
                position="bottom"
                className="popup"
                bodyStyle={{ width: 'calc(100vw - 30px)' }}
            >
                <div className="popupTitle">{t('common.name')}</div>
                <div className="popupWrap">
                    <Input
                        className={classnames('input', { focus })}
                        placeholder={t('common.enter')}
                        onChange={e => setUsername(e)}
                        onFocus={e => {
                            setFocus(true)
                        }}
                        onBlur={e => {
                            setFocus(false)
                        }}
                    />
                </div>
                <Button
                    loading={loading}
                    loadingIcon={<SpinLoading style={{ '--size': '24px', '--color': '#000' }} />}
                    className="popupSubmitBtn"
                    onClick={() => onSubmit()}
                >
                    <span>{t('common.confirm')}</span>
                </Button>
            </Popup>
            <Popup
                visible={visibleSelect}
                onMaskClick={() => {
                    setVisibleSelect(false)
                }}
                position="bottom"
                className="popup"
                bodyStyle={{ width: 'calc(100vw - 30px)' }}
            >
                <div className="popupList">
                    {options?.map(item => (
                        <div className="item" key={item} onClick={() => onSelect(item)}>
                            {item}
                        </div>
                    ))}
                </div>
            </Popup>
        </div>
    )
}
