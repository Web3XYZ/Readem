/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const webpack = require('webpack')
const WebpackBar = require('webpackbar')
// const AntdDayjsWebpackPlugin = require('antd-dayjs-webpack-plugin')
const { cssLoader } = require('./utils/cssLoader')

module.exports = {
    entry: {
        main: './src/index'
    },
    output: {
        filename: '[name].[contenthash:8].bundle.js',
        path: path.resolve(__dirname, '../dist'),
        clean: true
    },
    plugins: [
        // new AntdDayjsWebpackPlugin(),
        new webpack.IgnorePlugin({
            resourceRegExp: /^\.\/locale$|^\.\/lib\/chart\/(.)*/,
            contextRegExp: /moment$|echarts$/
        }),
        new WebpackBar(),
        new HtmlWebpackPlugin({ template: './public/index.html' }),
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // all options are optional
            filename: '[name].[contenthash:8].bundle.css',
            chunkFilename: '[id].[contenthash:8].chunk.css',
            ignoreOrder: false // Enable to remove warnings about conflicting order
        }),
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer']
        })
    ],
    module: {
        rules: [
            {
                test: /\.(ts|tsx|js|jsx)?$/,
                exclude: /node_modules/,
                include: [path.resolve(__dirname, '../src/')],
                use: ['babel-loader']
            },
            ...cssLoader(),
            ...cssLoader('less', {
                lessOptions: {
                    javascriptEnabled: true
                }
            }),
            ...cssLoader('stylus', {
                webpackImporter: false,
                stylusOptions: {
                    import: [path.resolve(__dirname, '../src/assets/stylus/lib/mixin.styl')]
                }
            }),
            {
                test: /\.(eot|ttf|otf|woff|woff2|svg?)$/,
                include: path.resolve(__dirname, '../src/assets/fonts'),
                type: 'asset/resource'
            },
            {
                test: /\.(gif|png|jpe?g|webp|svg|ico)$/i,
                include: [path.resolve(__dirname, '../src/app'), path.resolve(__dirname, '../src/assets/images')],
                type: 'asset',
                parser: {
                    dataUrlCondition: {
                        maxSize: 8 * 1024
                    }
                }
            },
            {
                test: /\.svg$/,
                include: path.resolve(__dirname, '../src/assets/icons'),
                use: [
                    { loader: 'svg-sprite-loader', options: {} },
                    {
                        loader: 'svgo-loader',
                        options: {
                            plugins: [
                                {
                                    name: 'removeAttrs',
                                    params: { attrs: 'fill' }
                                }
                            ]
                        }
                    }
                ]
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', 'jsx'],
        alias: {
            '@': path.resolve(__dirname, '../src')
        },
        fallback: {
            os: require.resolve('os-browserify/browser'),
            https: require.resolve('https-browserify'),
            http: require.resolve('stream-http'),
            stream: require.resolve('stream-browserify'),
            path: false,
            assert: require.resolve('assert/'),
            fs: false,
            // net: false,
            // tls: false,
            // zlib: false,
            // crypto: false,
            buffer: require.resolve('buffer/'),
            crypto: require.resolve('crypto-browserify')
            // zlib: require.resolve('browserify-zlib'),
        }
    }
}
