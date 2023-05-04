import { encode, decode } from './index.js';

test('encode-and-decode', () => {
    const testCases = [
        '$£Иह€한𐍈',
        'abcd😊efgh\n012345689\t€\r🧑🏽‍🍳helloworld!',
    ];
    testCases.forEach(s => {
        const arr = encode(s);
        expect(decode(arr)).toBe(s);
        {
            // test against TextEncoder
            const expected = Array.from(new TextEncoder().encode(s));
            const actual = Array.from(arr);
            expect(actual.length).toBe(expected.length);
            expect(expected.every((x, i) => x === actual[i])).toBe(true);
        }
        {
            // test against TextDecoder
            const actual = new TextDecoder().decode(arr);
            expect(actual).toBe(s);
        }
    });
});

test('utf-8-broken-beginning', () => {
    const textEnc = new TextEncoder();
    const textDec = new TextDecoder();
    const s = 'abcd😊efgh\n012345689\t€\r🧑🏽‍🍳helloworld!';
    const arr = new Uint8Array([
        0x80, 0x80, 0x80, // continuation byte x 3
        ...Array.from(textEnc.encode(s)),
    ]);
    expect(textDec.decode(arr)).toBe('\uFFFD\uFFFD\uFFFD' + s);
    expect(decode(arr)).toBe(s);
});

test('utf-8-broken-beginning-invalid-continuation-byte', () => {
    const textEnc = new TextEncoder();
    const textDec = new TextDecoder();
    const s = 'abcd😊efgh\n012345689\t€\r🧑🏽‍🍳helloworld!';
    const arr = new Uint8Array([
        0x80, 0xFF, 0x80, // continuation byte, invalid byte, continuation byte
        ...Array.from(textEnc.encode(s)),
    ]);
    expect(textDec.decode(arr)).toBe('\uFFFD\uFFFD\uFFFD' + s);
    expect(() => decode(arr)).toThrow('invalid utf-8. Expected a leading byte at index 1 actual ff');
});

test('utf-8-broken-beginning-too-many-continuation-bytes', () => {
    const textEnc = new TextEncoder();
    const textDec = new TextDecoder();
    const s = 'abcd😊efgh\n012345689\t€\r🧑🏽‍🍳helloworld!';
    const arr = new Uint8Array([
        0x80, 0x80, 0x80, 0x80, // continuation byte x 4
        ...Array.from(textEnc.encode(s)),
    ]);
    expect(textDec.decode(arr)).toBe('\uFFFD\uFFFD\uFFFD\uFFFD' + s);
    expect(() => decode(arr)).toThrow('invalid utf-8. Expected a leading byte at index 3 actual 80');
});

test('utf-8-broken-beginning-invalid-leading-byte', () => {
    const textEnc = new TextEncoder();
    const textDec = new TextDecoder();
    const s = 'abcd😊efgh\n012345689\t€\r🧑🏽‍🍳helloworld!';
    const arr = new Uint8Array([
        0x80, 0x80, 0x80, 0xFF, // continuation byte x 4
        ...Array.from(textEnc.encode(s)),
    ]);
    expect(textDec.decode(arr)).toBe('\uFFFD\uFFFD\uFFFD\uFFFD' + s);
    expect(() => decode(arr)).toThrow('invalid utf-8. Expected a leading byte at index 3 actual ff');
});

test('utf-8-broken-ending-partial-multi-byte-character', () => {
    const textEnc = new TextEncoder();
    const textDec = new TextDecoder();
    const s = 'abcd😊efgh\n012345689\t€\r🧑🏽‍🍳helloworld!';
    const arr = new Uint8Array([
        0x80, 0x80, 0x80, // continuation byte x 4
        ...Array.from(textEnc.encode(s)),
        0xF0,
    ]);
    expect(textDec.decode(arr)).toBe('\uFFFD\uFFFD\uFFFD' + s + '\uFFFD');
    expect(decode(arr)).toBe(s);
});

test('utf-8-broken-middle-invalid-character', () => {
    const textEnc = new TextEncoder();
    const textDec = new TextDecoder();
    const s = 'abcd😊efgh\n012345689\t€\r🧑🏽‍🍳helloworld!';
    const arr = new Uint8Array([
        0x80, 0x80, 0x80, // continuation byte x 4
        ...Array.from(textEnc.encode(s)),
        0xFF,
        ...Array.from(textEnc.encode(s)),
    ]);
    expect(textDec.decode(arr)).toBe('\uFFFD\uFFFD\uFFFD' + s + '\uFFFD' + s);
    expect(() => decode(arr)).toThrow('invalid utf-8. Expected a leading byte at index 56 actual ff');
});

test('utf-8-broken-middle-invalid-4-byte-character-not-continuation-byte', () => {
    const textEnc = new TextEncoder();
    const textDec = new TextDecoder();
    const s = 'abcd😊efgh\n012345689\t€\r🧑🏽‍🍳helloworld!';
    const arr = new Uint8Array([
        0x80, 0x80, 0x80, // continuation byte x 4
        ...Array.from(textEnc.encode(s)),
        0xF0,
        0x80,
        ...Array.from(textEnc.encode(s)),
    ]);
    expect(textDec.decode(arr)).toBe('\uFFFD\uFFFD\uFFFD' + s + '\uFFFD\uFFFD' + s);
    expect(() => decode(arr)).toThrow('invalid utf-8. Expected a continuation byte at index 58 actual 61');
});

test('utf-8-broken-middle-invalid-2-byte-character-out-of-range', () => {
    const textEnc = new TextEncoder();
    const textDec = new TextDecoder();
    const s = 'abcd😊efgh\n012345689\t€\r🧑🏽‍🍳helloworld!';
    const arr = new Uint8Array([
        0x80, 0x80, 0x80, // continuation byte x 4
        ...Array.from(textEnc.encode(s)),
        0xC0,
        0x80,
        ...Array.from(textEnc.encode(s)),
    ]);
    expect(textDec.decode(arr)).toBe('\uFFFD\uFFFD\uFFFD' + s + '\uFFFD\uFFFD' + s);
    expect(() => decode(arr)).toThrow('invalid utf-8. Expected an integer between 0x80 and 0x800 at index 56 actual 0');
});
