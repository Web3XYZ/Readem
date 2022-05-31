import Dexie, { Table } from 'dexie'

import { IChapter as IChapterItem } from '@/app/service/commonServer'

export interface IRecord {
    pageIndex: number
    chapterIndex: number
    pageCount: number
    index: number
    maxChapter: number
}

export interface ISlide extends IRecord {
    text: string[]
}

export interface IBooks {
    id?: number
    bookID: string
    name: string
    author: string
    description: string
    tags: {
        tag_name: string
    }[]
    cover_image: string
    chapters: IChapterItem[]
    loadedChapters: string[]
    record: IRecord
    recordArr: ISlide[][]
    fontInfo: {
        width: number
        height: number
    }
}

class DB extends Dexie {
    books!: Table<IBooks>

    constructor() {
        super('readerDB')
        this.version(2).stores({
            books: `++id, bookID, name, author, description, chapters, tags, cover_image, loadedChapters, record, recordArr, fontInfo`
        })
    }
}

export const db = new DB()
