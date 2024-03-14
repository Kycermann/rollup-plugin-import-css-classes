# rollup-plugin-import-css-classes

Published to [npm](https://www.npmjs.com/package/rollup-plugin-import-css-classes).

A Rollup plugin to import CSS classes in Javascript. Inspired by [rollup-plugin-import-css](https://github.com/jleeson/rollup-plugin-import-css) but that one returns a `CSSStyleSheet` and this one exports class names to use in your app.

For ideas or if the docs are unclear, you are welcome to [open an issue](https://github.com/Kycermann/rollup-plugin-import-css-classes/issues/new).

## Usage

Let's take these files:

`MyDiv.css`

```css
.blue-colour { /* Correct Great British spelling 🇬🇧 */
  color: blue;
}
```

`MyDiv.tsx`

```tsx
import { blueColour } from "./MyDiv.css" assert { type: "css" };

export const MyDiv = () => (
  <div className={blueColour}>
    Blue text
  </div>
);
```

It's OK to use the same class names across different `.css` files.

## Installation

### npm

```bash
npm i rollup-plugin-import-css-classes
```

### Deno

Use the specifier `npm:rollup-plugin-import-css-classes`.

### Config

Example `rollup.config.js`:

```js
import css from "rollup-plugin-import-css-classes";

export default {
  input: "index.js",
  output: { file: "dist/index.js", format: "esm" },
  plugins: [ css() ]
};
```
