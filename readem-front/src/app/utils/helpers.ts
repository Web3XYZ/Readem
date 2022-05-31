export function getSlideAngle(dx: number, dy: number): number {
    return (Math.atan2(dy, dx) * 180) / Math.PI
}

export function getSlideDirection(startX: number, startY: number, endX: number, endY: number): number {
    const dy = startY - endY
    const dx = endX - startX
    let result = 0

    if (Math.abs(dx) < 2 && Math.abs(dy) < 2) {
        return result
    }

    const angle = getSlideAngle(dx, dy)

    if (angle >= -45 && angle < 45) {
        result = 4 // right
    } else if (angle >= 45 && angle < 135) {
        result = 1 // up
    } else if (angle >= -135 && angle < -45) {
        result = 2 // down
    } else if ((angle >= 135 && angle <= 180) || (angle >= -180 && angle < -135)) {
        result = 3 // left
    }

    return result
}

export function getStrLen(str: string): number {
    let len = 0
    for (let i = 0; i < str.length; i++) {
        const c = str.charCodeAt(i)
        if ((c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f)) {
            len++
        } else {
            len += 2
        }
    }
    return len
}

export const splitTextsByLen = (texts: string[], len: number): string[][] => {
    const arr = []

    let index = 0
    while (index < texts.length) {
        arr.push(texts.slice(index, (index += len)))
    }

    return arr
}

export async function measureText(text: string, font: string, lineHeight: number): Promise<{ width: number; height: number }> {
    const fontFace = new FontFace('Golos-UI_Regular', 'url(./font/Golos-UI_Regular.ttf)')
    const res = await fontFace.load()
    document.fonts.add(res)

    const span = document.createElement('span')
    span.appendChild(document.createTextNode(text))
    Object.assign(span.style, {
        font: font,
        margin: '0',
        padding: '0',
        border: '0',
        lineHeight: `${lineHeight}px`,
        display: 'inline-block'
    })
    document.body.appendChild(span)
    const { width, height } = span.getBoundingClientRect()
    span.remove()
    return { width, height }
}

export function isPureChinese(str?: string): boolean {
    if (!str) return false
    return /^[\u4E00-\u9FA5]+$/.test(str)
}

export function trim(src: string): string {
    return src.replace(/(^\s*)|(\s*$)/g, '')
}

export function trimHead(src: string): string {
    return src.replace(/(^\n*)/, '')
}

const divs = [' ', ',', '.', ';', '?', '!', '"']
export function tailAnkorText(src: string, begin: number, offset: number): number {
    if (src.length <= 0 || begin < 0 || offset <= 0) {
        return -1
    }
    const to = begin + offset + 1
    if (to >= src.length) {
        return src.length
    }
    const text = src.slice(begin, to)

    let ankor = 0
    divs.forEach(c => {
        const temp = text.lastIndexOf(c)
        if (temp > ankor) {
            ankor = temp
        }
    })
    if (ankor == 0) {
        ankor = tailAnkorText(text, begin, to + 1)
    }

    return ankor
}

function headAnkorText(src: string, begin: number, offset: number) {
    if (src.length <= 0 || begin < 0 || offset <= 0) {
        return -1
    }
    const to = begin + offset - 1
    if (to >= src.length) {
        return src.length
    }
    const text = src.slice(begin, to)

    let ankor = 0
    divs.forEach(c => {
        const temp = text.lastIndexOf(c)
        if (temp > ankor) {
            ankor = temp
        }
    })
    if (ankor == 0) {
        //console.log("textSplit error!, src=", text, begin, to - 1, offset)
        if (to <= src.length - 20) {
            return offset
        }
        ankor = headAnkorText(text, begin, to - 1)
    }

    return ankor
}

