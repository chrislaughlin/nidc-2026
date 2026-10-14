import React from 'react';
import {Box, Text} from 'ink';
import Counter from './counter.js';
import Logo from './logo.js';

export default function App({name = 'Stranger'}) {
	return (
		<Box flexDirection="column">
			<Logo />
			<Text>
				Hello, <Text color="green">{name}</Text> 👋
			</Text>
			<Counter />
		</Box>
	);
}
