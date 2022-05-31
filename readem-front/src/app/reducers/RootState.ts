import { combineReducers } from 'redux'

import baseReducer, { IBase } from './baseReducer'

export interface IRootState {
    base: IBase
}

export const commonReducer = {
    base: baseReducer
}

export const rootReducer = combineReducers(commonReducer)
