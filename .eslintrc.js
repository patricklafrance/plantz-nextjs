module.exports = {
    extends: "next/core-web-vitals",
    plugins: ["sort-destructure-keys", "sort-keys-fix", "typescript-sort-keys"],
    rules: {
        indent: ["error", 4, { SwitchCase: 1 }],
        quotes: ["error", "double"],
        semi: ["error", "always"],
        "sort-destructure-keys/sort-destructure-keys": "error",
        "sort-keys-fix/sort-keys-fix": ["error", "asc", { natural: true }],
        "typescript-sort-keys/interface": ["error", "asc", { natural: true }],
    },
};
