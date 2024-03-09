import { Plugin, LoadHook, TransformHook } from "rollup";

declare interface Options {
  filter?: (filePath: string) => boolean;
  transform?: (sourceCode: string, filePath: string) => string;
  minify?: boolean;
}

export default function (options?: Options) : Plugin & {
  load: LoadHook;
  transform: TransformHook;
}
