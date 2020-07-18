import { Configuration, DefinePlugin, HotModuleReplacementPlugin, ProgressPlugin } from "webpack";
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import CaseSensitivePathsPlugin from "case-sensitive-paths-webpack-plugin";
import ReactRefreshWebpackPlugin from "@pmmmwh/react-refresh-webpack-plugin";
import path from "path";
import WebpackDevServer from "webpack-dev-server";

const config: Configuration & { devServer: WebpackDevServer.Configuration } = {
    mode: "development",
    devtool: "inline-source-map",
    entry: path.resolve(__dirname, "../src/demo/index.tsx"),
    output: {
        path: path.resolve(__dirname, "../../dist"),
        publicPath: "/",
        filename: `js/[name].js`,
        chunkFilename: `js/[name].chunk.js`,
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js", "jsx"],
        plugins: [new TsconfigPathsPlugin()],
    },
    devServer: {
        open: true,
        historyApiFallback: true,
        hot: true,
    },
    module: {
        rules: [
            { test: /\.(t|j)sx?$/, loader: "babel-loader", exclude: /node_modules/ },
            {
                test: /\.(png|jpg|jpeg|gif|svg)$/,
                use: [
                    {
                        loader: "url-loader",
                        options: {
                            limit: 8192,
                            name: "img/[name].[hash:8].[ext]",
                        },
                    },
                ],
            },
            {
                test: /\.(woff|woff2|eot|ttf)\??.*$/,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            name: "font/[name].[hash:8].[ext]",
                        },
                    },
                ],
            },
            {
                // 只对自己写的样式做 css module 处理
                test: /\.(css|less)$/,
                use: [
                    "style-loader",
                    {
                        loader: "css-loader",
                        options: {
                            importLoaders: 2,
                        },
                    },
                    {
                        loader: "postcss-loader",
                        options: {
                            ident: "postcss",
                            plugins: () => [
                                // eslint-disable-next-line global-require
                                require("postcss-flexbugs-fixes"),
                                // eslint-disable-next-line global-require
                                require("postcss-preset-env")({
                                    autoprefixer: {
                                        flexbox: "no-2009",
                                    },
                                    stage: 3,
                                }),
                            ],
                        },
                    },
                    {
                        loader: "less-loader",
                        options: {
                            lessOptions: {
                                javascriptEnabled: true,
                            },
                        },
                    },
                ],
            },
        ],
    },
    plugins: [
        new ForkTsCheckerWebpackPlugin(),
        new ProgressPlugin(),
        new HtmlWebpackPlugin({
            template: "public/index.html",
            favicon: "public/favicon.ico",
            inject: true,
        }),
        new CaseSensitivePathsPlugin(),
        new DefinePlugin({
            IS_DEVELOPMENT: JSON.stringify(true),
        }),
        new HotModuleReplacementPlugin(),
        new ReactRefreshWebpackPlugin(),
    ],
};

export default config;
