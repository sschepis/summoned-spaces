# Manual Testing Checklist - Design Alignment Validation

**Project**: Summoned Spaces  
**Created**: 2025-10-05  
**Purpose**: Systematic manual testing to validate design spec compliance

---

## Pre-Test Setup

### Environment Preparation
- [ ] Development server running (`npm run dev`)
- [ ] Database accessible (check DATABASE_URL)
- [ ] Browser developer console open
- [ ] Network tab monitoring enabled
- [ ] Clear browser cache and cookies

### Test Data Preparation
- [ ] Have 2-3 test user accounts ready
- [ ] Clear any existing test data if needed
- [ ] Note test user credentials

---

## Test Suite 1: Authentication & User Management

### Test 1.1: User Registration
**Design Ref**: design.md (Authentication section)

- [ ] Navigate to registration page
- [ ] Enter valid username: `testuser1`
- [ ] Enter valid email: `test1@example.com`
- [ ] Enter valid password: `TestPass123!`
- [ ] Click "Register"

**Expected Result**:
- [ ] User created with ID starting with `user_`
- [ ] PRI (Personal Resonance Identity) generated
- [ ] Session token created (64 character hex string)
- [ ] User automatically logged in
- [ ] Redirected to dashboard

**Verification**:
- [ ] Check localStorage for `summoned_spaces_session`
- [ ] Verify session contains: `sessionToken`, `userId`, `pri`
- [ ] Check console for success messages
- [ ] No error messages displayed

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Passed | ❌ Failed  
**Notes**: 

---

### Test 1.2: User Login (Correct Password)
**Design Ref**: design.md (Authentication section)

- [ ] Logout if logged in
- [ ] Navigate to login page
- [ ] Enter username: `testuser1`
- [ ] Enter password: `TestPass123!`
- [ ] Click "Login"

**Expected Result**:
- [ ] Authentication successful
- [ ] Session restored with same userId
- [ ] New sessionToken generated
- [ ] PRI loaded from database
- [ ] Redirected to dashboard

**Verification**:
- [ ] Session in localStorage updated
- [ ] User ID matches registration
- [ ] Console shows "Login successful"
- [ ] No authentication errors

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Passed | ❌ Failed  
**Notes**:

---

### Test 1.3: User Login (Wrong Password)
**Design Ref**: design.md (Authentication section)

- [ ] Logout if logged in
- [ ] Navigate to login page
- [ ] Enter username: `testuser1`
- [ ] Enter WRONG password: `WrongPass123!`
- [ ] Click "Login"

**Expected Result**:
- [ ] Authentication FAILS
- [ ] Error message displayed: "Invalid credentials"
- [ ] No session created
- [ ] Remains on login page

**Verification**:
- [ ] No session in localStorage
- [ ] Error displayed in UI
- [ ] Console shows authentication error
- [ ] User not redirected

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Passed | ❌ Failed  
**Notes**:

---

### Test 1.4: Session Restoration on Page Reload
**Design Ref**: design.md (Session Management)

- [ ] Log in successfully
- [ ] Note current userId
- [ ] Reload the page (F5 or Cmd+R)
- [ ] Wait for page to load

**Expected Result**:
- [ ] User remains logged in
- [ ] Same userId
- [ ] Same sessionToken
- [ ] No re-authentication required
- [ ] Dashboard loads normally

**Verification**:
- [ ] Session persists across reload
- [ ] Console shows "Session restored"
- [ ] SpaceManager initialized
- [ ] No login screen shown

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Passed | ❌ Failed  
**Notes**:

---

### Test 1.5: Logout
**Design Ref**: design.md (Authentication section)

- [ ] Log in successfully
- [ ] Click "Logout" button
- [ ] Observe behavior

**Expected Result**:
- [ ] User logged out
- [ ] Session cleared from localStorage
- [ ] Redirected to login page
- [ ] Communication manager disconnected
- [ ] Space manager cache cleared

**Verification**:
- [ ] localStorage has no `summoned_spaces_session`
- [ ] Console shows "User logged out successfully"
- [ ] Cannot access protected pages
- [ ] Redirect to login page

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Passed | ❌ Failed  
**Notes**:

---

## Test Suite 2: Space Management - Creation & Ownership

### Test 2.1: Create New Space
**Design Ref**: design.md:94-117, GAP_ANALYSIS.md Section 2.1

- [ ] Log in as `testuser1`
- [ ] Navigate to Spaces page
- [ ] Click "Create Space" button
- [ ] Enter space name: `Test Space Alpha`
- [ ] Enter description: `Testing space creation flow`
- [ ] Set visibility: Public
- [ ] Click "Create"

**Expected Result**:
- [ ] Space created successfully
- [ ] Space ID generated with `space_` prefix
- [ ] Creator (`testuser1`) assigned role: **`'owner'`** ✅ CRITICAL
- [ ] Quantum node created for space
- [ ] Initial member beacon submitted
- [ ] Space appears in "My Spaces" list

**Verification**:
- [ ] Check console for `createSpaceSuccess` message
- [ ] Verify `owner` role in response payload
- [ ] Space visible in spaces list
- [ ] Member count shows 1
- [ ] No errors in console

**CRITICAL CHECK**:
- [ ] **Verify creator has role='owner' (NOT 'member')** ✅

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Passed | ❌ Failed  
**Notes**:

---

### Test 2.2: View Space as Owner
**Design Ref**: design.md:259-269

- [ ] Navigate to the created space
- [ ] Open Members tab
- [ ] Check your membership details

**Expected Result**:
- [ ] You appear in member list
- [ ] Your role shows: **`'owner'`** with crown icon ✅
- [ ] Role badge color: Yellow
- [ ] Shows "You" indicator
- [ ] Can see "Invite Members" button
- [ ] Can see management options

**Verification**:
- [ ] Role icon is Crown (yellow)
- [ ] Role text says "Owner"
- [ ] Management buttons visible
- [ ] No permission errors

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Passed | ❌ Failed  
**Notes**:

---

## Test Suite 3: Space Management - Joining & Roles

### Test 3.1: Join Space as Second User
**Design Ref**: design.md:272-306, GAP_ANALYSIS.md Section 2.2

**Setup**:
- [ ] Log out from `testuser1`
- [ ] Register/login as `testuser2`

**Steps**:
- [ ] Navigate to Space Discovery or Public Spaces
- [ ] Find "Test Space Alpha" (created by testuser1)
- [ ] Click "Join Space"
- [ ] Confirm join action

**Expected Result**:
- [ ] Join successful
- [ ] Assigned role: **`'contributor'`** (NOT 'member') ✅ CRITICAL
- [ ] Member beacon created with contributor role
- [ ] Space appears in your spaces list
- [ ] Member count increases to 2

**Verification**:
- [ ] Console shows successful join
- [ ] Check role in member list
- [ ] Verify role is 'contributor' not 'member'
- [ ] Space visible in "My Spaces"

**CRITICAL CHECK**:
- [ ] **Default role MUST be 'contributor', NOT 'member'** ✅

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Passed | ❌ Failed  
**Notes**:

---

### Test 3.2: Verify Contributor Role Displays Correctly
**Design Ref**: MemberList.tsx updates

- [ ] While logged in as `testuser2`
- [ ] Navigate to "Test Space Alpha"
- [ ] Open Members tab
- [ ] Find yourself in the member list

**Expected Result**:
- [ ] Your role shows: **`'contributor'`** with Edit icon
- [ ] Role badge color: Green
- [ ] Role text says "Contributor"
- [ ] Shows "You" indicator
- [ ] Cannot see owner-only management options

**Verification**:
- [ ] Role icon is Edit/Pencil (green)
- [ ] Role text is "Contributor" (capitalized)
- [ ] Correct color coding
- [ ] testuser1 still shows as Owner

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Passed | ❌ Failed  
**Notes**:

---

### Test 3.3: Owner Can See All Members with Correct Roles
**Design Ref**: design.md:259-269

- [ ] Log out from `testuser2`
- [ ] Log in as `testuser1` (owner)
- [ ] Navigate to "Test Space Alpha"
- [ ] Open Members tab

