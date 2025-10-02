# Summoned Spaces Test Suite

This directory contains organized test files for the Summoned Spaces application.

## Directory Structure

### `/integration/`
Comprehensive integration tests for the application:

- **test-suite.js** - Main comprehensive test suite covering all core features
- **test-core-features.js** - Core functionality tests (authentication, follows, posts, likes, network state)
- **test-advanced-features.js** - Advanced features (spaces, comments, search, beacon management, multi-user)
- **test-quaternionic-chat.js** - Quantum-enhanced chat system tests
- **test-file-sharing.js** - File sharing functionality in spaces
- **test-direct-messages.js** - Direct messaging between users
- **test-edge-cases.js** - Edge case and stress testing
- **test-connection.js** - Basic WebSocket connection testing
- **test-auth-fix.js** - Authentication race condition fix verification
- **test-safari-auth.js** - Safari-specific authentication testing

### `/utils/`
Database and user management utilities:

- **check-db.js** - Database health check and statistics
- **dump-users.js** - Dump all users, beacons, and relationships from database
- **reset-db.js** - Clear all data from database
- **create-test-user.js** - Create primary test user (testuser)
- **create-test-user2.js** - Create secondary test user (testuser2)
- **check-user.js** - User verification utility

### `/docs/`
Test documentation and results:

- **test-results-summary.md** - Comprehensive test results and issue resolution summary

## Running Tests

### Prerequisites
1. Ensure the server is running: `npm run dev`
2. Database should be initialized and accessible

### Running Individual Tests
```bash
# Core functionality
node test/integration/test-core-features.js

# Advanced features
node test/integration/test-advanced-features.js

# Quaternionic chat
node test/integration/test-quaternionic-chat.js

# Complete test suite
node test/integration/test-suite.js
```

### Database Utilities
```bash
# Check database status
node test/utils/check-db.js

# Create test users
node test/utils/create-test-user.js
node test/utils/create-test-user2.js

# Reset database (WARNING: Deletes all data)
node test/utils/reset-db.js
```

## Test Categories

### Authentication Tests
- Login/logout functionality
- Session persistence across reconnections
- Safari compatibility
- Race condition prevention

### Social Features Tests
- User following/unfollowing
- Real-time notifications
- Follower lists and management

### Content Tests
- Post creation and retrieval
- Like/unlike functionality
- Comment system
- Beacon management

### Advanced Features Tests
- Space creation and discovery
- File sharing in spaces
- Search functionality
- Multi-user interactions

### Quantum Features Tests
- Quaternionic chat rooms
- Quantum message transmission
- Phase synchronization
- ResoLang integration

### Edge Cases Tests
- Rapid reconnection scenarios
- Concurrent operations
- Invalid data handling
- Session timeout simulation
- Large data handling

## Test Results

See `/docs/test-results-summary.md` for detailed test results and issue resolution history.

## Notes

- Tests use WebSocket connections to localhost:5173
- Test users: `testuser` (password: `testpass`), `testuser2` (password: `password`)
- Tests clean up after themselves but database utilities can reset state if needed
- Quantum features require ResoLang WASM integration to be properly loaded