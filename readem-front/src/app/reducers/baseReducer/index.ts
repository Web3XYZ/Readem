import { handleActions } from 'redux-actions'

import baseReducer, { baseState, IBaseState } from './baseReducer'

const initialState = {
    ...baseState
}

export type IBase = IBaseState

export default handleActions({ ...baseReducer } as any, initialState)
