// interface IAction<T> {
//     payload: {
//         data: T
//     }
//     error?: boolean
// }

// interface IActionList<T> {
//     payload: {
//         data: IList<T>
//     }
//     error?: boolean
// }

// interface IList<T> {
//     index: number
//     page_size: number
//     total: number
//     list: T
// }

// interface IListParams {
//     index: number
//     page_size: number
// }

interface IResponse<T> {
    status: number
    data?: T
    msg: string
    error?: string
}

interface IContent<T> {
    message: string
    code: number
    data: T
}

interface IAction {
    payload: IContent<any>
    error?: boolean
}

type Action = import('redux-actions').definitions
type AxiosResponse = import('axios').definitions

type IPromise<T> = Action<Promise<AxiosResponse<IContent<T>>>>
