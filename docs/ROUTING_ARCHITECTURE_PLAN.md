# Summoned.Spaces Routing Architecture Plan

## Current State Analysis

### Existing Navigation System
- **State-based routing**: Uses React state with `View` type and `currentView`
- **Navigation component**: Takes `currentView` and `onViewChange` props
- **Manual state management**: Space IDs and conversation IDs managed in component state
- **No deep linking**: URLs don't reflect current application state
- **No browser history**: Back/forward buttons don't work as expected

### Available Views
```typescript
type View = 'feed' | 'space' | 'spaces' | 'friends' | 'messages' | 'search' 
  | 'analytics' | 'dashboard' | 'settings' | 'system-admin' | 'content-admin';
```

## Proposed URL Structure

### Public Routes (Unauthenticated)
```
/                           # Landing page / login
/login                      # Login form
/register                   # Registration form
/forgot-password           # Password reset
/public-feed               # Public activity stream (view-only)
```

### Protected Routes (Authenticated)
```
/dashboard                  # Main dashboard/home feed
/feed                      # Personal activity feed
/explore                   # Public activity discovery

# Spaces
/spaces                    # Space discovery
/spaces/:spaceId           # Individual space view
/spaces/:spaceId/settings  # Space settings (if admin)
/spaces/:spaceId/members   # Space member list
/spaces/:spaceId/files     # Space file browser

# Posts & Content
/posts/:postId             # Individual post detail view
/posts/:postId/edit        # Edit post (if owner)

# Social Features
/friends                   # Social network / followers
/friends/followers         # Followers list
/friends/following         # Following list
/friends/suggestions       # Friend suggestions
/users/:userId             # User profile view
/users/:userId/posts       # User's posts
/users/:userId/spaces      # User's spaces

# Messages
/messages                  # Direct messages inbox
/messages/:conversationId  # Specific conversation
/messages/new              # New message composer

# Discovery & Search
/search                    # Semantic search
/search/:query             # Search results
/discover                  # Content discovery
/discover/spaces           # Space discovery
/discover/users            # User discovery
/hashtags/:tag             # Posts by hashtag

# Analytics & Admin
/analytics                 # Analytics dashboard
/analytics/network         # Network analytics
/analytics/content         # Content analytics
/settings                  # User settings
/settings/profile          # Profile settings
/settings/privacy          # Privacy settings
/settings/notifications    # Notification settings

# Admin Routes (Role-based)
/admin/system              # System administration
/admin/content             # Content moderation
/admin/users               # User management
/admin/spaces              # Space management
```

## Technical Implementation Plan

### 1. Dependencies Installation
```bash
npm install react-router-dom
npm install @types/react-router-dom
```

### 2. Route Configuration Structure
```typescript
// src/routes/AppRoutes.tsx
interface RouteConfig {
  path: string;
  component: React.ComponentType;
  protected?: boolean;
  roles?: string[];
  exact?: boolean;
  children?: RouteConfig[];
}

// src/routes/routeConfig.ts
export const routeConfig: RouteConfig[] = [
  // Public routes
  {
    path: '/',
    component: LandingPage,
    exact: true
  },
  {
    path: '/login',
    component: LoginPage
  },
  // Protected routes
  {
    path: '/dashboard',
    component: DashboardPage,
    protected: true
  },
  // Nested routes
  {
    path: '/spaces',
    component: SpacesLayout,
    protected: true,
    children: [
      {
        path: '',
        component: SpaceDiscovery,
        exact: true
      },
      {
        path: ':spaceId',
        component: SpaceDetailPage
      }
    ]
  }
];
```

### 3. Route Components Architecture
```
src/
  routes/
    AppRoutes.tsx           # Main route configuration
    ProtectedRoute.tsx      # Authentication guard
    RoleProtectedRoute.tsx  # Role-based access guard
    routeConfig.ts          # Route definitions
  pages/                    # Page-level components
    LandingPage.tsx
    DashboardPage.tsx
    SpacePage.tsx
    UserProfilePage.tsx
    PostDetailPage.tsx
    NotFoundPage.tsx
  layouts/                  # Layout components
    AppLayout.tsx           # Main app layout with nav
    AuthLayout.tsx          # Authentication layout
    AdminLayout.tsx         # Admin-specific layout
```

