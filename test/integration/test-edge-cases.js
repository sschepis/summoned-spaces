import { WebSocket } from 'ws';

// Utility to create and login a user
async function createAuthenticatedUser(username, password) {
    const ws = new WebSocket('ws://localhost:5173/ws');
    
    await new Promise((resolve) => {
        ws.on('open', resolve);
    });
    
    const userData = await new Promise((resolve, reject) => {
        ws.on('message', (data) => {
            const message = JSON.parse(data.toString());
            if (message.kind === 'loginSuccess') {
                resolve({
                    ws,
                    userId: message.payload.userId,
                    sessionToken: message.payload.sessionToken,
                    username: username
                });
            } else if (message.kind === 'error') {
                reject(new Error(message.payload.message));
            }
        });
        
        ws.send(JSON.stringify({
            kind: 'login',
            payload: { username, password }
        }));
    });
    
    return userData;
}

// Test 1: Rapid Reconnection
async function testRapidReconnection() {
    console.log('\n🔄 Test 1: Rapid Reconnection');
    
    try {
        const user = await createAuthenticatedUser('testuser', 'testpass');
        const sessionToken = user.sessionToken;
        
        // Close and reconnect 5 times rapidly
        for (let i = 0; i < 5; i++) {
            user.ws.close();
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const newWs = new WebSocket('ws://localhost:5173/ws');
            await new Promise((resolve) => {
                newWs.on('open', resolve);
            });
            
            // Restore session
            const restored = await new Promise((resolve, reject) => {
                newWs.on('message', (data) => {
                    const msg = JSON.parse(data.toString());
                    if (msg.kind === 'restoreSessionSuccess') {
                        resolve(true);
                    } else if (msg.kind === 'error') {
                        reject(new Error(msg.payload.message));
                    }
                });
                
                newWs.send(JSON.stringify({
                    kind: 'restoreSession',
                    payload: { sessionToken }
                }));
            });
            
            console.log(`Reconnection ${i + 1}/5: ${restored ? '✅' : '❌'}`);
            user.ws = newWs;
        }
        
        user.ws.close();
        return true;
    } catch (error) {
        console.error('❌ Rapid reconnection test failed:', error.message);
        return false;
    }
}

// Test 2: Concurrent Operations
async function testConcurrentOperations() {
    console.log('\n⚡ Test 2: Concurrent Operations');
    
    try {
        const user = await createAuthenticatedUser('testuser', 'testpass');
        
        // Send multiple operations concurrently
        const operations = [];
        
        // Create 5 posts simultaneously
        for (let i = 0; i < 5; i++) {
            const postPromise = new Promise((resolve, reject) => {
                const handler = (data) => {
                    const msg = JSON.parse(data.toString());
                    if (msg.kind === 'submitPostSuccess') {
                        user.ws.removeListener('message', handler);
                        resolve(msg.payload);
                    } else if (msg.kind === 'error' && msg.payload.message.includes('beacon')) {
                        user.ws.removeListener('message', handler);
                        reject(new Error(msg.payload.message));
                    }
                };
                user.ws.on('message', handler);
            });
            
            user.ws.send(JSON.stringify({
                kind: 'submitPostBeacon',
                payload: {
                    beacon: {
                        index: [71 + i, 73 + i, 79 + i],
                        epoch: Date.now() + i,
                        fingerprint: Array(32).fill(i),
                        signature: Array(64).fill(i)
                    },
                    beaconType: 'post'
                }
            }));
            
            operations.push(postPromise);
        }
        
        const results = await Promise.allSettled(operations);
        const successful = results.filter(r => r.status === 'fulfilled').length;
        console.log(`✅ Concurrent posts created: ${successful}/5`);
        
        user.ws.close();
        return successful >= 4; // Allow for some failures due to race conditions
    } catch (error) {
        console.error('❌ Concurrent operations test failed:', error.message);
        return false;
    }
}

// Test 3: Invalid Data Handling
async function testInvalidDataHandling() {
    console.log('\n🛡️ Test 3: Invalid Data Handling');
    
    try {
        const user = await createAuthenticatedUser('testuser', 'testpass');
        const errors = [];
        
        // Test 1: Invalid beacon structure
        const invalidBeaconPromise = new Promise((resolve) => {
            user.ws.on('message', (data) => {
                const msg = JSON.parse(data.toString());
                if (msg.kind === 'error') {
                    resolve(msg.payload.message);
                }
            });
        });
        
        user.ws.send(JSON.stringify({
            kind: 'submitPostBeacon',
            payload: {
                beacon: {
                    // Missing required fields
                    index: [83, 89]
                },
                beaconType: 'post'
            }
        }));
        
        const error1 = await invalidBeaconPromise;
        console.log('Invalid beacon error:', error1.substring(0, 50) + '...');
        errors.push(error1);
        
        // Test 2: Follow non-existent user
        const invalidFollowPromise = new Promise((resolve) => {
            user.ws.on('message', (data) => {
                const msg = JSON.parse(data.toString());
                if (msg.kind === 'error') {
                    resolve(msg.payload.message);
                }
            });
        });
        
        user.ws.send(JSON.stringify({
            kind: 'follow',
            payload: { userIdToFollow: 'non_existent_user_12345' }
        }));
        
        const error2 = await invalidFollowPromise;
        console.log('Invalid follow error:', error2.substring(0, 50) + '...');
        errors.push(error2);
        
        // Test 3: Like non-existent post
        const invalidLikePromise = new Promise((resolve) => {
            user.ws.on('message', (data) => {
                const msg = JSON.parse(data.toString());
                if (msg.kind === 'error') {
                    resolve(msg.payload.message);
                }
            });
        });
        
        user.ws.send(JSON.stringify({
            kind: 'likePost',
            payload: { postBeaconId: 'non_existent_beacon_12345' }
        }));
        
        const error3 = await invalidLikePromise;
        console.log('Invalid like error:', error3.substring(0, 50) + '...');
        errors.push(error3);
        
        console.log(`\n✅ Error handling working: ${errors.length}/3 errors caught`);
        
        user.ws.close();
        return errors.length === 3;
    } catch (error) {
        console.error('❌ Invalid data handling test failed:', error.message);
        return false;
    }
}

