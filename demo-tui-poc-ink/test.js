import React from 'react';
import chalk from 'chalk';
import test from 'ava';
import {render} from 'ink-testing-library';
import App from './source/app.js';

test('greet unknown user', t => {
	const {lastFrame} = render(<App />);

	t.true(lastFrame().includes(`Hello, ${chalk.green('Stranger')}`));
	t.true(lastFrame().includes('|||'));
	t.true(lastFrame().split('\n').length <= 24);
});

test('greet user with a name', t => {
	const {lastFrame} = render(<App name="Jane" />);

	t.true(lastFrame().includes(`Hello, ${chalk.green('Jane')}`));
	t.true(lastFrame().includes('|||'));
	t.true(lastFrame().split('\n').length <= 24);
});
