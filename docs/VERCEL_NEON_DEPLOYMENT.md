# Vercel + Neon Deployment Guide for Summoned Spaces

This guide walks you through deploying the Summoned Spaces quantum holographic beacon system to Vercel using Neon PostgreSQL as the database backend.

## 🚀 Quick Start

### Prerequisites

- [Vercel account](https://vercel.com)
- [Neon account](https://neon.tech)
- [GitHub account](https://github.com) (recommended for CI/CD)
- Node.js 18+ installed locally

### Step 1: Set Up Neon Database

1. **Create a Neon Account**
   - Visit [neon.tech](https://neon.tech)
   - Sign up for a free account

2. **Create a New Database**
   ```bash
   # Navigate to Neon Console
   # Click "Create Database"
   # Name: summoned-spaces-prod
   # Region: Choose closest to your users
   ```

3. **Copy Connection String**
   ```bash
   # From Neon Console, copy the connection string
   # Format: postgresql://user:pass@host/dbname?sslmode=require
   ```

4. **Initialize Database Schema**
   ```bash
   # Clone the repository
   git clone https://github.com/your-username/summoned-spaces.git
   cd summoned-spaces

   # Set up environment
   echo "DATABASE_URL=your_neon_connection_string" > .env.local

   # Install dependencies
   npm install

   # Run schema initialization
   npm run db:setup
   ```

### Step 2: Deploy to Vercel

#### Option A: GitHub Integration (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "feat: add Neon PostgreSQL support"
   git push origin main
   ```

2. **Connect to Vercel**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Configure deployment settings:

3. **Environment Variables**
   ```bash
   # Add these in Vercel Dashboard -> Settings -> Environment Variables
   DATABASE_URL=your_neon_connection_string
   NODE_ENV=production
   NEXTAUTH_SECRET=your_secret_key_here
   NEXTAUTH_URL=https://your-app.vercel.app
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy your app

#### Option B: Direct Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Set environment variables
vercel env add DATABASE_URL
vercel env add NODE_ENV production
```

## 🔧 Configuration Details

### Database Configuration

The application automatically detects the deployment environment:

```typescript
// Automatic environment detection
if (process.env.NODE_ENV === 'production' || 
    process.env.VERCEL === '1' || 
    process.env.DATABASE_URL) {
  // Uses Neon PostgreSQL
} else {
  // Development mode (requires Neon URL for now)
}
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | Neon PostgreSQL connection string |
| `NODE_ENV` | ✅ | Set to `production` |
| `NEON_DATABASE_URL` | ⚪ | Alternative to DATABASE_URL |
| `NEXTAUTH_SECRET` | ✅ | Random secret for authentication |
| `NEXTAUTH_URL` | ✅ | Your app's URL |

### Advanced Configuration

```bash
# Optional optimization settings
DB_MAX_CONNECTIONS=20
DB_QUERY_TIMEOUT=30000
DB_POOL_IDLE_TIMEOUT=30000
```

## 🔐 Security Best Practices

### 1. Connection Security

```typescript
// Neon connections are automatically secured with SSL
const config = {
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Neon-specific setting
  max: 20, // Connection pool size
  idleTimeoutMillis: 30000
};
```

### 2. Environment Secrets

- Never commit `.env` files to Git
- Use Vercel's environment variable dashboard
- Rotate secrets regularly
- Use different databases for staging/production

### 3. Database Access

```sql
-- Create read-only user for monitoring
CREATE USER monitoring_user WITH PASSWORD 'secure_password';
GRANT SELECT ON ALL TABLES IN SCHEMA public TO monitoring_user;

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE beacons ENABLE ROW LEVEL SECURITY;
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;
```

## 📊 Monitoring & Performance

### 1. Database Monitoring

```typescript
// Built-in health check endpoint
// GET /api/health
{
  "status": "healthy",
  "database": {
    "connected": true,
    "latency": "12ms",
    "connections": 3
  },
  "quantum": {
    "resonance_functions": "available",
    "last_calculation": "2024-01-01T12:00:00Z"
  }
}
```

### 2. Performance Optimization

```sql
-- Quantum performance indexes (auto-created in schema)
CREATE INDEX CONCURRENTLY idx_beacons_quantum_gin 
ON beacons USING gin (prime_indices);

CREATE INDEX CONCURRENTLY idx_beacons_resonance_btree 
ON beacons USING btree (
  ((prime_indices->>'base_resonance')::numeric)
);
```

### 3. Vercel Analytics

```bash
# Install Vercel Analytics
npm install @vercel/analytics

# Add to your app
import { Analytics } from '@vercel/analytics/react';

export default function App() {
  return (
    <>
      <YourApp />
      <Analytics />
    </>
  );
}
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Connection Timeouts

```bash
# Symptoms: "Connection timeout" errors
# Solution: Increase timeout settings
DB_QUERY_TIMEOUT=60000
DB_CONNECTION_TIMEOUT=10000
```

#### 2. Schema Not Found

```bash
# Symptoms: "relation 'users' does not exist"
# Solution: Run schema initialization
npm run db:migrate
```

#### 3. Function Deployment Timeout

```bash
# Symptoms: Vercel function timeout
# Solution: Optimize database queries or increase timeout
# In vercel.json:
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

### Debug Mode

```bash
# Enable debug logging
DEBUG=neon:*,summoned-spaces:*

# Check connection status
curl https://your-app.vercel.app/api/health
```

## 🔄 Migration Guide

### From SQLite to Neon

If you have existing SQLite data:

```bash
# 1. Set up both databases
export SQLITE_PATH=./summoned-spaces.db
export DATABASE_URL=your_neon_connection_string

# 2. Run migration script
npm run migrate:neon

# 3. Verify migration
npm run verify:migration
```

### Schema Updates

```bash
# Apply schema changes
npm run db:migrate

# Rollback if needed
npm run db:rollback
```

## 🚀 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
          
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 📈 Scaling Considerations

### Database Scaling

```sql
-- Connection pooling optimization
SET max_connections = 100;
SET shared_preload_libraries = 'pg_stat_statements';

-- Query optimization
ANALYZE;
VACUUM;
```

### Vercel Scaling

```json
// vercel.json
{
  "regions": ["iad1", "sfo1"], // Multiple regions
  "functions": {
    "app/api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 30
    }
  }
}
```

## 🎯 Production Checklist

- [ ] Neon database created and configured
- [ ] Environment variables set in Vercel
- [ ] SSL certificates configured
- [ ] Database schema deployed
- [ ] Health checks passing
- [ ] Monitoring setup
- [ ] Backup strategy implemented
- [ ] Error tracking configured
- [ ] Performance monitoring active
- [ ] Security audit completed

## 📚 Additional Resources

- [Neon Documentation](https://neon.tech/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Database Guide](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)

## 🆘 Support

If you encounter issues:

1. Check the [troubleshooting section](#troubleshooting)
2. Review [Vercel logs](https://vercel.com/docs/concepts/observability/logging)
3. Monitor [Neon metrics](https://neon.tech/docs/manage/monitoring)
4. Open an issue on GitHub with detailed error logs

---

**🌟 Your quantum holographic beacon system is now ready for production deployment!**

The combination of Vercel's edge network and Neon's serverless PostgreSQL provides optimal performance and scalability for the Summoned Spaces platform.