import BigNumber from 'bignumber.js'

BigNumber.config({ EXPONENTIAL_AT: 1e9 })

export const isMobile = /(iPhone|iPad|iPod|iOS|Android|Linux armv8l|Linux armv7l|Linux aarch64)/i.test(window.navigator.platform)
// export const isMobile = true

export const eX = (value: any, x: any): BigNumber => {
    return new BigNumber(`${value}e${x}`)
}

export function pow10(num: number | string | undefined, decimals = 18): string {
    if (!num) return '0'
    return new BigNumber(num).dividedBy(new BigNumber(10).pow(decimals)).toFixed()
}

export function bnPow10(num: number | string | undefined, decimals = 18): BigNumber {
    if (!num) return new BigNumber(0)
    return new BigNumber(num).multipliedBy(new BigNumber(10).pow(decimals))
}

export const formatDecimal = (number: number, decimal = 2): string => {
    if (number === undefined) return ''
    let num = number.toString()
    const index = num.indexOf('.')
    if (index !== -1) {
        num = num.substring(0, decimal + index + 1)
    } else {
        num = num.substring(0)
    }
    return parseFloat(num).toFixed(decimal)
}

export const formatMoney = (value: number, n = 2): string => {
    // eslint-disable-next-line no-restricted-globals
    if (isNaN(Number(value))) return Number(0).toFixed(n > 0 ? n : 0)
    if (value === 0) return '0.00'
    const isNegative = value < 0
    const v = formatDecimal(Math.abs(Number(value)), n > 0 ? n : 0)
    const l = v.split('.')[0].split('').reverse()
    const r = v.split('.')[1]
    let t = ''
    for (let i = 0; i < l.length; i++) {
        t += l[i] + ((i + 1) % 3 === 0 && i + 1 !== l.length ? ',' : '')
    }
    // eslint-disable-next-line prefer-template
    const res = t.split('').reverse().join('') + `${r && r !== '00' ? '.' + r : ''}`
    return `${isNegative ? '-' : ''}${res}`
}

export function getShortenAddress(address: string): string {
    if (!address) return ''
    const firstCharacters = address.substring(0, 6)
    const lastCharacters = address.substring(address.length - 4, address.length)
    return `${firstCharacters}...${lastCharacters}`
}

export function getShortenAddress2(address: string): string {
    const firstCharacters = address.substring(0, 10)
    const lastCharacters = address.substring(address.length - 10, address.length)
    return `${firstCharacters}****${lastCharacters}`
}

export function filterInput(val: string): string {
    const v = val
        .replace('-', '')
        .replace(/^\.+|[^\d.]/g, '')
        .replace(/^0\d+\./g, '0.')
        .replace(/\.{6,}/, '')
        .replace(/^0(\d)/, '$1')
        .replace(/^(\-)*(\d+)\.(\d{0,6}).*$/, '$1$2.$3')
    return Number(v) >= 0 ? v : ''
}

export const convertToLargeNumberRepresentation = (value: BigNumber): string => {
    if (!value) {
        return '0'
    } else if (+value >= 1e5) {
        return `${eX(value.toString(), -6)}M`
    } else if (+value >= 1e2) {
        return `${eX(value.toString(), -3)}K`
    } else {
        return value.toString()
    }
}
