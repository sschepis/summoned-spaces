import { WebSocket } from 'ws';

// Utility functions
async function connectWebSocket(name = 'User') {
    const ws = new WebSocket('ws://localhost:5173/ws');
    await new Promise((resolve, reject) => {
        ws.on('open', () => {
            console.log(`${name} WebSocket connected`);
            resolve();
        });
        ws.on('error', reject);
    });
    return ws;
}

async function loginUser(ws, username, password) {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Login timeout')), 5000);
        
        const handler = (data) => {
            const message = JSON.parse(data.toString());
            if (message.kind === 'loginSuccess') {
                clearTimeout(timeout);
                ws.removeListener('message', handler);
                resolve({
                    userId: message.payload.userId,
                    sessionToken: message.payload.sessionToken,
                    pri: message.payload.pri
                });
            } else if (message.kind === 'error') {
                clearTimeout(timeout);
                ws.removeListener('message', handler);
                reject(new Error(message.payload.message));
            }
        };
        
        ws.on('message', handler);
        ws.send(JSON.stringify({
            kind: 'login',
            payload: { username, password }
        }));
    });
}

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Test functions
async function testSpaceCreation() {
    console.log('\n=== Testing Space Creation ===');
    
    const ws = await connectWebSocket('Space Creator');
    const userData = await loginUser(ws, 'testuser', 'testpass');
    console.log('Logged in as:', userData.userId);
    
    // Create a public space
    const spacePromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Space creation timeout')), 5000);
        
        ws.on('message', (data) => {
            const message = JSON.parse(data.toString());
            console.log('Received:', message.kind);
            if (message.kind === 'createSpaceSuccess') {
                clearTimeout(timeout);
                console.log('✅ Space created:', message.payload);
                resolve(message.payload);
            } else if (message.kind === 'error') {
                clearTimeout(timeout);
                console.error('Error creating space:', message.payload);
                reject(new Error(message.payload.message));
            }
        });
    });
    
    ws.send(JSON.stringify({
        kind: 'createSpace',
        payload: {
            name: 'Test Quantum Space',
            description: 'A space for testing quantum resonance',
            isPublic: true
        }
    }));
    
    const spaceData = await spacePromise;
    
    // Get public spaces to verify
    const spacesPromise = new Promise((resolve) => {
        ws.on('message', (data) => {
            const message = JSON.parse(data.toString());
            if (message.kind === 'publicSpacesResponse') {
                resolve(message.payload.spaces);
            }
        });
    });
    
    ws.send(JSON.stringify({ kind: 'getPublicSpaces' }));
    const spaces = await spacesPromise;
    
    console.log('Public spaces found:', spaces.length);
    const ourSpace = spaces.find(s => s.space_id === spaceData.spaceId);
    console.log('Our space in list:', !!ourSpace);
    
    ws.close();
    return { success: true, spaceId: spaceData.spaceId };
}

async function testPostCreation() {
    console.log('\n=== Testing Post Creation ===');
    
    const ws = await connectWebSocket('Post Creator');
    const userData = await loginUser(ws, 'testuser', 'testpass');
    console.log('Logged in as:', userData.userId);
    
    // Create a post beacon
    const postPromise = new Promise((resolve) => {
        ws.on('message', (data) => {
            const message = JSON.parse(data.toString());
            if (message.kind === 'submitPostSuccess') {
                console.log('✅ Post created:', message.payload);
                resolve(message.payload);
            }
        });
    });
    
    ws.send(JSON.stringify({
        kind: 'submitPostBeacon',
        payload: {
            beacon: {
                index: [2, 3, 5, 7, 11],
                epoch: Date.now(),
                fingerprint: Array(32).fill(0),
                signature: Array(64).fill(0)
            },
            beaconType: 'post'
        }
    }));
    
    const postData = await postPromise;
    
    // Get user's beacons to verify
    const beaconsPromise = new Promise((resolve) => {
        ws.on('message', (data) => {
            const message = JSON.parse(data.toString());
            if (message.kind === 'beaconsResponse') {
                resolve(message.payload.beacons);
            }
        });
    });
    
    ws.send(JSON.stringify({
        kind: 'getBeaconsByUser',
        payload: { userId: userData.userId, beaconType: 'post' }
    }));
    
    const beacons = await beaconsPromise;
    console.log('User posts found:', beacons.length);
    
    ws.close();
    return { success: true, postId: postData.postId, beaconId: postData.beaconId };
}