export function textSplit(texts: string[], srcText: string, length: number) {
    if (srcText.length <= 0) {
        console.log('end!')
        return
    }
    // const texts = []
    let start = 0
    let text = ''
    let ankor = 0
    srcText = trim(srcText)
    while (start <= srcText.length) {
        ankor = tailAnkorText(srcText, start, length)
        if (ankor < 0) {
            console.log('ankor error !', start, srcText)
            break
        }
        const offset = start + ankor + 1
        text = srcText.slice(start, offset)

        //for aequilate font
        let src = textAlignLength(trimHead(text), length)
        start = offset - (text.length - src.length)
        texts.push(trimHead(src))

        // start = offset
        // texts.push(trim(text))
    }
}

export function textSplitEx(srcText: string, lines: number, numbers: number): string[] {
    // console.log(">>>>>>", srcText, lines, numbers, srcText.length)
    let count = 0
    let i = 0
    // let page = 0
    const pageTexts = []
    let start = 0
    while (i < srcText.length) {
        if (srcText[i] == '\n' || srcText[i] == '\r') {
            if (i > 0 && (srcText[i - 1] == '\n' || srcText[i - 1] == '\r')) {
                count += 1
            } else {
                count += numbers
                //console.log(">>>>count jump", count, numbers, srcText.slice(i - 10, i))
            }
        } else {
            count += 1
        }
        i++
        //console.log(lines * numbers,count,start, i)
        if (count >= lines * numbers) {
            // console.log('>>>>', lines * numbers, count, start, i, srcText.slice(i - 10, i))

            let temp = srcText.slice(start, i)
            const ankor = headAnkorText(srcText, start, i - start)

            // console.log('ankor>>>>', ankor)

            const offset = start + ankor + 1
            temp = srcText.slice(start, offset)

            pageTexts.push(trimHead(temp))
            count = 0
            start = offset
            //refix
            i = offset
        }
    }

    // console.log('>>>>', lines * numbers, count, start, i, srcText.slice(i - 10, i))

    let tail = srcText.slice(start, i)
    tail = trim(tail)

    if (tail.length > 0) {
        const temp = srcText.slice(start, i)
        pageTexts.push(trimHead(temp))
    }

    // console.log('pages', pageTexts.length)

    return pageTexts
}

export function textSplitPage(srcText: string, numbers: number): string[] {
    const textLines = srcText.split('\n\n')
    const finalLines = []

    for (let i = 0; i < textLines.length; i++) {
        textSplit(finalLines, textLines[i], numbers)
        finalLines.push('<br />')
    }
    return finalLines
}

export function isUpperCase(ch: string) {
    return ch >= 'A' && ch <= 'Z'
}

export function textAlignLength(src: string, maxLength: number) {
    let alignlength = 0
    let i = 0
    while (i < src.length) {
        if (src[i] === 'W' || src[i] === 'M') {
            alignlength += 2
            // logger.info("2",src[i],alignlength)
        } else if (src[i] === 'i' || src[i] === 'j' || src[i] === 'l' || src[i] === 'I' || src[i] === '1') {
            alignlength += 0.7
            // logger.info("0.5",src[i],alignlength)
        } else if (isUpperCase(src[i]) || src[i] === 'w' || src[i] === 'm') {
            alignlength += 1.3
            // logger.info("1.5",src[i],alignlength)
        } else {
            alignlength += 1
            //console.log(alignlength)
        }
        i++
    }

    //console.log(alignlength)

    let extra = alignlength - maxLength
    if (extra > 0) {
        let ankor = tailAnkorText(src, 0, src.length - extra - 1)
        if (ankor < 0) {
            return src
        }
        let text = src.slice(0, ankor + 1)
        //console.log("!!!", alignlength, src, text, src.length,ankor, maxLength)
        return text
    }

    return src
}

export function splitChapterToPageLines(srcText: string, pageLines: number, numbers: number): string[][] {
    // console.log('>>>>>>>', pageLines, numbers)

    const lines = srcText.split('\n\n')
    const allLines = []
    for (const key in lines) {
        const line = trim(lines[key])
        if (line.length > 0) {
            textSplit(allLines, lines[key], numbers)
            allLines.push('<br />')
        }
    }
    allLines.pop()

    const finalLines = []
    let index = 0
    while (index < allLines.length) {
        finalLines.push(allLines.slice(index, (index += pageLines)))
    }
    return finalLines
}
