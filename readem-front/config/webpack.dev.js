/* eslint-disable @typescript-eslint/no-var-requires */
const common = require('./webpack.config')
const { merge } = require('webpack-merge')
const path = require('path')

module.exports = merge(common, {
    mode: 'development',
    devtool: 'source-map',
    devServer: {
        host: '0.0.0.0',
        contentBase: 'public',
        port: 9000,
        open: true
    }
})
