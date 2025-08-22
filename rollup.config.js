// rollup.config.js
import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import multiEntry from "@rollup/plugin-multi-entry";

export default {
  input: ["src/**/*.js"],
  output: {
    file: "dist/bundle.js",
    format: "iife",
    name: "planetLLM",
  },
  plugins: [
    multiEntry(),
    resolve(),
    commonjs(),
    json(), // lets you import JSON files
  ],
};