**Expected Result**:
- [ ] See 2 members total
- [ ] `testuser1`: role='owner', yellow crown icon
- [ ] `testuser2`: role='contributor', green edit icon
- [ ] Both roles display correctly
- [ ] Owner can see management options

**Verification**:
- [ ] Member count shows 2
- [ ] Each member has correct role icon
- [ ] Each member has correct role color
- [ ] Role text is properly capitalized
- [ ] "Invite Members" button visible to owner

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Passed | ❌ Failed  
**Notes**:

---

## Test Suite 4: Communication Layer

### Test 4.1: SSE Connection Initialization
**Design Ref**: design/communication-architecture.md:55-91

- [ ] Open browser Network tab
- [ ] Log in as any user
- [ ] Observe network requests

**Expected Result**:
- [ ] SSE connection established to `/v1/events?userId=...`
- [ ] Connection shows "pending" (stays open)
- [ ] Receives `connected` message
- [ ] Receives periodic `heartbeat` messages (every 30s)
- [ ] Console logs "SSE Connected"

**Verification**:
- [ ] EventSource created successfully
- [ ] No connection errors
- [ ] Heartbeat messages arriving
- [ ] Connection remains open

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Passed | ❌ Failed  
**Notes**:

---

### Test 4.2: Real-time Space Creation Notification
**Design Ref**: design/communication-architecture.md:96-131

**Setup**: Two browser windows/tabs
- Window A: Logged in as `testuser1`
- Window B: Logged in as `testuser2`

**Steps**:
- [ ] In Window A: Create a new public space
- [ ] Observe Window B immediately

**Expected Result**:
- [ ] Window A: Receives `createSpaceSuccess` via SSE
- [ ] Window A: Space appears in list
- [ ] Window B: May receive space list update (if implemented)
- [ ] Both: No errors in console

**Verification**:
- [ ] Real-time update works
- [ ] Message delivered via SSE
- [ ] No polling required
- [ ] Console shows message receipt

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Passed | ❌ Failed  
**Notes**:

---

### Test 4.3: Reconnection After Network Disconnect
**Design Ref**: design/communication-architecture.md:172-216

- [ ] Log in successfully
- [ ] Open Network tab
- [ ] Enable "Offline" mode (throttle to offline)
- [ ] Wait 5 seconds
- [ ] Disable "Offline" mode

**Expected Result**:
- [ ] SSE connection closes
- [ ] Reconnection attempt starts
- [ ] Exponential backoff: 5s delay
- [ ] Connection re-established
- [ ] Console shows reconnection log
- [ ] App continues working

**Verification**:
- [ ] Connection recovers automatically
- [ ] Backoff delays visible in console
- [ ] Max 5 reconnection attempts
- [ ] No data loss
- [ ] App remains functional

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Passed | ❌ Failed  
**Notes**:

---

## Test Suite 5: Permission System (Partial - To Be Expanded)

### Test 5.1: Owner Permissions
**Design Ref**: design.md:466-475

- [ ] Log in as space owner (`testuser1`)
- [ ] Navigate to owned space
- [ ] Attempt these actions:

**Actions to Test**:
- [ ] View space details ✓ Expected: Success
- [ ] View members ✓ Expected: Success
- [ ] Invite new members ✓ Expected: Success
- [ ] Change member roles ✓ Expected: Success
- [ ] Delete space ✓ Expected: Success
- [ ] Manage volumes ✓ Expected: Success

**Expected Result**:
- [ ] All actions succeed
- [ ] No permission errors
- [ ] Full access to all features

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Passed | ❌ Failed  
**Notes**:

---

### Test 5.2: Contributor Permissions
**Design Ref**: design.md:466-475

- [ ] Log in as contributor (`testuser2`)
- [ ] Navigate to joined space
- [ ] Attempt these actions:

**Actions to Test**:
- [ ] View space details ✓ Expected: Success
- [ ] View members ✓ Expected: Success
- [ ] Post content ✓ Expected: Success (TODO: Verify when implemented)
- [ ] Invite new members ✗ Expected: No access or limited
- [ ] Change member roles ✗ Expected: Denied
- [ ] Delete space ✗ Expected: Denied

