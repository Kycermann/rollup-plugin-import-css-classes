import { extractClassNames } from "./utils/extractClassNames.js";
import { kebabToCamel } from "./utils/kebabToCamel.js";
import { minifyCSS } from "./utils/minifyCSS.js";

export default (options = {}) => {
  options.transform ??= (code) => code;
  options.filter ??= (filePath) => filePath.endsWith(".css");
  options.checkAttributes ??= true;

  let nextNumber = 1;

  return {
    name: "import-css-classes",

    transform(sourceCode, id) {
      const moduleInfo = this.getModuleInfo(id);
      
      if (!options.filter(id)) return;

      if (options.checkAttributes && moduleInfo.attributes?.type !== "css") {
        return;
      }

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
      const map = { mappings: "" };

      return { code, map };
    },
  };
};
