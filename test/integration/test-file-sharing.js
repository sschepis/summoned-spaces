import { WebSocket } from 'ws';
import * as fs from 'fs';
import * as crypto from 'crypto';

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

// Test 1: File Sharing in a Space
async function testFileSharing() {
    console.log('\n📁 Test 1: File Sharing in a Space');
    
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
                name: 'File Sharing Test Space',
                description: 'A space for testing file sharing',
                isPublic: true
            }
        }));
        
        const space = await spacePromise;
        console.log('✅ Space created:', space.name, '(ID:', space.spaceId + ')');

        // Add a small delay to ensure the space is fully registered on the server
        await new Promise(resolve => setTimeout(resolve, 500));

        // Create a dummy file
        const dummyFileName = 'test-file.txt';
        const dummyFileContent = 'This is a test file for Summoned Spaces.';
        fs.writeFileSync(dummyFileName, dummyFileContent);
        const fileStats = fs.statSync(dummyFileName);
        const fingerprint = crypto.createHash('sha256').update(dummyFileContent).digest('hex');

        // Add file to space
        const fileAddedPromise = new Promise((resolve) => {
            user.ws.on('message', (data) => {
                const msg = JSON.parse(data.toString());
                if (msg.kind === 'fileAddedToSpace' && msg.payload.spaceId === space.spaceId) {
                    resolve(msg.payload.file);
                }
            });
        });

        user.ws.send(JSON.stringify({
            kind: 'addFileToSpace',
            payload: {
                spaceId: space.spaceId,
                fileName: dummyFileName,
                fileType: 'text/plain',
                fileSize: fileStats.size,
                fingerprint,
                fileContent: fs.readFileSync(dummyFileName, 'base64')
            }
        }));

        console.log('Waiting for file to be added...');
        const addedFile = await fileAddedPromise;
        console.log('✅ File added to space:', addedFile.fileName);

        // Get space files
        const filesPromise = new Promise((resolve) => {
            user.ws.on('message', (data) => {
                const msg = JSON.parse(data.toString());
                if (msg.kind === 'spaceFilesResponse' && msg.payload.spaceId === space.spaceId) {
                    resolve(msg.payload.files);
                }
            });
        });

        user.ws.send(JSON.stringify({
            kind: 'getSpaceFiles',
            payload: { spaceId: space.spaceId }
        }));
        
        console.log('Waiting for file list...');
        const files = await filesPromise;
        console.log('✅ Retrieved files from space:', files.length);
        const foundFile = files.find(f => f.file_id === addedFile.fileId);
        console.log('✅ Added file found in space files:', !!foundFile);

        // Remove file from space
        const fileRemovedPromise = new Promise((resolve) => {
            user.ws.on('message', (data) => {
                const msg = JSON.parse(data.toString());
                if (msg.kind === 'fileRemovedFromSpace' && msg.payload.spaceId === space.spaceId) {
                    resolve(msg.payload);
                }
            });
        });

        user.ws.send(JSON.stringify({
            kind: 'removeFileFromSpace',
            payload: { spaceId: space.spaceId, fileId: addedFile.fileId }
        }));

        console.log('Waiting for file to be removed...');
        const removedResult = await fileRemovedPromise;
        console.log('✅ File removed from space:', removedResult.fileId);
        
        fs.unlinkSync(dummyFileName); // Clean up dummy file
        user.ws.close();
        return true;
    } catch (error) {
        console.error('❌ File sharing test failed:', error.message);
        return false;
    }
}

// Main test runner
async function runTests() {
    console.log('🚀 Starting File Sharing Tests\n');
    console.log('===================================');
    
    const success = await testFileSharing();
    
    console.log('\n\n📊 TEST SUMMARY');
    console.log('===================================');
    const status = success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} - File Sharing in Spaces`);
    
    if (success) {
        console.log('\n🎉 All file sharing tests passed!');
    } else {
        console.log('\n⚠️  File sharing tests failed. Please check the logs above.');
    }
}

// Run the tests
runTests().catch(console.error);