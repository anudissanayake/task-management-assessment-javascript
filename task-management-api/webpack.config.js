import path from "path";

export default {
  mode: "production",
  entry: "./src/handler.js", //app's entry file
  target: "node",
  output: {
    path: path.resolve("dist"),
    filename: "server.js", // Output bundled file
    libraryTarget: "commonjs2",
  },
  externals: [/^aws-sdk/],
  resolve: {
    extensions: ['.js'],
  },
};
