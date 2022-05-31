import axios, { AxiosResponse } from 'axios'

import { checkStatus } from './request'

export async function requestText(reqUrl: string): Promise<AxiosResponse> {
    const response = await axios(reqUrl, {
        method: 'GET',
        responseType: 'blob',
        headers: null
    })
        .then(checkStatus)
        .catch(err => {
            throw err
        })
    return response
}

export function fileLoad(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsText(blob)
        reader.onload = result => {
            if (result.target) {
                resolve(result.target.result as string)
            }
        }
    })
}

export default async (url: string): Promise<string> => {
    const res = await requestText(url)
    return await fileLoad(res.data)
}
