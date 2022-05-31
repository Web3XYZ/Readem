import { bookDetail } from '@/app/service/commonServer'
import { isPureChinese, measureText } from '@/app/utils/helpers'

import { db, IBooks } from './indexedDB'

export default async (bookID: string, isAddCache = true): Promise<{ data: IBooks | undefined; isCache: boolean }> => {
    let book: IBooks
    const cache = await db.books.get({ bookID })
    let isCache = false
    if (!cache) {
        const res = await bookDetail(bookID)
        const { name, chapters, description, author, tags, cover_image } = res.data.data
        const fontInfo = await measureText(isPureChinese(name) ? '一' : '1', `18px Golos-UI_Regular`, 24) //Outfit todo
        book = {
            bookID,
            name,
            author,
            chapters,
            description,
            tags,
            cover_image,
            loadedChapters: new Array(chapters.length).fill(null),
            record: {
                pageIndex: 0,
                chapterIndex: 0,
                pageCount: 1,
                index: 0,
                maxChapter: chapters.length
            },
            recordArr: new Array(chapters.length).fill([]),
            fontInfo
        }
        if (isAddCache) {
            await db.books.add(book)
        }
    } else {
        book = cache
        isCache = true
    }
    return {
        data: book,
        isCache
    }
}
