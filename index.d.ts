/**
 * Encode a string to UTF-8 bytes.
 * @param {string} s - The string to encode.
 * @returns {Uint8Array} Bytes containing the UTF-8 encoding of the string.
 */
export function encode(_: string): Uint8Array;

/**
 * Decode UTF-8 bytes into a string.
 * Will throw an error if the input is not valid UTF-8 bytes.
 * If there are 3 or less continuation bytes at the beginning of the string
 * they will be ignored. Similarly if a 2,3,4 byte character overflows the end
 * of the string it will also be ignored.
 * @param {Uint8Array} arr - Bytes containing the UTF-8 encoding of the string.
 * @returns {string} The decoded string.
 */
export function decode(_: Uint8Array): string;
