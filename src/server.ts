import { TelnetServer } from './servers/TelnetServer';
import { WebServer } from './servers/WebServer';

const WEB_PORT = parseInt(process.env.WEB_PORT || '3000');
const TELNET_PORT = parseInt(process.env.TELNET_PORT || '2323');

console.log('='.repeat(60));
console.log('  DERELICT STATION - Multi-Protocol Roguelike Server');
console.log('='.repeat(60));

const webServer = new WebServer(WEB_PORT);
const telnetServer = new TelnetServer(TELNET_PORT);

webServer.start();
telnetServer.start();

console.log('\nServer is ready!');
console.log(`  Web Interface:    http://localhost:${WEB_PORT}`);
console.log(`  Telnet Interface: telnet localhost ${TELNET_PORT}`);
console.log('\nPress Ctrl+C to stop the server.');

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\nShutting down servers...');
  webServer.stop();
  telnetServer.stop();
  console.log('Servers stopped. Goodbye!');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\nShutting down servers...');
  webServer.stop();
  telnetServer.stop();
  console.log('Servers stopped. Goodbye!');
  process.exit(0);
});
