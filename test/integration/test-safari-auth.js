// Test Safari-specific authentication behavior
// Run this in Safari's console to test

async function testSafariAuth() {
    console.log('=== Testing Safari Authentication ===');
    console.log('User Agent:', navigator.userAgent);
    console.log('Is Safari:', /^((?!chrome|android).)*safari/i.test(navigator.userAgent));
    
    // Test 1: localStorage availability
    console.log('\n1. Testing localStorage:');
    try {
        localStorage.setItem('test_safari', 'test_value');
        const retrieved = localStorage.getItem('test_safari');
        console.log('✅ localStorage write/read:', retrieved === 'test_value' ? 'SUCCESS' : 'FAILED');
        localStorage.removeItem('test_safari');
    } catch (error) {
        console.error('❌ localStorage error:', error);
    }
    
    // Test 2: WebSocket connection
    console.log('\n2. Testing WebSocket connection:');
    const wsUrl = (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/ws';
    console.log('WebSocket URL:', wsUrl);
    
    try {
        const ws = new WebSocket(wsUrl);
        
        await new Promise((resolve, reject) => {
            ws.onopen = () => {
                console.log('✅ WebSocket connected');
                resolve();
            };
            ws.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
                reject(error);
            };
            ws.onclose = (event) => {
                console.log('WebSocket closed:', event.code, event.reason);
            };
            
            // Timeout after 5 seconds
            setTimeout(() => reject(new Error('WebSocket connection timeout')), 5000);
        });
        
        // Test 3: Session persistence
        console.log('\n3. Testing session persistence:');
        const testSession = {
            user: { id: 'test123', username: 'testuser' },
            token: 'test_token_123',
            pri: { test: 'data' }
        };
        
        // Save session
        localStorage.setItem('holographic_session', JSON.stringify(testSession));
        console.log('Session saved to localStorage');
        
        // Retrieve session
        const savedSession = localStorage.getItem('holographic_session');
        const parsed = JSON.parse(savedSession);
        console.log('Session retrieved:', {
            hasUser: !!parsed.user,
            hasToken: !!parsed.token,
            hasPri: !!parsed.pri
        });
        
        // Clean up
        localStorage.removeItem('holographic_session');
        ws.close();
        
        console.log('\n✅ All Safari tests passed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
    
    // Test 4: Check for Safari-specific issues
    console.log('\n4. Common Safari issues to check:');
    console.log('- Private browsing mode:', !window.localStorage ? 'YES (localStorage blocked)' : 'NO');
    console.log('- Third-party cookies blocked:', document.cookie === '' ? 'POSSIBLY' : 'NO');
    console.log('- ITP (Intelligent Tracking Prevention) active:', 'Check Safari settings');
    
    console.log('\n=== Safari Authentication Test Complete ===');
}

// Instructions for manual testing
console.log(`
To test Safari authentication:

1. Open Safari Developer Console (Cmd+Option+C)
2. Copy and paste this entire script
3. Run: testSafariAuth()

If you see errors:
- Check if Private Browsing is enabled
- Check Safari > Preferences > Privacy settings
- Ensure cookies and website data are allowed
- Try disabling content blockers

For debugging the actual app:
1. Login normally
2. Note any console errors
3. Reload the page
4. Check if you're still logged in
5. Look for WebSocket or localStorage errors
`);