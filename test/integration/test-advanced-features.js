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

// Test 1: Space Creation and Discovery
async function testSpaces() {
    console.log('\n🌌 Test 1: Space Creation & Discovery');
    
    try {
        const user = await createAuthenticatedUser('testuser', 'testpass');
        
        // Create a space
        const spacePromise = new Promise((resolve, reject) => {
            user.ws.on('message', (data) => {
                const msg = JSON.parse(data.toString());
                if (msg.kind === 'createSpaceSuccess') {
                    resolve(msg.payload);
                } else if (msg.kind === 'error' && !msg.payload.message.includes('restoreSession')) {
                    reject(new Error(msg.payload.message));
                }
            });
        });
        
        user.ws.send(JSON.stringify({
            kind: 'createSpace',
            payload: {
                name: 'Quantum Test Space',
                description: 'A space for testing quantum features',
                isPublic: true
            }
        }));
        
        const space = await spacePromise;
        console.log('✅ Space created:', space.name, '(ID:', space.spaceId + ')');
        
        // Get public spaces
        const spacesPromise = new Promise((resolve) => {
            user.ws.on('message', (data) => {
                const msg = JSON.parse(data.toString());
                if (msg.kind === 'publicSpacesResponse') {
                    resolve(msg.payload.spaces);
                }
            });
        });
        
        user.ws.send(JSON.stringify({ kind: 'getPublicSpaces' }));
        const spaces = await spacesPromise;
        
        const foundSpace = spaces.find(s => s.space_id === space.spaceId);
        console.log('✅ Space found in public list:', !!foundSpace);
        console.log('Total public spaces:', spaces.length);
        
        user.ws.close();
        return true;
    } catch (error) {
        console.error('❌ Space test failed:', error.message);
        return false;
    }
}

// Test 2: Comment System
async function testComments() {
    console.log('\n💬 Test 2: Comment System');
    
    try {
        // Create post author
        const author = await createAuthenticatedUser('testuser', 'testpass');
        
        // Create a post
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
                    index: [19, 23, 29],
                    epoch: Date.now(),
                    fingerprint: Array(32).fill(0),
                    signature: Array(64).fill(0)
                },
                beaconType: 'post'
            }
        }));
        
        const post = await postPromise;
        console.log('Post created:', post.beaconId);
        
        // Create commenter
        const commenter = await createAuthenticatedUser('testuser2', 'password');
        
        // Add comment
        const commentPromise = new Promise((resolve, reject) => {
            commenter.ws.on('message', (data) => {
                const msg = JSON.parse(data.toString());
                if (msg.kind === 'submitCommentSuccess') {
                    resolve(msg.payload);
                } else if (msg.kind === 'error' && msg.payload.message.includes('comment')) {
                    reject(new Error(msg.payload.message));
                }
            });
        });
        
        commenter.ws.send(JSON.stringify({
            kind: 'submitCommentBeacon',
            payload: {
                postBeaconId: post.beaconId,
                beacon: {
                    index: [31, 37, 41],
                    epoch: Date.now(),
                    fingerprint: Array(32).fill(0),
                    signature: Array(64).fill(0)
                }
            }
        }));
        
        const comment = await commentPromise;
        console.log('✅ Comment added to post:', comment.postBeaconId);
        
        author.ws.close();
        commenter.ws.close();
        return true;
    } catch (error) {
        console.error('❌ Comment test failed:', error.message);
        return false;
    }
}

// Test 3: Search Functionality
async function testSearch() {
    console.log('\n🔍 Test 3: Search Functionality');
    
    try {
        const user = await createAuthenticatedUser('testuser', 'testpass');
        
        // Search for users
        const userSearchPromise = new Promise((resolve) => {
            user.ws.on('message', (data) => {
                const msg = JSON.parse(data.toString());
                if (msg.kind === 'searchResponse') {
                    resolve(msg.payload);
                }
            });
        });
        
        user.ws.send(JSON.stringify({
            kind: 'search',
            payload: { query: 'test', category: 'people' }
        }));
        
        const userResults = await userSearchPromise;
        console.log('✅ User search results:', userResults.users.length);
        console.log('Found users:', userResults.users.map(u => u.username).join(', '));
        
        // Search all categories
        const allSearchPromise = new Promise((resolve) => {
            user.ws.on('message', (data) => {
                const msg = JSON.parse(data.toString());
                if (msg.kind === 'searchResponse') {
                    resolve(msg.payload);
                }
            });
        });
        
        user.ws.send(JSON.stringify({
            kind: 'search',
            payload: { query: '', category: 'all' }
        }));
        
        const allResults = await allSearchPromise;
        console.log('\n✅ Search all categories:');
        console.log('  - Users:', allResults.users.length);
        console.log('  - Spaces:', allResults.spaces.length);
        console.log('  - Posts:', allResults.beacons.length);
        
        user.ws.close();
        return true;
    } catch (error) {
        console.error('❌ Search test failed:', error.message);
        return false;
    }
}

