import path from "path";
import { extractClassNames } from "./utils/extractClassNames.js";
import { kebabToCamel } from "./utils/kebabToCamel.js";
import { minifyCSS } from "./utils/minifyCSS.js";
import * as fs from "fs/promises";

const javascriptExts = [".js", ".jsx", ".ts", ".tsx"];

export default (options = {}) => {
  options.transform ??= (code) => code;
  options.canImportCss ??= (filePath) => javascriptExts.some(ext => filePath.endsWith(ext));
  options.cssFileExtentions ??= [".css"];

  let nextNumber = 1;
  
  // Only transform the CSS files that are imported using an import statement
  const cssFiles = new Set();

  // Internally, we rename imports to end in .css.mieszko.js to ensure that
  // they are treated as Javasscript files
  const cssFileExtentions = options.cssFileExtentions.map(ext => ext + ".mieszko.js");

  return {
    name: "import-css-classes",

    async resolveId(source, importer) {
      if (source.endsWith(".css.mieszko.js")) {
        return {
          id: path.join(path.dirname(importer), source),
        };
      }
    },

    async load(id) {
      // Transform code imports to end in .js
      if (options.canImportCss(id) && !cssFileExtentions.some(ext => id.endsWith(ext))) {
        const sourceCode = await fs.readFile(id, "utf-8");
        const code = updateCSSImportPaths(sourceCode, path.dirname(id), cssFiles, options.cssFileExtentions);

        return {
          code,
          moduleSideEffects: true,
          attributes: { type: "javascript" },
        };
      }

      const cssFilePath = id.slice(0, -".mieszko.js".length);

      if (!cssFiles.has(cssFilePath)) return;
      
      const sourceCode = await fs.readFile(cssFilePath, "utf-8");

      let cssCode = options.transform(sourceCode, id);

      if (options.minify) {
        cssCode = minifyCSS(cssCode);
      }

      const oldClassNames = extractClassNames(cssCode);

      // Since we use find-and-replace to rename class names,
      // we need to replace longer class names first to avoid
      // conflicts with shorter class names.
      const orderedOldClassNames = Array.from(oldClassNames).sort((a, b) => a < b ? 1 : -1);

      const oldToNewClassNames = new Map();

      for (const oldClassName of orderedOldClassNames) {
        // NOTE: These class names are not deterministic across builds
        const newClassName = [
          ".mieszko",
          Date.now().toString(36).slice(3),
          (nextNumber++).toString(36),
          oldClassName.slice(1),
        ].join("-");

        oldToNewClassNames.set(oldClassName, newClassName);

        // NOTE: Is there a more memory efficient way to do this?
        cssCode = cssCode.replaceAll(oldClassName, newClassName);
      }

      const codeParts = [
        // Inject the CSS into the document
        `document.head.innerHTML += ${JSON.stringify(`<style data-import-css-classes>${cssCode}</style>`)};`,
        
        // Export each class name
        ...oldClassNames.map(oldClassName => {
          const oldClassNameWithoutDot = oldClassName.slice(1);
          const variableName = kebabToCamel(oldClassNameWithoutDot);
          const newClassNameWithDot = oldToNewClassNames.get(oldClassName);
          const newClassName = newClassNameWithDot.slice(1);

          return `export const ${variableName} = "${newClassName}";`;
        }),

      ];

      const code = codeParts.join("");

      return {
        code,
        moduleSideEffects: true,
        attributes: { type: "javascript" },
      };
    },
  };
};
