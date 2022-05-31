import { AxiosResponse } from 'axios'

import { request } from '../utils/request'

export interface coinPrice {
    address: string
    price: string
}

export function getBookTxt(url: string): Promise<AxiosResponse<Blob>> {
    return request(url, {
        method: 'GET',
        responseType: 'blob'
    })
}
