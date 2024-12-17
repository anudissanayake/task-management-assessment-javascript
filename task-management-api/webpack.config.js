import path from "path";

export default {
    mode: "production",
  entry: "./src/server.js", // Replace with your app's entry file
  target: "node",
  output: {
    path: path.resolve("dist"),
    filename: "server.js", // Output bundled file
    libraryTarget: "commonjs2",
  },
  externals: [/^aws-sdk/], // Exclude AWS SDK to use Lambda's built-in version
};
