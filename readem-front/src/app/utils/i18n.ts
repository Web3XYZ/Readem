import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import resources from '../lng'
import storage from '../utils/storage'
import language from './language'

let lng = language ? language.split('-').join('_') : 'en_US'

if (!resources[lng]) {
    lng = 'en_US'
    storage.set('language', 'en_US')
}

i18n.use(LanguageDetector)
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({
        fallbackLng: 'en_US',
        resources,
        lng,
        keySeparator: false, // we do not use keys in form messages.welcome
        interpolation: {
            escapeValue: false // react already safes from xss
        }
    })

export default i18n
