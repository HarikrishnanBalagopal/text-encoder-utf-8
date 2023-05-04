# UTF-8 Text Encoder/Decoder

Encodes a string to UTF-8 encoded bytes. https://en.wikipedia.org/wiki/UTF-8
Decodes UTF-8 bytes to a string.

- No dependencies.
- Small code size and simple implementation that you can copy paste.

This can act as a polyfill for `TextEncoder` and `TextDecoder` if you only need UTF-8 encoding/decoding. Useful when `TextEncoder` and `TextDecoder` are undefined in places like the `AudioWorklet` API in browsers. See https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Using_AudioWorklet and https://github.com/rustwasm/wasm-bindgen/issues/2367 for more info.

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

```js
import { encode, decode } from '@haribala/text-encoder-utf-8';

const a = 'hi there! 😃 🖐🏻';
const bytes = encode(a);
const b = decode(bytes);
console.log(a === b);
```
