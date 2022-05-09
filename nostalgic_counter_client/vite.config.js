const path = require("path");
const { defineConfig } = require("vite");

module.exports = defineConfig({
  build: {
    minify: false,
    lib: {
      //   entry: path.resolve(__dirname, "lib/main.js"),
      entry: path.resolve(__dirname, "./src/main.ts"),
      name: "MyLib",
      fileName: (format) => `nostalgic_counter.${format}.js`,
    },
    rollupOptions: {
      // ライブラリにバンドルされるべきではない依存関係を
      // 外部化するようにします
      //   external: ['vue'],
      external: [],
      output: {
        // 外部化された依存関係のために UMD のビルドで使用する
        // グローバル変数を提供します
        globals: {
          //   vue: "Vue",
        },
      },
    },
  },
});