**Expected Result**:
- [ ] Can view and contribute
- [ ] Cannot manage members (or limited)
- [ ] Cannot delete space
- [ ] Appropriate error messages for denied actions

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Passed | ❌ Failed  
**Notes**: Full permission enforcement pending implementation

---

## Test Suite 6: Data Structure Compliance

### Test 6.1: SpaceMember Structure Verification
**Design Ref**: design.md:259-269, GAP_ANALYSIS.md Section 5.2

- [ ] Create a space as `testuser1`
- [ ] Have `testuser2` join the space
- [ ] Open browser console
- [ ] Inspect SpaceMember objects

**Check Network Response** (look at createSpace or join responses):
```javascript
// Expected SpaceMember structure:
{
  userId: "user_...",
  spaceId: "space_...",      // ✓ Should be present
  role: "contributor",        // ✓ Should be "contributor" not "member"
  joinedAt: "2025-10-05T...", // ✓ ISO date string
  permissions: [],            // ✓ Should be present (may be empty)
  resonanceKeys: undefined    // ✓ Optional, may be undefined
}
```

**Verification**:
- [ ] All required fields present
- [ ] spaceId matches the space
- [ ] role is correct type
- [ ] permissions array exists
- [ ] No 'member' role anywhere

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Passed | ❌ Failed  
**Notes**:

---

## Test Suite 7: Error Handling & Edge Cases

### Test 7.1: Attempt to Join Space Twice
- [ ] Join a space as contributor
- [ ] Attempt to join the same space again

**Expected Result**:
- [ ] Graceful handling
- [ ] Message: "Already a member"
- [ ] No duplicate entries
- [ ] No errors thrown

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Passed | ❌ Failed  
**Notes**:

---

### Test 7.2: Create Space with Same Name
- [ ] Create space "Duplicate Test"
- [ ] Create another space "Duplicate Test"

**Expected Result**:
- [ ] Both spaces created successfully
- [ ] Different space IDs
- [ ] Name collision allowed (or proper error if not)

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Passed | ❌ Failed  
**Notes**:

---

### Test 7.3: Leave Space as Owner
- [ ] As owner, attempt to leave own space

**Expected Result**:
- [ ] Action denied
- [ ] Error: "Space owner cannot leave"
- [ ] Suggestion to transfer ownership or delete space

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Passed | ❌ Failed  
**Notes**:

---

## Critical Validation Checklist

### ✅ Must Verify Before Declaring Success

**Role Correctness**:
- [ ] New space creators get `role='owner'` (not 'member')
- [ ] Space joiners get `role='contributor'` (not 'member')
- [ ] UI displays all 4 role types correctly
- [ ] Role icons match: owner=Crown, admin=Shield, contributor=Edit, viewer=Eye

**Data Structure Compliance**:
- [ ] SpaceMember includes `spaceId` field
- [ ] SpaceMember includes `permissions` array
- [ ] User IDs have `user_` prefix
- [ ] Space IDs have `space_` prefix

**Communication Layer**:
- [ ] SSE connection established successfully
- [ ] Heartbeat messages every 30 seconds
- [ ] Reconnection works with exponential backoff
- [ ] Real-time updates delivered

**Session Management**:
- [ ] Session persists across page reloads
- [ ] Logout clears all session data
- [ ] Invalid credentials properly rejected

---

## Test Results Summary

### Statistics
- **Total Tests**: 23
- **Passed**: ___ / 23
- **Failed**: ___ / 23
- **Not Started**: ___ / 23

### Critical Failures
(List any critical test failures here)

### Known Issues
(List any known issues discovered during testing)

### Recommendations
(List recommendations for fixes or improvements)

---

## Tester Information

- **Tester Name**: _______________
- **Test Date**: _______________
- **Environment**: Dev / Staging / Production (circle one)
- **Browser**: _______________
- **OS**: _______________

---

**Test Session Status**: ⬜ Not Started | ⏳ In Progress | ✅ Complete  
**Overall Result**: ⬜ Pass | ⬜ Pass with Issues | ⬜ Fail

**Sign-off**: _______________  **Date**: _______________