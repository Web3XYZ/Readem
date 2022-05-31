import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import type { Action } from 'redux-actions'

import { serverUrl } from '@/app/utils/config'

import storage from './storage'

axios.defaults.baseURL = serverUrl
axios.defaults.withCredentials = false

export function checkStatus(response: AxiosResponse): AxiosResponse {
    if (response.status >= 200 && response.status < 300) {
        return response
    }
    const error = new Error(response.statusText)
    throw error
}

export async function request(reqUrl: string, options: AxiosRequestConfig = { method: 'GET' }): Promise<AxiosResponse> {
    if (!/sign_in|sign_up|sign_up_code/.test(reqUrl)) {
        axios.defaults.headers.common['Authorization'] = storage.get('header') ? storage.get('header') : ''
    }
    axios.defaults.headers.common['Locale'] = (storage.get('language') ? storage.get('language') : 'en_US').replace(/_/, '-').toLowerCase()
    const response = await axios(reqUrl, options)
        .then(checkStatus)
        .catch(err => {
            throw err
        })
    return response
}

export const handleRequestError = (error: unknown, callback: () => void): void => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
        callback()
    } else {
        throw error
    }
}

export type IActionPromise<T> = Action<Promise<AxiosResponse<IContent<T>>>>
export type IPromise<T> = Promise<AxiosResponse<IContent<T>>>
