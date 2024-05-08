import { Plugin, LoadHook, TransformHook } from "rollup";

declare module 'rollup-plugin-import-css-classes';

declare interface Options {
  cssFileExtentions?: string[];
  canImportCss?: (filePath: string) => boolean;
  transform?: (sourceCode: string, filePath: string) => string;
  minify?: boolean;
}

export default function (options?: Options) : Plugin & {
  load: LoadHook;
  transform: TransformHook;
}