async function testLikeSystem() {
    console.log('\n=== Testing Like System ===');
    
    // User 1 creates a post
    const ws1 = await connectWebSocket('Post Author');
    const user1 = await loginUser(ws1, 'testuser', 'testpass');
    
    // Create a post
    const postPromise = new Promise((resolve) => {
        ws1.on('message', (data) => {
            const message = JSON.parse(data.toString());
            if (message.kind === 'submitPostSuccess') {
                resolve(message.payload);
            }
        });
    });
    
    ws1.send(JSON.stringify({
        kind: 'submitPostBeacon',
        payload: {
            beacon: {
                index: [13, 17, 19],
                epoch: Date.now(),
                fingerprint: Array(32).fill(0),
                signature: Array(64).fill(0)
            },
            beaconType: 'post'
        }
    }));
    
    const post = await postPromise;
    console.log('Post created:', post.beaconId);
    
    // User 2 likes the post
    const ws2 = await connectWebSocket('Liker');
    const user2 = await loginUser(ws2, 'testuser2', 'password');
    
    const likePromise = new Promise((resolve) => {
        ws2.on('message', (data) => {
            const message = JSON.parse(data.toString());
            if (message.kind === 'likePostSuccess') {
                console.log('✅ Like toggled:', message.payload);
                resolve(message.payload);
            }
        });
    });
    
    ws2.send(JSON.stringify({
        kind: 'likePost',
        payload: { postBeaconId: post.beaconId }
    }));
    
    const likeResult = await likePromise;
    console.log('Post liked:', likeResult.liked);
    
    // Unlike the post
    const unlikePromise = new Promise((resolve) => {
        ws2.on('message', (data) => {
            const message = JSON.parse(data.toString());
            if (message.kind === 'likePostSuccess') {
                resolve(message.payload);
            }
        });
    });
    
    ws2.send(JSON.stringify({
        kind: 'likePost',
        payload: { postBeaconId: post.beaconId }
    }));
    
    const unlikeResult = await unlikePromise;
    console.log('Post unliked:', !unlikeResult.liked);
    
    ws1.close();
    ws2.close();
    return { success: true };
}

async function testCommentSystem() {
    console.log('\n=== Testing Comment System ===');
    
    // User 1 creates a post
    const ws1 = await connectWebSocket('Post Author');
    const user1 = await loginUser(ws1, 'testuser', 'testpass');
    
    // Create a post
    const postPromise = new Promise((resolve) => {
        ws1.on('message', (data) => {
            const message = JSON.parse(data.toString());
            if (message.kind === 'submitPostSuccess') {
                resolve(message.payload);
            }
        });
    });
    
    ws1.send(JSON.stringify({
        kind: 'submitPostBeacon',
        payload: {
            beacon: {
                index: [23, 29, 31],
                epoch: Date.now(),
                fingerprint: Array(32).fill(0),
                signature: Array(64).fill(0)
            },
            beaconType: 'post'
        }
    }));
    
    const post = await postPromise;
    console.log('Post created:', post.beaconId);
    
    // User 2 comments on the post
    const ws2 = await connectWebSocket('Commenter');
    const user2 = await loginUser(ws2, 'testuser2', 'password');
    
    const commentPromise = new Promise((resolve) => {
        ws2.on('message', (data) => {
            const message = JSON.parse(data.toString());
            if (message.kind === 'submitCommentSuccess') {
                console.log('✅ Comment created:', message.payload);
                resolve(message.payload);
            }
        });
    });
    
    ws2.send(JSON.stringify({
        kind: 'submitCommentBeacon',
        payload: {
            postBeaconId: post.beaconId,
            beacon: {
                index: [37, 41, 43],
                epoch: Date.now(),
                fingerprint: Array(32).fill(0),
                signature: Array(64).fill(0)
            }
        }
    }));
    
    const comment = await commentPromise;
    console.log('Comment posted on beacon:', comment.postBeaconId);
    
    ws1.close();
    ws2.close();
    return { success: true };
}

