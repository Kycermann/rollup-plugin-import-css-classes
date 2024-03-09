
export function extractClassNames(cssText) {
  const regex = /(\.[a-zA-Z_][a-zA-Z_\d\-]*)\b/g;
  const classNames = [];
  
  let result;
  while ((result = regex.exec(cssText))) {
    classNames.push(result[1]);
  }

  return [...new Set(classNames)];
}