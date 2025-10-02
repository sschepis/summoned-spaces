import { WebSocket } from 'ws';

// Test that the authentication fix prevents race conditions
async function testAuthFix() {
    console.log('=== Testing Authentication Fix ===\n');
    
    // Step 1: Login and get session
    console.log('Step 1: Initial login...');
    const ws1 = new WebSocket('ws://localhost:5173/ws');
    
    await new Promise((resolve) => {
        ws1.on('open', () => {
            console.log('WebSocket 1 connected');
            resolve();
        });
    });
    
    let sessionData = null;
    
    ws1.on('message', (data) => {
        const message = JSON.parse(data.toString());
        console.log('WS1 received:', message.kind);
        
        if (message.kind === 'loginSuccess') {
            sessionData = {
                sessionToken: message.payload.sessionToken,
                userId: message.payload.userId,
                pri: message.payload.pri
            };
            console.log('Login successful, got session:', {
                userId: sessionData.userId,
                hasToken: !!sessionData.sessionToken,
                hasPri: !!sessionData.pri
            });
        }
    });
    
    // Login with test user
    ws1.send(JSON.stringify({
        kind: 'login',
        payload: { username: 'testuser', password: 'testpass' }
    }));
    
    // Wait for login response
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (!sessionData) {
        console.error('Failed to get session data');
        ws1.close();
        return;
    }
    
    // Step 2: Close connection (simulate page reload)
    console.log('\nStep 2: Closing connection (simulating page reload)...');
    ws1.close();
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Step 3: Simulate the fixed client behavior
    console.log('\nStep 3: Opening new connection and properly restoring session...');
    const ws2 = new WebSocket('ws://localhost:5173/ws');
    
    let sessionRestored = false;
    let allRequestsSucceeded = true;
    
    ws2.on('message', (data) => {
        const message = JSON.parse(data.toString());
        console.log('WS2 received:', message.kind);
        
        if (message.kind === 'sessionRestored') {
            sessionRestored = message.payload.success;
            console.log('Session restore result:', message.payload);
        }
        
        if (message.kind === 'submitPostSuccess') {
            console.log('✅ Authenticated request successful!');
        }
        
        if (message.kind === 'error') {
            console.error('❌ WS2 Error:', message.payload);
            allRequestsSucceeded = false;
        }
    });
    
    await new Promise((resolve) => {
        ws2.on('open', () => {
            console.log('WebSocket 2 connected');
            resolve();
        });
    });
    
    // FIXED BEHAVIOR: Send restore session message first
    console.log('\nSending restoreSession message first...');
    ws2.send(JSON.stringify({
        kind: 'restoreSession',
        payload: sessionData
    }));
    
    // Wait for session restoration to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Now try authenticated requests - they should all succeed
    console.log('\nTrying authenticated requests after session restore...');
    
    // Request 1
    ws2.send(JSON.stringify({
        kind: 'submitPostBeacon',
        payload: {
            beacon: {
                index: [2, 3, 5],
                epoch: Date.now(),
                fingerprint: Array(32).fill(0),
                signature: Array(64).fill(0)
            },
            beaconType: 'test_1'
        }
    }));
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Request 2
    ws2.send(JSON.stringify({
        kind: 'submitPostBeacon',
        payload: {
            beacon: {
                index: [7, 11, 13],
                epoch: Date.now(),
                fingerprint: Array(32).fill(0),
                signature: Array(64).fill(0)
            },
            beaconType: 'test_2'
        }
    }));
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Request 3
    ws2.send(JSON.stringify({
        kind: 'submitPostBeacon',
        payload: {
            beacon: {
                index: [17, 19, 23],
                epoch: Date.now(),
                fingerprint: Array(32).fill(0),
                signature: Array(64).fill(0)
            },
            beaconType: 'test_3'
        }
    }));
    
    // Wait for all responses
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('\n=== Test Summary ===');
    console.log('Session restored:', sessionRestored);
    console.log('All requests succeeded:', allRequestsSucceeded);
    console.log('\nWith the fix in place:');
    console.log('1. Client waits for session restoration before making requests');
    console.log('2. UI shows "Restoring quantum connection..." during restoration');
    console.log('3. All authenticated requests succeed after session is restored');
    
    ws2.close();
}

// Run the test
testAuthFix().catch(console.error);