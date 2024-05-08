export function updateCSSImportPaths(code, basePath, cssFiles, extensions) {
  const extensionsPattern = extensions.map(ext => ext.slice(1).replace('.', '\\.')).join('|');
  const regex = new RegExp(`import\\s+(.*?)\\s+from\\s+['"]([^'"]+\\.(${extensionsPattern}))['"]\\s+with\\s+\\{\\s*type:\\s*['"]css['"]\\s*\\}`, 'gs');

  return code.replace(regex, (_match, imports, filePath) => {
    const fullPath = path.join(basePath, filePath);
    cssFiles.add(fullPath);

    // Change the file extension in the import path
    const newFilePath = filePath.replace(new RegExp(`\\.(${extensionsPattern})$`), '.$1.mieszko.js');

    return `import ${imports} from "${newFilePath}"`;
  });
}
