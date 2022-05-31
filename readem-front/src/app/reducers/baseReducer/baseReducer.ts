import produce from 'immer'

import { IBookStoreResponse, IUserInfoResponse } from '@/app/service/commonServer'

import { errorHandle } from '../../utils'

export enum BASE {
    POST_BOOK_STORE = 'POST_BOOK_STORE',
    GET_MY_BOOK = 'GET_MY_BOOK',
    GET_USER_INFO = 'GET_USER_INFO',
    SET_USER_INFO = 'SET_USER_INFO'
}

export interface IBaseState {
    bookStore: IBookStoreResponse
    userInfo: IUserInfoResponse
}

export const baseState: IBaseState = {
    bookStore: {} as IBookStoreResponse,
    userInfo: {} as IUserInfoResponse
}

export default {
    [BASE.POST_BOOK_STORE]: {
        next: produce((draft: IBaseState, action: IAction) => {
            draft.bookStore = action.payload.data
        }),
        throw: (state: any, action: any) => errorHandle(state, action)
    },
    [BASE.GET_USER_INFO]: {
        next: produce((draft: IBaseState, action: IAction) => {
            draft.userInfo = action.payload.data.data
        }),
        throw: (state: any, action: any) => errorHandle(state, action)
    },
    [BASE.SET_USER_INFO]: {
        next: produce((draft: IBaseState, action: IAction) => {
            draft.userInfo = {} as IUserInfoResponse
        }),
        throw: (state: any, action: any) => errorHandle(state, action)
    }
}