async function testSearch() {
    console.log('\n=== Testing Search Functionality ===');
    
    const ws = await connectWebSocket('Searcher');
    const userData = await loginUser(ws, 'testuser', 'testpass');
    
    // Search for users
    const searchPromise = new Promise((resolve) => {
        ws.on('message', (data) => {
            const message = JSON.parse(data.toString());
            if (message.kind === 'searchResponse') {
                resolve(message.payload);
            }
        });
    });
    
    ws.send(JSON.stringify({
        kind: 'search',
        payload: { query: 'test', category: 'people' }
    }));
    
    const results = await searchPromise;
    console.log('Search results:');
    console.log('- Users found:', results.users.length);
    console.log('- User examples:', results.users.slice(0, 2).map(u => u.username));
    
    // Search for all categories
    const searchAllPromise = new Promise((resolve) => {
        ws.on('message', (data) => {
            const message = JSON.parse(data.toString());
            if (message.kind === 'searchResponse') {
                resolve(message.payload);
            }
        });
    });
    
    ws.send(JSON.stringify({
        kind: 'search',
        payload: { query: 'quantum', category: 'all' }
    }));
    
    const allResults = await searchAllPromise;
    console.log('\nSearch all categories:');
    console.log('- Users:', allResults.users.length);
    console.log('- Spaces:', allResults.spaces.length);
    console.log('- Posts:', allResults.beacons.length);
    
    ws.close();
    return { success: true };
}

async function testNetworkState() {
    console.log('\n=== Testing Network State Updates ===');
    
    const ws1 = await connectWebSocket('User 1');
    const ws2 = await connectWebSocket('User 2');
    
    let networkNodes = [];
    
    // Listen for network updates on ws1
    ws1.on('message', (data) => {
        const message = JSON.parse(data.toString());
        if (message.kind === 'networkStateUpdate') {
            networkNodes = message.payload.nodes;
            console.log('Network update received, nodes:', networkNodes.length);
        }
    });
    
    // Login both users
    const user1 = await loginUser(ws1, 'testuser', 'testpass');
    const user2 = await loginUser(ws2, 'testuser2', 'password');
    
    await delay(1000);
    
    console.log('Both users logged in');
    console.log('Network contains both users:', 
        networkNodes.some(n => n.userId === user1.userId) &&
        networkNodes.some(n => n.userId === user2.userId)
    );
    
    // Disconnect user 2
    ws2.close();
    await delay(1000);
    
    console.log('User 2 disconnected');
    console.log('Network updated, remaining nodes:', networkNodes.length);
    
    ws1.close();
    return { success: true };
}

// Main test runner
async function runAllTests() {
    console.log('🚀 Starting Comprehensive Test Suite\n');
    
    const tests = [
        { name: 'Space Creation', fn: testSpaceCreation },
        { name: 'Post Creation', fn: testPostCreation },
        { name: 'Like System', fn: testLikeSystem },
        { name: 'Comment System', fn: testCommentSystem },
        { name: 'Search Functionality', fn: testSearch },
        { name: 'Network State Updates', fn: testNetworkState }
    ];
    
    const results = [];
    
    for (const test of tests) {
        try {
            const result = await test.fn();
            results.push({ name: test.name, ...result });
            await delay(1000); // Pause between tests
        } catch (error) {
            console.error(`❌ ${test.name} failed:`, error.message);
            results.push({ name: test.name, success: false, error: error.message });
        }
    }
    
    // Summary
    console.log('\n\n📊 TEST SUMMARY');
    console.log('================');
    results.forEach(result => {
        const status = result.success ? '✅' : '❌';
        console.log(`${status} ${result.name}`);
    });
    
    const passed = results.filter(r => r.success).length;
    console.log(`\nTotal: ${passed}/${results.length} tests passed`);
}

// Run the tests
runAllTests().catch(console.error);