import React from 'react';
import {Text} from 'ink';

// Max rendered size so the logo never blows out a standard terminal.
// The art below is hand-tuned to fit, so it renders verbatim;
// anything taller is evenly downsampled to fit.
export const MAX_LOGO_HEIGHT = 18;
export const MAX_LOGO_WIDTH = 80;

// A weather station: anemometer cups + wind vane on the mast,
// rain funnel and louvered sensor shelter mid-mast, tripod base.
const ART = [
	'        (o)         (o)',
	'  ~~     \\    |      /',
	'  ~~      \\   |     /',
	'   ~~  <============>',
	'             |||',
	'             |||            ~~',
	'          \\       /',
	'           \\_____/',
	'        +-----------+',
	'  ~     |===========|',
	'        +-----------+',
	'             |||',
	'          ___|||___',
	'        _/   |||   \\_',
	'      _/     |||     \\_',
	'    _/       |||       \\_',
	'  _/_/_/_/_/_/_/_/_/_/_/_/_',
];

export function fitArt(lines, maxHeight, maxWidth) {
	let out = lines;
	if (out.length > maxHeight) {
		// Even, endpoint-inclusive sampling so the top detail and the
		// base bottom line both survive the compression.
		out = [];
		for (let i = 0; i < maxHeight; i++) {
			const index = Math.round((i * (lines.length - 1)) / (maxHeight - 1));
			out.push(lines[index]);
		}
	}

	return out.map(line =>
		line.length > maxWidth ? line.slice(0, maxWidth) : line,
	);
}

const Logo = ({maxHeight = MAX_LOGO_HEIGHT, maxWidth = MAX_LOGO_WIDTH}) => (
	<Text wrap="truncate">{fitArt(ART, maxHeight, maxWidth).join('\n')}</Text>
);

export default Logo;
