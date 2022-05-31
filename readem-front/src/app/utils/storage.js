function Storage(prefix, expire) {
    this.prefix = prefix || ''

    if (typeof window === 'undefined') {
        return console.warn('no find window')
    }

    if (expire === -1) {
        this.driver = window.sessionStorage
    } else {
        this.driver = window.localStorage
        this.expire = expire || 0
    }
}

Storage.prototype = {
    constructor: Storage,

    _key(key) {
        return this.prefix + key
    },

    keys() {
        const keys = Object.keys(this.driver)

        if (this.prefix) {
            const index = this.prefix.length

            return keys.map(function (key) {
                return key.substring(index)
            })
        }

        return keys
    },

    remove(key) {
        this.driver.removeItem(this._key(key))
    },

    clear() {
        this.driver.clear()
    },

    set(key, value, expire) {
        const data = {
            value
        }

        if (typeof expire === 'undefined') {
            expire = this.expire
        }

        if (expire) {
            data.expire = Date.now() + expire * 1000
        }

        this.driver.setItem(this._key(key), JSON.stringify(data))
    },

    get(key) {
        let data = this.driver.getItem(this._key(key))

        if (data) {
            data = JSON.parse(data)

            if (data.expire) {
                if (data.expire < Date.now()) {
                    this.remove(key)
                    data = null
                }
            }
        }

        return data && data.value
    }
}
export default new Storage(null, 10 * 365 * 24 * 60 * 60)
