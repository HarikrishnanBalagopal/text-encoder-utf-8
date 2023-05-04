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

/**
 * Decode UTF-8 bytes into a string.
 * Will throw an error if the input is not valid UTF-8 bytes.
 * If there are 3 or less continuation bytes at the beginning of the string
 * they will be ignored. Similarly if a 2,3,4 byte character overflows the end
 * of the string it will also be ignored.
 * @param {Uint8Array} arr - Bytes containing the UTF-8 encoding of the string.
 * @returns {string} The decoded string.
 */
export const decode = (arr) => {
    const hex = x => x.toString(16).padStart(2, '0');
    const xs = Array.from(arr);
    const res = [];
    let i = 0;
    while (i < xs.length && i < 3 && xs[i] && (xs[i] & 0xC0) === 0x80) i++;
    if (i >= xs.length) return '';
    if (!(
        ((xs[i] & 0x80) === 0) || // 1 byte
        ((xs[i] & 0xE0) === 0xC0) || // 2 byte
        ((xs[i] & 0xF0) === 0xE0) || // 3 byte
        ((xs[i] & 0xF8) === 0xF0) // 4 byte
    )) {
        throw new Error(`invalid utf-8. Expected a leading byte at index ${i} actual ${hex(xs[i])}`);
    }
    for (; i < xs.length; i++) {
        const x = xs[i];
        if ((x & 0x80) === 0) {
            // 1 byte
            res.push(x);
            continue;
        }
        if ((x & 0xE0) === 0xC0) {
            // 2 byte
            if (i + 1 >= xs.length) break;
            const x1 = xs[i + 1];
            if ((x1 & 0xC0) !== 0x80) {
                throw new Error(`invalid utf-8. Expected a continuation byte at index ${i + 1} actual ${hex(x1)}`);
            }
            const c = ((x & 0x1F) << 6) | (x1 & 0x3F);
            if (c < 0x80 || c >= 0x800) {
                throw new Error(`invalid utf-8. Expected an integer between 0x80 and 0x800 at index ${i} actual ${c}`);
            }
            res.push(c);
            i++;
            continue;
        }
        if ((x & 0xF0) === 0xE0) {
            // 3 byte
            if (i + 2 >= xs.length) break;
            const x1 = xs[i + 1];
            if ((x1 & 0xC0) !== 0x80) {
                throw new Error(`invalid utf-8. Expected a continuation byte at index ${i + 1} actual ${hex(x1)}`);
            }
            const x2 = xs[i + 2];
            if ((x2 & 0xC0) !== 0x80) {
                throw new Error(`invalid utf-8. Expected a continuation byte at index ${i + 2} actual ${hex(x2)}`);
            }
            const c = ((x & 0x0F) << 12) | ((x1 & 0x3F) << 6) | (x2 & 0x3F);
            if (c < 0x800 || c >= 0x10000) {
                throw new Error(`invalid utf-8. Expected an integer between 0x800 and 0x10000 at index ${i} actual ${c}`);
            }
            res.push(c);
            i += 2;
            continue;
        }
        if ((x & 0xF8) === 0xF0) {
            // 4 byte
            if (i + 3 >= xs.length) break;
            const x1 = xs[i + 1];
            if ((x1 & 0xC0) !== 0x80) {
                throw new Error(`invalid utf-8. Expected a continuation byte at index ${i + 1} actual ${hex(x1)}`);
            }
            const x2 = xs[i + 2];
            if ((x2 & 0xC0) !== 0x80) {
                throw new Error(`invalid utf-8. Expected a continuation byte at index ${i + 2} actual ${hex(x2)}`);
            }
            const x3 = xs[i + 3];
            if ((x3 & 0xC0) !== 0x80) {
                throw new Error(`invalid utf-8. Expected a continuation byte at index ${i + 3} actual ${hex(x3)}`);
            }
            const c = ((x & 0x07) << 18) | ((x1 & 0x3F) << 12) | ((x2 & 0x3F) << 6) | (x3 & 0x3F);
            if (c < 0x10000) {
                throw new Error(`invalid utf-8. Expected an integer above 0x10000 at index ${i} actual ${c}`);
            }
            res.push(c);
            i += 3;
            continue;
        }
        throw new Error(`invalid utf-8. Expected a leading byte at index ${i} actual ${hex(x)}`);
    }
    return String.fromCodePoint(...res);
};
