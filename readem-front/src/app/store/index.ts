import { createHashHistory } from 'history'
import { applyMiddleware, createStore, Store } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import promise from 'redux-promise'

import { logger } from '../../app/middleware'
import { rootReducer } from '../../app/reducers/RootState'

export function configureStore(reducer, initialState?): Store {
    let middleware = applyMiddleware(promise, s => logger(s, history))

    if (process.env.NODE_ENV !== 'production') {
        middleware = composeWithDevTools(middleware)
    }

    const store = createStore(reducer, initialState, middleware)

    // if (module.hot) {
    //     module.hot.accept('../../app/reducers', () => {
    //         const nextReducer = require('../../app/reducers')
    //         store.replaceReducer(nextReducer.rootReducer(history))
    //     })
    // }

    return store
}

export default configureStore(rootReducer)
