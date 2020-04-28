const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin-with-rtl");
const WebpackRTLPlugin = require("webpack-rtl-plugin");


module.exports = {
    mode: 'development',
    entry: './app/index.js',
    output: {
        filename: 'app.bundle.js',
        path: path.resolve(__dirname, 'public')
    },
    module: {
        rules: [
            {
                test: /\.(js)$/,
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                    },
                    "css-loader"
                ]
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "app.bundle.css",
            rtlEnabled: true,
            rtlGlobalVar: 'pageDir' // Value should be 'rtl' to activate RTL mode. If not specified, document.dir will be used instead
        }),
        new WebpackRTLPlugin() // You must not pass filename option
    ],

};