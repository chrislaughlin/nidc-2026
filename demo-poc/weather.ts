const PREFIX = 'WX: ';
const MENU = '1=Indoor temp; 2=Outdoor temp; 3=Wind direction & temp; 4=Rain current/history; 5=Pressure; 6=Dew point. Send a code or HELP.';

// Fixed simulated readings keep demo responses repeatable and consistent.
const measurements = new Map([
    ['1', 'Indoor temp: 21.4 C'],
    ['2', 'Outdoor temp: 14.8 C'],
    ['3', 'Wind: SW 225 degrees; temp: 14.8 C'],
    ['4', 'Rain: now 0.6 mm/h; last 24h 4.2 mm; last 7d 18.6 mm'],
    ['5', 'Pressure: 1013.2 hPa'],
    ['6', 'Dew point: 10.2 C'],
]);

export function weatherReply(text: string): string | null {
    const code = text.trim().toUpperCase();
    // Ignore responses from this station or the previous ACK demo.
    if (code.startsWith('ACK:') || code.startsWith(PREFIX)) return null;
    return PREFIX + (measurements.get(code) ?? MENU);
}
