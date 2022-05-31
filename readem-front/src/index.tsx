import 'dayjs/locale/zh-cn'
import './assets/stylus/index.styl'
import './app/utils/i18n'
import 'antd-mobile/es/global'
import 'swiper/css'

import { Web3ReactProvider } from '@web3-react/core'
import { ConfigProvider } from 'antd-mobile'
import enUS from 'antd-mobile/es/locales/en-US'
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { HashRouter } from 'react-router-dom'
import Web3 from 'web3'

import AppRouter from '@/app/router'
import store from '@/app/store'
import { ThemeProvider } from '@/theme'

render(
    <Web3ReactProvider getLibrary={provider => new Web3(provider)}>
        <ConfigProvider locale={enUS}>
            <Provider store={store}>
                <ThemeProvider>
                    <HashRouter>
                        <AppRouter />
                    </HashRouter>
                </ThemeProvider>
            </Provider>
        </ConfigProvider>
    </Web3ReactProvider>,
    document.getElementById('root')
)
