import { SafeArea } from 'antd-mobile'
import classnames from 'classnames'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'

import Icon from '@/assets/icons'

import css from './footer.module.stylus'

interface IProps {
    className?: string
}

export default (props: IProps): React.ReactElement | null => {
    const { pathname } = useLocation()
    const navigate = useNavigate()
    const { t } = useTranslation()

    return (
        <div className={classnames(css.footer, props.className)}>
            <div className={classnames(css.bar)}>
                <div className={classnames(css.item, { [css.cur]: pathname === '/' })} onClick={() => navigate('/')}>
                    <Icon className={css.icon} name="home" />
                    <span>{t('common.home')}</span>
                </div>
                <div className={classnames(css.item, { [css.cur]: pathname === '/Store' })} onClick={() => navigate('/Store')}>
                    <Icon className={css.icon} name="store" />
                    <span>{t('common.books')}</span>
                </div>
                <div className={classnames(css.item, { [css.cur]: pathname === '/Nft' })} onClick={() => navigate('/Nft')}>
                    <Icon className={css.icon} name="nft" />
                    <span>{t('common.nft')}</span>
                </div>
                <div className={classnames(css.item, { [css.cur]: pathname === '/Market' })} onClick={() => navigate('/Market')}>
                    <Icon className={css.icon} name="market" />
                    <span>{t('common.market')}</span>
                </div>
            </div>
            <SafeArea position="bottom" />
        </div>
    )
}
