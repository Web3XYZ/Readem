import { IPromise, request } from '@/app/utils/request'

export interface IUserNft {
    id: number
    created_at: string
    user_id: number
    locked: boolean
    lock_reason: string
    lock_at: string
    gene: string
    earn_base: string
    level: number
    exp: number
    patience: number
    rare: number
    hatch: number
    intelligence: number
    lucky: number
    brave: number
    back_ground: string
    eyes: string
    hat: string
    image: string
    auction: string
}

export interface IList<T> {
    items: T
    page: number
    size: number
    max_page: number
    total_pages: number
    total: number
    last: boolean
    first: boolean
    visible: number
}

export interface IGetNftAuctionParams {
    page?: number
    size?: number
    done?: number
    user_id?: number
}

export type IGetNftAuctionResponse = IList<IGetNftAuctionResponseItem[]>

export interface IOwl {
    id: number
    created_at: string
    user_id: number
    locked: boolean
    lock_reason: string
    lock_at: string
    lock_end_at: string
    gene: string
    earn_base: string
    level: number
    exp: number
    patience: number
    rare: number
    hatch: number
    intelligence: number
    lucky: number
    brave: number
    back_ground: string
    eyes: string
    hat: string
    image: string
    levelup_cost: string
    auction: string
    glasses: string
}

export interface IGetNftAuctionResponseItem {
    id: number
    created_at: string
    user_id: number
    user_nft_id: number
    nft_type: string
    base_price: string
    duration: number
    done: boolean
    done_at: string
    done_reason: string
    owl: IOwl
    egg: string
    glasses: string
}

export function getNftAuction(data?: IGetNftAuctionParams): IPromise<IList<IGetNftAuctionResponseItem[]>> {
    return request('/nft/auction', {
        method: 'GET',
        params: {
            ...data
        }
    })
}

export interface IPostNftAuctionParams {
    base_price: number
    duration: number
    user_nft_id: number
}

export type IPostNftAuctionResponse = null | string

export function postNftAuction(data: IPostNftAuctionParams): IPromise<IPostNftAuctionResponse> {
    return request(`/nft/auction`, {
        method: 'POST',
        data
    })
}

export interface IPostNftAuctionBibParams {
    auction_id: number
    bid_price: number
}

export type IPostNftAuctionBibResponse = null | string

export function postNftAuctionBib(data: IPostNftAuctionBibParams): IPromise<IPostNftAuctionBibResponse> {
    return request(`/nft/auction/bid`, {
        method: 'POST',
        data
    })
}

export type IDeleteNftAuctionResponse = null | string

export function deleteNftAuction(ID: number): IPromise<IDeleteNftAuctionResponse> {
    return request(`/nft/auction/${ID}`, {
        method: 'DELETE'
    })
}

export interface IGetNftMineParams {
    page?: number
    size?: number
    lock_reason?: string
}

export type IGetNftMineResponse = IList<IUserNft[]>

export function getNftMine(data?: IGetNftMineParams): IPromise<IGetNftMineResponse> {
    return request('/nft/mine', {
        method: 'GET',
        params: {
            ...data
        }
    })
}

export interface IPostNftMintResponse {
    id: number
    created_at: string
    updated_at: string
    user_id: number
    locked: boolean
    lock_reason: string
    lock_at: string
    gene: string
    earn_base: number
}

export function postNftMint(): IPromise<IUserNft> {
    return request(`/nft/mint`, {
        method: 'POST'
    })
}

export interface IGetNftStakedParams {
    auction_id: number
    bid_price: number
}

export type IGetNftStakedResponse = IList<IUserNft[]>

export function getNftStaked(data?: IGetNftStakedParams): IPromise<IGetNftStakedResponse> {
    return request('/nft/staked', {
        method: 'GET',
        params: {
            ...data
        }
    })
}

export type IPostNftStakeResponse = null | string

export function postNftStake(user_nft_id: number): IPromise<IPostNftStakeResponse> {
    return request(`/nft/stake/${user_nft_id}`, {
        method: 'POST'
    })
}

export type IPostNftWithdrawResponse = null | string

export function postNftWithdraw(user_nft_id: number): IPromise<IPostNftWithdrawResponse> {
    return request(`/nft/withdraw/${user_nft_id}`, {
        method: 'POST'
    })
}

export interface IGetWalletAddressResponse {
    user_id: number
    chain_id: number
    address: string
}

export function getWalletAddress(): IPromise<IGetWalletAddressResponse> {
    return request(`/wallet_address`, {
        method: 'GET'
    })
}

export interface IPostWalletAddress {
    address: string
    chain_id: number
    email: string
    sign: string
}

export function postWalletAddress(data: IPostWalletAddress): IPromise<IPostNftWithdrawResponse> {
    return request(`/wallet_address`, {
        method: 'POST',
        data
    })
}

export interface IGetTokenHistoryParams {
    page?: number
    size?: number
    token?: number
}

export interface IGetTokenHistoryResponse {
    first: boolean
    items: IGetTokenHistoryResponseItem[]
    last: boolean
    max_page: number
    page: number
    size: number
    total: number
    total_pages: number
    visible: number
}

export interface IGetTokenHistoryResponseItem {
    block_number: number
    cancel: boolean
    confirm_at: number
    confirmed: boolean
    contract: string
    created_at: string
    from: string
    history_type: string
    id: number
    symbol: string
    to: string
    tx: string
    updated_at: string
    value: string
}

export function getTokenHistory(chainId: number, data?: IGetTokenHistoryParams): IPromise<IGetTokenHistoryResponse> {
    return request(`/token/history/${chainId}`, {
        method: 'GET',
        params: {
            ...data
        }
    })
}

export interface IGetTokenDepositInfoResponse {
    chain_id: number
    contract: string
    deposit_address: string
}

export function getTokenDepositInfo(chainId: number): IPromise<IGetTokenDepositInfoResponse> {
    return request(`/token/deposit_info/${chainId}`, {
        method: 'GET'
    })
}

export function postTokenWithdraw(chainId: number, amount: number): IPromise<void> {
    return request(`/token/withdraw/${chainId}/${amount}`, {
        method: 'POST'
    })
}

export interface IGetNFTByIdResponse {
    id: number
    created_at: string
    user_id: number
    locked: boolean
    lock_reason: string
    lock_at: string
    gene: string
    earn_base: string
    level: number
    exp: number
    patience: number
    rare: number
    hatch: number
    intelligence: number
    lucky: number
    brave: number
    back_ground: string
    eyes: string
    hat: string
    image: string
}

export function getNFTById(id: string): IPromise<IGetNFTByIdResponse> {
    return request(`/nft/${id}`, {
        method: 'get'
    })
}