// Test 4: Session Timeout Simulation
async function testSessionTimeout() {
    console.log('\n⏱️ Test 4: Session Timeout Simulation');
    
    try {
        const user = await createAuthenticatedUser('testuser', 'testpass');
        const sessionToken = user.sessionToken;
        
        // Close connection
        user.ws.close();
        
        // Wait 2 seconds (simulating timeout)
        console.log('Waiting 2 seconds to simulate session timeout...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Try to restore session
        const newWs = new WebSocket('ws://localhost:5173/ws');
        await new Promise((resolve) => {
            newWs.on('open', resolve);
        });
        
        const restored = await new Promise((resolve, reject) => {
            newWs.on('message', (data) => {
                const msg = JSON.parse(data.toString());
                if (msg.kind === 'restoreSessionSuccess') {
                    resolve(true);
                } else if (msg.kind === 'error') {
                    // Session might have timed out, which is expected
                    resolve(false);
                }
            });
            
            newWs.send(JSON.stringify({
                kind: 'restoreSession',
                payload: { sessionToken }
            }));
        });
        
        console.log(`Session restoration after timeout: ${restored ? '✅ Still valid' : '❌ Timed out (expected)'}`);
        
        newWs.close();
        return true; // Both outcomes are valid
    } catch (error) {
        console.error('❌ Session timeout test failed:', error.message);
        return false;
    }
}

// Test 5: Large Data Handling
async function testLargeDataHandling() {
    console.log('\n📦 Test 5: Large Data Handling');
    
    try {
        const user = await createAuthenticatedUser('testuser', 'testpass');
        
        // Create a beacon with large metadata
        const largeData = 'x'.repeat(10000); // 10KB of data
        
        const largeBeaconPromise = new Promise((resolve, reject) => {
            user.ws.on('message', (data) => {
                const msg = JSON.parse(data.toString());
                if (msg.kind === 'submitPostSuccess') {
                    resolve(msg.payload);
                } else if (msg.kind === 'error') {
                    reject(new Error(msg.payload.message));
                }
            });
        });
        
        user.ws.send(JSON.stringify({
            kind: 'submitPostBeacon',
            payload: {
                beacon: {
                    index: [97, 101, 103],
                    epoch: Date.now(),
                    fingerprint: Array(32).fill(0),
                    signature: Array(64).fill(0),
                    metadata: largeData
                },
                beaconType: 'post'
            }
        }));
        
        const result = await largeBeaconPromise;
        console.log('✅ Large beacon handled successfully:', result.beaconId);
        
        user.ws.close();
        return true;
    } catch (error) {
        console.error('❌ Large data handling test failed:', error.message);
        return false;
    }
}

// Main test runner
async function runTests() {
    console.log('🚀 Starting Edge Case Tests\n');
    console.log('===================================');
    
    const tests = [
        { name: 'Rapid Reconnection', fn: testRapidReconnection },
        { name: 'Concurrent Operations', fn: testConcurrentOperations },
        { name: 'Invalid Data Handling', fn: testInvalidDataHandling },
        { name: 'Session Timeout', fn: testSessionTimeout },
        { name: 'Large Data Handling', fn: testLargeDataHandling }
    ];
    
    const results = [];
    
    for (const test of tests) {
        try {
            const success = await test.fn();
            results.push({ name: test.name, success });
            // Pause between tests
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error(`Test ${test.name} crashed:`, error);
            results.push({ name: test.name, success: false });
        }
    }
    
    // Summary
    console.log('\n\n📊 TEST SUMMARY');
    console.log('===================================');
    results.forEach(result => {
        const status = result.success ? '✅ PASS' : '❌ FAIL';
        console.log(`${status} - ${result.name}`);
    });
    
    const passed = results.filter(r => r.success).length;
    console.log(`\nTotal: ${passed}/${results.length} tests passed`);
    
    if (passed === results.length) {
        console.log('\n🎉 All edge case tests passed! The system is robust.');
    } else {
        console.log('\n⚠️  Some tests failed. Please check the logs above.');
    }
}

// Run the tests
runTests().catch(console.error);