// Test 4: Beacon Management
async function testBeaconManagement() {
    console.log('\n📡 Test 4: Beacon Management');
    
    try {
        const user = await createAuthenticatedUser('testuser', 'testpass');
        
        // Create multiple beacons of different types
        const beaconTypes = ['post', 'user_following_list', 'user_spaces_list'];
        const createdBeacons = [];
        
        for (const type of beaconTypes) {
            const beaconPromise = new Promise((resolve) => {
                user.ws.on('message', (data) => {
                    const msg = JSON.parse(data.toString());
                    if (msg.kind === 'submitPostSuccess') {
                        resolve(msg.payload);
                    }
                });
            });
            
            user.ws.send(JSON.stringify({
                kind: 'submitPostBeacon',
                payload: {
                    beacon: {
                        index: [43, 47, 53],
                        epoch: Date.now() + Math.random() * 1000,
                        fingerprint: Array(32).fill(0),
                        signature: Array(64).fill(0)
                    },
                    beaconType: type
                }
            }));
            
            const beacon = await beaconPromise;
            createdBeacons.push({ type, beaconId: beacon.beaconId });
            console.log(`Created ${type} beacon:`, beacon.beaconId);
        }
        
        // Get user's beacons
        const userBeaconsPromise = new Promise((resolve) => {
            user.ws.on('message', (data) => {
                const msg = JSON.parse(data.toString());
                if (msg.kind === 'beaconsResponse') {
                    resolve(msg.payload.beacons);
                }
            });
        });
        
        user.ws.send(JSON.stringify({
            kind: 'getBeaconsByUser',
            payload: { userId: user.userId }
        }));
        
        const userBeacons = await userBeaconsPromise;
        console.log('\n✅ User beacons retrieved:', userBeacons.length);
        
        // Get specific beacon by ID
        const beaconByIdPromise = new Promise((resolve) => {
            user.ws.on('message', (data) => {
                const msg = JSON.parse(data.toString());
                if (msg.kind === 'beaconResponse') {
                    resolve(msg.payload.beacon);
                }
            });
        });
        
        user.ws.send(JSON.stringify({
            kind: 'getBeaconById',
            payload: { beaconId: createdBeacons[0].beaconId }
        }));
        
        const specificBeacon = await beaconByIdPromise;
        console.log('✅ Retrieved specific beacon:', specificBeacon ? specificBeacon.beacon_id : 'Not found');
        
        user.ws.close();
        return true;
    } catch (error) {
        console.error('❌ Beacon management test failed:', error.message);
        return false;
    }
}

// Test 5: Multi-user Interaction
async function testMultiUserInteraction() {
    console.log('\n👥 Test 5: Multi-user Interaction');
    
    try {
        // Create 3 users
        const user1 = await createAuthenticatedUser('testuser', 'testpass');
        const user2 = await createAuthenticatedUser('testuser2', 'password');
        const user3 = await createAuthenticatedUser('sschepis', 'password');
        
        console.log('Three users connected');
        
        // User1 creates a post
        const postPromise = new Promise((resolve) => {
            user1.ws.on('message', (data) => {
                const msg = JSON.parse(data.toString());
                if (msg.kind === 'submitPostSuccess') {
                    resolve(msg.payload);
                }
            });
        });
        
        user1.ws.send(JSON.stringify({
            kind: 'submitPostBeacon',
            payload: {
                beacon: {
                    index: [59, 61, 67],
                    epoch: Date.now(),
                    fingerprint: Array(32).fill(0),
                    signature: Array(64).fill(0)
                },
                beaconType: 'post'
            }
        }));
        
        const post = await postPromise;
        console.log('User1 created post:', post.beaconId);
        
        // User2 and User3 like the post
        const likes = [];
        for (const liker of [user2, user3]) {
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
            
            const like = await likePromise;
            likes.push(like);
            console.log(`${liker.username} liked the post:`, like.liked);
        }
        
        // User2 follows User3
        const followPromise = new Promise((resolve) => {
            user3.ws.on('message', (data) => {
                const msg = JSON.parse(data.toString());
                if (msg.kind === 'followNotification') {
                    resolve(msg.payload);
                }
            });
        });
        
        user2.ws.send(JSON.stringify({
            kind: 'follow',
            payload: { userIdToFollow: user3.userId }
        }));
        
        const followNotif = await followPromise;
        console.log('✅ User3 received follow notification from:', followNotif.followerUsername);
        
        user1.ws.close();
        user2.ws.close();
        user3.ws.close();
        return true;
    } catch (error) {
        console.error('❌ Multi-user interaction test failed:', error.message);
        return false;
    }
}

// Main test runner
async function runTests() {
    console.log('🚀 Starting Advanced Feature Tests\n');
    console.log('===================================');
    
    const tests = [
        { name: 'Spaces', fn: testSpaces },
        { name: 'Comments', fn: testComments },
        { name: 'Search', fn: testSearch },
        { name: 'Beacon Management', fn: testBeaconManagement },
        { name: 'Multi-user Interaction', fn: testMultiUserInteraction }
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
        console.log('\n🎉 All advanced tests passed! The system is fully functional.');
    } else {
        console.log('\n⚠️  Some tests failed. Please check the logs above.');
    }
}

// Run the tests
runTests().catch(console.error);