### 4. Enhanced Navigation Integration
```typescript
// Updated Navigation component
import { useNavigate, useLocation } from 'react-router-dom';

export function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Map current route to view state for styling
  const getCurrentView = (pathname: string): View => {
    if (pathname.startsWith('/spaces')) return 'spaces';
    if (pathname.startsWith('/friends')) return 'friends';
    // ... other mappings
    return 'dashboard';
  };
  
  const handleNavigation = (view: View) => {
    const routeMap: Record<View, string> = {
      dashboard: '/dashboard',
      spaces: '/spaces',
      friends: '/friends',
      // ... other mappings
    };
    navigate(routeMap[view]);
  };
}
```

### 5. Parameter Handling
```typescript
// Space page with URL parameters
import { useParams, useSearchParams } from 'react-router-dom';

export function SpacePage() {
  const { spaceId } = useParams<{ spaceId: string }>();
  const [searchParams] = useSearchParams();
  const filter = searchParams.get('filter');
  
  // Use spaceId to load space data
  // Use filter for content filtering
}

// Post detail with parameters
export function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  
  const handleEdit = () => {
    navigate(`/posts/${postId}/edit`);
  };
}
```

### 6. Authentication Guards
```typescript
// ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
}

// RoleProtectedRoute.tsx
export function RoleProtectedRoute({ 
  children, 
  requiredRoles = [],
  fallback = '/dashboard' 
}: RoleProtectedRouteProps) {
  const { user } = useAuth();
  
  const hasRequiredRole = requiredRoles.length === 0 || 
    requiredRoles.some(role => user?.roles?.includes(role));
  
  if (!hasRequiredRole) {
    return <Navigate to={fallback} replace />;
  }
  
  return <>{children}</>;
}
```

### 7. Deep Linking Support
```typescript
// Handle direct links to spaces, posts, etc.
export function useDeepLinking() {
  const location = useLocation();
  const { user } = useAuth();
  
  useEffect(() => {
    // Handle authentication redirects
    if (user && location.state?.from) {
      navigate(location.state.from.pathname);
    }
    
    // Handle space invitations
    if (location.pathname.includes('/spaces/') && location.search.includes('invite=')) {
      // Process space invitation
    }
  }, [user, location]);
}
```

### 8. SEO and Meta Tags
```typescript
// usePageMeta hook for dynamic meta tags
export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    document.title = `${title} | summoned.spaces`;
    
    if (description) {
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', description);
      }
    }
  }, [title, description]);
}

// Usage in pages
export function SpacePage() {
  const { spaceId } = useParams();
  const space = useSpace(spaceId);
  
  usePageMeta(
    space?.name || 'Space',
    space?.description || 'Quantum file sharing space'
  );
}
```

## Migration Strategy

### Phase 1: Setup Foundation
1. Install React Router dependencies
2. Create basic route structure
3. Set up ProtectedRoute component
4. Migrate main navigation

### Phase 2: Core Routes
1. Implement dashboard and main pages
2. Add space routing with parameters
3. Set up user profile routes
4. Test navigation flow

### Phase 3: Advanced Features
1. Add nested routing for detailed views
2. Implement search and discovery routes
3. Add admin and settings routes
4. Set up SEO and meta tags

### Phase 4: Polish & Testing
1. Test all route transitions
2. Verify deep linking works
3. Test authentication flows
4. Performance optimization

## Benefits of New Routing System

### User Experience
- **Deep linking**: Share direct links to posts, spaces, users
- **Browser navigation**: Back/forward buttons work correctly
- **Bookmarking**: Users can bookmark specific pages
- **SEO friendly**: Better search engine indexing

### Developer Experience
- **Type safety**: Route parameters with TypeScript
- **Code organization**: Clear separation of pages and layouts
- **Testing**: Easier to test individual pages
- **Maintainability**: Cleaner architecture

### Technical Benefits
- **Performance**: Code splitting by route
- **Analytics**: Better page tracking
- **Error boundaries**: Per-route error handling
- **Caching**: Route-based caching strategies

## Implementation Timeline

- **Week 1**: Dependencies, basic setup, core routes
- **Week 2**: Authentication guards, parameter handling
- **Week 3**: Nested routes, advanced features
- **Week 4**: Testing, polish, migration completion

This routing system will transform summoned.spaces from a state-based SPA into a fully-featured web application with proper URL structure, deep linking, and browser navigation support.