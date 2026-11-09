import { test } from 'node:test';
import assert from 'node:assert/strict';
import { weatherReply } from './weather.ts';

for (const [code, expected] of [
    ['1', /Indoor temp: .* C/],
    ['2', /Outdoor temp: .* C/],
    ['3', /Wind: .*degrees; temp: .* C/],
    ['4', /Rain: now .* mm\/h; last 24h .* mm; last 7d .* mm/],
    ['5', /Pressure: .* hPa/],
    ['6', /Dew point: .* C/],
]) {
    test(`code ${code} returns a labelled fake measurement with units`, () => {
        const reply = weatherReply(code!);
        assert.match(reply!, /^WX: /);
        assert.match(reply!, expected as RegExp);
    });
}

test('help and unknown codes return the command menu', () => {
    for (const input of ['HELP', ' help ', '?', '', 'unknown', 'toString']) {
        assert.match(weatherReply(input)!, /1=Indoor.*2=Outdoor.*3=Wind.*4=Rain.*5=Pressure.*6=Dew/);
    }
});

test('trims commands and ignores ACKs and station replies to prevent loops', () => {
    assert.match(weatherReply(' 1 ')!, /Indoor temp/);
    assert.equal(weatherReply('ACK: hello'), null);
    assert.equal(weatherReply('WX: Indoor temp: 21.4 C'), null);
});
