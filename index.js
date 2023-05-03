/**
 * Encode a string to UTF-8 bytes.
 * @param {string} s - The string to encode.
 * @returns {Uint8Array} Bytes containing the UTF-8 encoding of the string.
 */
export const encode = (s) => new Uint8Array([...s].map(c => c.codePointAt(0)).flatMap(x => {
    if (x < 0x80) {
        // first 128 code points need 1 byte
        return x;
    }
    if (x < 0x800) {
        // next 1920 code points need 2 bytes
        return [((x >>> 6) & 0x1F) | 0xC0, (x & 0x3F) | 0x80];
    }
    if (x < 0x10000) {
        // next 63488 (really only 61440 are in use) code points need 3 bytes
        return [((x >>> 12) & 0x0F) | 0xE0, ((x >>> 6) & 0x3F) | 0x80, (x & 0x3F) | 0x80];
    }
    // rest need 4 bytes
    return [
        ((x >>> 18) & 0x07) | 0xF0,
        ((x >>> 12) & 0x3F) | 0x80,
        ((x >>> 6) & 0x3F) | 0x80,
        (x & 0x3F) | 0x80,
    ];
}));
