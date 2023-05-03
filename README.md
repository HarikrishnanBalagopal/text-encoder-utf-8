# UTF-8 Text Encoder

Encodes a string to UTF-8 encoded bytes. https://en.wikipedia.org/wiki/UTF-8

- No dependencies.
- Small code size and simple implementation that you can copy paste.

This can act as a polyfill for `TextEncoder` if you only need UTF-8 encoding. Useful when the `TextEncoder` is undefined in places like the `AudioWorklet` API in browsers. See https://github.com/rustwasm/wasm-bindgen/issues/2367 for more info.

## Usage

Install the package
https://www.npmjs.com/package/@haribala/text-encoder-utf-8
```
npm install @haribala/text-encoder-utf-8
```
or
```
pnpm add @haribala/text-encoder-utf-8
```
Then import `encode` which takes a `string` and returns a `Uint8array`
```js
import { encode } from '@haribala/text-encoder-utf-8';

const bytes = encode(s);
```