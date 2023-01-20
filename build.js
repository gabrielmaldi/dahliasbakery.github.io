const fs = require("fs");
const path = require("path");
const pug = require("pug");
const sass = require("sass");
const prettier = require("prettier");

// let images = fs.readdirSync("src/images").filter(file => file !== ".DS_Store").map(file => `images/${file}`);
let images = JSON.parse(fs.readFileSync("src/images.json"));
let sassSource = fs.readFileSync("src/site.scss", "utf8");
sassSource = sassSource.replace(/^\$imagesCount\:.*$/gm, `$imagesCount: ${images.length};`);

// staging
(function () {
  let html = pug.renderFile("src/index.pug", { compileDebug: true, images });
  html = prettier.format(html, { filepath: "index.html" });

  let sassOutput = sass.compileString(sassSource, { style: "expanded", sourceMap: true, loadPaths: ["src"] });
  let css = `${sassOutput.css}\n\n/*# sourceMappingURL=site.css.map */\n`;
  sassOutput.sourceMap.sources = sassOutput.sourceMap.sources.map(source => `../${path.basename(source)}`);
  let sourceMap = JSON.stringify(sassOutput.sourceMap);

  fs.rmSync("staging", { recursive: true, force: true });
  fs.mkdirSync("staging");
  fs.writeFileSync("staging/index.html", html, "utf8");
  fs.writeFileSync("staging/site.css", css, "utf8");
  fs.writeFileSync("staging/site.css.map", sourceMap, "utf8");
  fs.cpSync("src/images", "staging/images", { recursive: true, preserveTimestamps: true });
  fs.cpSync("src/favicon.ico", "staging/favicon.ico");
})();

// public
(function () {
  let html = pug.renderFile("src/index.pug", { compileDebug: false, images });

  let sassOutput = sass.compileString(sassSource, { style: "compressed", sourceMap: false, loadPaths: ["src"] });
  let css = `${sassOutput.css}\n`;

  fs.rmSync("public", { recursive: true, force: true });
  fs.mkdirSync("public");
  fs.writeFileSync("public/index.html", html, "utf8");
  fs.writeFileSync("public/site.css", css, "utf8");
  fs.cpSync("src/images", "public/images", { recursive: true, preserveTimestamps: true });
  fs.cpSync("src/favicon.ico", "public/favicon.ico");
})();
