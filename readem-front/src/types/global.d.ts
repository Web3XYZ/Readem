/** Global definitions for development **/

// for style loader
declare module '*.json' {
    const content: any
    export default content
}

declare module '*.styl' {
    const classes: { [key: string]: string }
    export default classes
}

declare module '*.stylus' {
    const classes: { [key: string]: string }
    export default classes
}

declare module '*.svg' {
    const content: any
    export default content
}

declare module '*.png' {
    const content: any
    export default content
}

// Omit type https://github.com/Microsoft/TypeScript/issues/12215#issuecomment-377567046
// type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
type PartialPick<T, K extends keyof T> = Partial<T> & Pick<T, K>

interface Window {
    ethereum: any
    web3: any
}
