import { getQueryStringByName } from 'mobile-browser'

import storage from '../utils/storage'

const query = getQueryStringByName('lng')
let language = storage.get('language')

if (query) {
    language = query
    storage.set('language', query)
    storage.set('lng', query)
}
// if (!language) {
//     if (navigator.appName === 'Netscape') {
//         language = navigator.language
//     } else {
//         language = (navigator as any).userLanguage
//     }
//     const sec = language.split('-')
//     if (sec[1]) {
//         sec[1] = sec[1].toUpperCase()
//         storage.set('language', `${sec[0]}_${sec[1]}`)
//     }
// }

export default language
