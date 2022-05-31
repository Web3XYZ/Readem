import { IPromise, request } from '@/app/utils/request'

export type ILogin = IContent<ISignUpResponse>

export interface ISignInParams {
    email: string
    code: string
    signin_type: 'code' | 'password' | ['code' | 'password']
}

export function login(data: ISignInParams): IPromise<ISignUpResponse> {
    return request('/sign_in', {
        method: 'POST',
        data
    })
}

export interface ISignUpParams {
    code: string
    email: string
    nickname: string
    password: string
}

export interface ISignUpResponse {
    username: string
    access_token: string
    token_type: string
    expires_in: number
    header: string
}

export function register(data: ISignUpParams): IPromise<ISignUpResponse> {
    return request(`/sign_up`, {
        method: 'POST',
        data
    })
}

export interface ISignUpCodeParams {
    email: string
}

export interface ISignUpCodeResponse {
    data: string
}

export function signUpCode(data: ISignUpCodeParams): IPromise<ISignUpCodeResponse> {
    return request('/sign_up_code', {
        method: 'GET',
        params: {
            ...data
        }
    })
}

export interface IUserInfoResponse {
    Id: number
    created_at: string
    updated_at: string
    user_name: string
    bio: string
    email: string
    head_img: string
    BgImg: string
    Twitter: string
    Facebook: string
    Ins: string
    Github: string
    Weibo: string
    Medium: string
    status: number
    top_seller: number
    top_buyer: number
    top_user: number
    score: number
    earn_score: number
    comments: string
}

export function userInfo(): IPromise<IUserInfoResponse> {
    return request('/user_info', {
        method: 'GET'
    })
}

export interface IBookStoreParams {
    category?: string
    page?: number
    size?: number
}

export interface IBookStoreResponseItem {
    id: number
    created_at: string
    updated_at: string
    name: string
    tag: string
    cover_image: string
    author: string
    state: string
    price: string
    category: string
    description: string
    index_name: string
    chapter_count: number
    page_count: number
    locale: string
}

export interface IBookStoreResponse {
    items: IBookStoreResponseItem[]
    page: number
    size: number
    max_page: number
    total_pages: number
    total: number
    last: boolean
    first: boolean
    visible: number
}

export function bookStore(data: IBookStoreParams): IPromise<IBookStoreResponse> {
    return request(`/book_store`, {
        method: 'GET',
        params: {
            ...data
        }
    })
}

export interface IBookStoreSearchParams {
    keyword: string
    page?: number
    size?: number
}

export function bookStoreSearch(data: IBookStoreSearchParams): IPromise<IBookStoreResponse> {
    return request('/book_store/search', {
        method: 'GET',
        params: {
            ...data
        }
    })
}

export interface IChapter {
    title: string
    chapter_index: number
    content_location: string
}

export interface IBookDetailResponse {
    id: number
    created_at: string
    name: string
    cover_image: string
    author: string
    state: string
    price: string
    category: string
    description: string
    index_name: string
    chapter_count: number
    page_count: number
    locale: string
    tags: {
        tag_name: string
    }[]
    chapters: IChapter[]
}

export function bookDetail(ID: string): IPromise<IBookDetailResponse> {
    return request(`/book/${ID}`, {
        method: 'GET'
    })
}

export interface IBookContentResponse {
    book: IBookDetailResponse
    chapter: {
        chapter_id: string
        data: string
    }
}

export function bookContent(ID: string, chapterID: string): IPromise<IBookContentResponse> {
    return request(`/books/${ID}/${chapterID}`, {
        method: 'GET'
    })
}

export interface ICategoryResponse {
    book: {
        author: string
        chapter_count: number
        created_at: string
        description: string
        id: number
        index_name: string
        locale: string
        name: string
        pic: string
        state: string
        tag: string
        updated_at: string
    }
    last_chapter_id: number
    last_read_at: string
}

export function getCategory(): IPromise<string[]> {
    return request(`/category`, {
        method: 'GET'
    })
}

export interface IMyBockResponseItem {
    book: {
        id: number
        created_at: string
        updated_at: string
        name: string
        cover_image: string
        author: string
        state: string
        price: string
        category: string
        description: string
        index_name: string
        chapter_count: number
        page_count: number
        locale: string
        tags: null
        chapters: null
    }
    last_chapter_index: string
    last_read_at: string
}

export interface IMyBockResponse {
    items: IMyBockResponseItem[]
    page: number
    size: number
    max_page: number
    total_pages: number
    total: number
    last: boolean
    first: boolean
    visible: number
}

export interface IMyBooksParams {
    page?: number
    size?: number
}

export function myBooks(data?: IMyBooksParams): IPromise<IMyBockResponse> {
    return request(`/my_books`, {
        method: 'GET',
        params: {
            ...data
        }
    })
}

export interface IPostMyBooks {
    book: {
        author: string
        chapter_count: number
        created_at: string
        description: string
        id: number
        index_name: string
        locale: string
        name: string
        pic: string
        state: string
        tag: string
        updated_at: string
    }
    last_chapter_id: number
    last_read_at: string
}

export function postMyBooks(ID: string): IPromise<IPostMyBooks> {
    return request(`/my_books/${ID}`, {
        method: 'POST'
    })
}

export interface IPostMyBooksChapter {
    book: {
        author: string
        chapter_count: number
        created_at: string
        description: string
        id: number
        index_name: string
        locale: string
        name: string
        pic: string
        state: string
        tag: string
        updated_at: string
    }
    last_chapter_id: number
    last_read_at: string
}

export function postMyBooksChapter(ID: string, chapterID: number): IPromise<IPostMyBooksChapter> {
    return request(`/book_chapter/${ID}/${chapterID}`, {
        method: 'POST'
    })
}

export interface IGetRecommendResponseItem {
    id: number
    created_at: string
    name: string
    cover_image: string
    author: string
    state: string
    price: string
    category: string
    description: string
    index_name: string
    chapter_count: number
    page_count: number
    locale: string
    tags: null
    chapters: null
}

export interface IGetRecommendParams {
    page?: number
    size?: number
}

export function getRecommend(data?: IGetRecommendParams): IPromise<IGetRecommendResponseItem[]> {
    return request(`/recommend_book`, {
        method: 'GET',
        params: {
            ...data
        }
    })
}

export interface IDeleteBooks {
    book_ids: number[]
}

export function deleteBooks(data?: IDeleteBooks): IPromise<any> {
    return request(`/delete_books`, {
        method: 'POST',
        data
    })
}
