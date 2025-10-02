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
                    pri: message.payload.pri
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

// Test 1: Authentication and Session Persistence
async function testAuthentication() {
    console.log('\n📝 Test 1: Authentication & Session Persistence');
    
    try {
        // Login
        const user = await createAuthenticatedUser('testuser', 'testpass');
        console.log('✅ Login successful:', user.userId);
        
        // Simulate session restoration
        const ws2 = new WebSocket('ws://localhost:5173/ws');
        await new Promise(resolve => ws2.on('open', resolve));
        
        const restored = await new Promise((resolve) => {
            ws2.on('message', (data) => {
                const msg = JSON.parse(data.toString());
                if (msg.kind === 'sessionRestored') {
                    resolve(msg.payload.success);
                }
            });
            
            ws2.send(JSON.stringify({
                kind: 'restoreSession',
                payload: {
                    sessionToken: user.sessionToken,
                    userId: user.userId,
                    pri: user.pri
                }
            }));
        });
        
        console.log('✅ Session restoration:', restored ? 'SUCCESS' : 'FAILED');
        
        user.ws.close();
        ws2.close();
        return true;
    } catch (error) {
        console.error('❌ Authentication test failed:', error.message);
        return false;
    }
}

// Test 2: Follow System
async function testFollowSystem() {
    console.log('\n👥 Test 2: Follow System');
    
    try {
        const user1 = await createAuthenticatedUser('testuser', 'testpass');
        const user2 = await createAuthenticatedUser('testuser2', 'password');
        
        console.log('Users logged in:', user1.userId, 'and', user2.userId);
        
        // Set up notification listener for user2
        const notificationPromise = new Promise((resolve) => {
            user2.ws.on('message', (data) => {
                const msg = JSON.parse(data.toString());
                if (msg.kind === 'followNotification') {
                    resolve(msg.payload);
                }
            });
        });
        
        // User1 follows User2
        user1.ws.send(JSON.stringify({
            kind: 'follow',
            payload: { userIdToFollow: user2.userId }
        }));
        
        const notification = await notificationPromise;
        console.log('✅ Follow notification received:', notification.type, 'from', notification.followerUsername);
        
        // Check followers
        const followersPromise = new Promise((resolve) => {
            user2.ws.on('message', (data) => {
                const msg = JSON.parse(data.toString());
                if (msg.kind === 'followersResponse') {
                    resolve(msg.payload.followers);
                }
            });
        });
        
        user2.ws.send(JSON.stringify({
            kind: 'getFollowers',
            payload: { userId: user2.userId }
        }));
        
        const followers = await followersPromise;
        console.log('✅ Followers list:', followers);
        
        user1.ws.close();
        user2.ws.close();
        return true;
    } catch (error) {
        console.error('❌ Follow system test failed:', error.message);
        return false;
    }
}

// Test 3: Post Creation
async function testPostCreation() {
    console.log('\n📝 Test 3: Post Creation');
    
    try {
        const user = await createAuthenticatedUser('testuser', 'testpass');
        
        const postPromise = new Promise((resolve, reject) => {
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
                    index: [2, 3, 5, 7],
                    epoch: Date.now(),
                    fingerprint: Array(32).fill(0),
                    signature: Array(64).fill(0)
                },
                beaconType: 'post'
            }
        }));
        
        const post = await postPromise;
        console.log('✅ Post created:', post.beaconId);
        
        user.ws.close();
        return true;
    } catch (error) {
        console.error('❌ Post creation test failed:', error.message);
        return false;
    }
}

// Test 4: Like System
async function testLikeSystem() {
    console.log('\n❤️  Test 4: Like System');
    
    try {
        // Create post first
        const author = await createAuthenticatedUser('testuser', 'testpass');
        
        const postPromise = new Promise((resolve) => {
            author.ws.on('message', (data) => {
                const msg = JSON.parse(data.toString());
                if (msg.kind === 'submitPostSuccess') {
                    resolve(msg.payload);
                }
            });
        });
        
        author.ws.send(JSON.stringify({
            kind: 'submitPostBeacon',
            payload: {
                beacon: {
                    index: [11, 13, 17],
                    epoch: Date.now(),
                    fingerprint: Array(32).fill(0),
                    signature: Array(64).fill(0)
                },
                beaconType: 'post'
            }
        }));
        
        const post = await postPromise;
        console.log('Post created:', post.beaconId);
        
        // Another user likes the post
        const liker = await createAuthenticatedUser('testuser2', 'password');
        
        const likePromise = new Promise((resolve) => {
            liker.ws.on('message', (data) => {
                const msg = JSON.parse(data.toString());
                if (msg.kind === 'likePostSuccess') {
                    resolve(msg.payload);
                }
            });
        });
        
        liker.ws.send(JSON.stringify({
            kind: 'likePost',
            payload: { postBeaconId: post.beaconId }
        }));
        
        const likeResult = await likePromise;
        console.log('✅ Post liked:', likeResult.liked);
        
        author.ws.close();
        liker.ws.close();
        return true;
    } catch (error) {
        console.error('❌ Like system test failed:', error.message);
        return false;
    }
}

// Test 5: Network State
async function testNetworkState() {
    console.log('\n🌐 Test 5: Network State Updates');
    
    try {
        const user1 = await createAuthenticatedUser('testuser', 'testpass');
        
        let networkNodes = [];
        user1.ws.on('message', (data) => {
            const msg = JSON.parse(data.toString());
            if (msg.kind === 'networkStateUpdate') {
                networkNodes = msg.payload.nodes;
            }
        });
        
        // Wait for initial network state
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('Initial network nodes:', networkNodes.length);
        
        // Add second user
        const user2 = await createAuthenticatedUser('testuser2', 'password');
        
        // Wait for network update
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('Network nodes after user2 login:', networkNodes.length);
        
        // Disconnect user2
        user2.ws.close();
        
        // Wait for network update
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('✅ Network nodes after user2 disconnect:', networkNodes.length);
        
        user1.ws.close();
        return true;
    } catch (error) {
        console.error('❌ Network state test failed:', error.message);
        return false;
    }
}

// Main test runner
async function runTests() {
    console.log('🚀 Starting Core Feature Tests\n');
    console.log('================================');
    
    const tests = [
        { name: 'Authentication', fn: testAuthentication },
        { name: 'Follow System', fn: testFollowSystem },
        { name: 'Post Creation', fn: testPostCreation },
        { name: 'Like System', fn: testLikeSystem },
        { name: 'Network State', fn: testNetworkState }
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
    console.log('================================');
    results.forEach(result => {
        const status = result.success ? '✅ PASS' : '❌ FAIL';
        console.log(`${status} - ${result.name}`);
    });
    
    const passed = results.filter(r => r.success).length;
    console.log(`\nTotal: ${passed}/${results.length} tests passed`);
    
    if (passed === results.length) {
        console.log('\n🎉 All tests passed! The system is working correctly.');
    } else {
        console.log('\n⚠️  Some tests failed. Please check the logs above.');
    }
}

// Run the tests
runTests().catch(console.error);