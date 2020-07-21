module.exports = function (api) {
    return {
        presets: [
            [
                "@babel/preset-env",
                {
                    targets: ["defaults"],
                },
            ],
            "@babel/preset-react",
            "@babel/preset-typescript",
        ],
        plugins: [
            api.env("development") && "react-refresh/babel",
            "@babel/plugin-syntax-dynamic-import",
            ["@babel/plugin-transform-typescript", { isTSX: true }],
            ["@babel/plugin-proposal-decorators", { legacy: true }],
            ["@babel/plugin-proposal-class-properties", { loose: true }],
            ["@babel/plugin-transform-runtime", { corejs: 3, proposals: true }],
        ].filter(Boolean),
    };
};
