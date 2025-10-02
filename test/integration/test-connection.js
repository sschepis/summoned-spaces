import { WebSocket } from 'ws';

async function testConnection() {
    console.log('Attempting to connect to WebSocket server...');
    const ws = new WebSocket('ws://localhost:5173/ws');

    ws.on('open', () => {
        console.log('✅ Connection opened successfully!');
        ws.close();
    });

    ws.on('error', (err) => {
        console.error('❌ Connection error:', err.message);
    });

    ws.on('close', () => {
        console.log('Connection closed.');
    });
}

testConnection();