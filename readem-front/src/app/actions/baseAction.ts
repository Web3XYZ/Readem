import { Action, createAction } from 'redux-actions'

import { BASE } from '@/app/reducers/baseReducer/baseReducer'
import type * as ICommonServer from '@/app/service/commonServer'
import * as commonServer from '@/app/service/commonServer'

import { IActionPromise } from '../utils/request'

export const getBookStore = (data: ICommonServer.IBookStoreParams): IActionPromise<ICommonServer.IBookStoreResponse> =>
    createAction(BASE.POST_BOOK_STORE, () => commonServer.bookStore(data))()
export const getMyBooks = (): IActionPromise<ICommonServer.IMyBockResponse> => createAction(BASE.GET_MY_BOOK, () => commonServer.myBooks())()
export const getUserInfo = (): IActionPromise<ICommonServer.IUserInfoResponse> => createAction(BASE.GET_USER_INFO, () => commonServer.userInfo())()
export const setUserInfo = (): IActionPromise<ICommonServer.IUserInfoResponse> => createAction(BASE.SET_USER_INFO)()
