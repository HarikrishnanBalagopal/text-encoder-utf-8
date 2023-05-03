import { encode } from './index.js';

test('encode-and-decode', () => {
    const testCases = [
        '$£Иह€한𐍈',
        'abcd😊efgh\n012345689\t€\r🧑🏽‍🍳helloworld!',
    ];
    testCases.forEach(s => {
        const arr = encode(s);
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
