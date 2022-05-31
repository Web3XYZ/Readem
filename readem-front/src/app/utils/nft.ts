export const config = {
    bg: [
        '0001__0004s_0000_cos.png',
        '0001__0004s_0001_cos.png',
        '0001__0004s_0002_ds.png',
        '0002__0004s_0000_cos (2).png',
        '0002__0004s_0000_cos.png',
        '0003_0004s_0000_cos.png'
    ],
    '0.tail': ['0001__0003s_0010_tail.png', '0001__0003s_0011_tail.png', '0002__0003s_0005_tail.png', '0003_0003s_0004_tail.png'],
    '1.body': ['0001__0003s_0007_body copy01.png', '0001__0003s_0008_body copy06.png', '0001__0003s_0009_body 02.png', '0002__0003s_0003_body.png'],
    '2.abdomen': [
        '0001__0003s_0002_abd-copy.png',
        '0001__0003s_0003_abd.png',
        '0002__0003s_0001_abd (2).png',
        '0002__0003s_0001_abd.png',
        '0003_0003s_0001_abd.png'
    ],
    '3.eye': ['0001__0002_eye.png', '0001__0003s_0000_eye.png', '0001__0003s_0001_eye.png'],
    '4.beak': [
        '0001__0003_beak.png',
        '0001__0004_beak.png',
        '0002__0002_beak (2).png',
        '0002__0002_beak.png',
        '0003_0002_beak.png',
        '0003__0002_beak.png'
    ],
    '5.cheak': [
        '0001__0001s_0003_CHEAK.png',
        '0002__0001s_0000_CHEAK (2).png',
        '0002__0001s_0000_CHEAK.png',
        '0003_0001s_0000_CHEAK.png',
        '0003__0001s_0000_CHEAK.png'
    ],
    '6.head': [
        '0001__0001s_0000_alt.hat.png',
        '0001__0001s_0002_hat.png',
        '0002__0001s_0001_Layer-2 (2).png',
        '0002__0001s_0001_Layer-2.png',
        '0003_0001s_0002_Layer-2.png',
        '0003__0001s_0001_Layer-2.png'
    ],
    '7.cloth': ['0001__0000s_0000_CLOTH.png', '0002__0000s_0001_CLOTH.png'],
    '8.neck': ['0002__0000s_0000_Layer-4.png', '0003_0000s_0000_Layer-4.png'],
    '9.leg': ['0001__0000_leg.png']
}

export async function imgLoad(src: string): Promise<HTMLImageElement> {
    const img = new Image()
    img.src = src
    img.setAttribute('crossOrigin', 'anonymous')
    return await new Promise(resolve => {
        img.onload = async () => {
            resolve(img)
        }
    })
}

export function dataURLtoBlob(dataUrl: string): Blob | void {
    const arr = dataUrl.split(',')
    if (arr && arr[0]) {
        const tmp = arr[0].match(/:(.*?);/)
        if (tmp) {
            const mime = tmp[1]
            // const bstr = atob(arr[1]) // atob deprecated
            const bstr = Buffer.from(arr[1], 'utf8').toString('base64')
            let n = bstr.length
            const u8arr = new Uint8Array(n)
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n)
            }
            return new Blob([u8arr], { type: mime })
        }
    }
}

export async function generateImg(arr: string[]): Promise<string> {
    const canvas = document.createElement('canvas') as HTMLCanvasElement
    const ctx = canvas.getContext('2d')
    canvas.width = 600
    canvas.height = 600
    if (ctx) {
        for (let index = 0; index < arr.length; index++) {
            const img = await imgLoad(arr[index])
            ctx.drawImage(img, 0, 0, 600, 600)
        }
    }
    return canvas.toDataURL('image/jpeg', 0.7)
}

function random(lower: number, upper: number): number {
    return Math.floor(Math.random() * (upper - lower + 1)) + lower
}

export function randomHashString(len: number): string {
    let hash = ''
    for (let i = 0; i < len; i++) {
        const num = random(0, 16)
        hash += num.toString(16)
    }
    return hash
}

export function genByGene(gene: string): string[] {
    const imgs = []
    let offset = 1
    for (const key in config) {
        const num = parseInt(gene[gene.length - 1 * offset], 16)
        const range = num % config[key].length
        const r = random(0, range - 1)
        imgs.push(`./img/nft/${key}/${config[key][r]}`)
        offset += 2
    }
    return imgs
}
