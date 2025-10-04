# Deployment Guide for Summoned Spaces

This guide provides instructions for deploying the Summoned Spaces application to Google Cloud Platform.

## Prerequisites

1. **Google Cloud Account**: Create a Google Cloud account if you don't have one
2. **Google Cloud CLI**: Install the `gcloud` CLI tool
   ```bash
   # macOS
   brew install google-cloud-sdk
   
   # Or download from: https://cloud.google.com/sdk/docs/install
   ```
3. **Docker**: Install Docker Desktop for local testing
4. **Node.js**: Ensure Node.js 18+ is installed

## Deployment Options

### Option 1: Google Cloud Run (Recommended)

Cloud Run is a fully managed serverless platform that automatically scales your containerized applications.

#### Advantages:
- Automatic scaling (including scale to zero)
- Pay only for what you use
- Built-in HTTPS
- Easy to deploy and manage

#### Deployment Steps:

1. **Update environment variables**
   ```bash
   cp .env.production .env.production.local
   # Edit .env.production.local with your actual values
   ```

2. **Deploy using the script**
   ```bash
   ./scripts/deploy-cloud-run.sh YOUR_PROJECT_ID us-central1
   ```

3. **Or deploy manually**
   ```bash
   # Build and push Docker image
   docker build -t gcr.io/YOUR_PROJECT_ID/summoned-spaces .
   gcloud auth configure-docker
   docker push gcr.io/YOUR_PROJECT_ID/summoned-spaces
   
   # Deploy to Cloud Run
   gcloud run deploy summoned-spaces \
     --image gcr.io/YOUR_PROJECT_ID/summoned-spaces \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

### Option 2: Google App Engine

App Engine is a fully managed serverless platform for web applications.

#### Advantages:
- Simple deployment process
- Automatic scaling
- Built-in monitoring
- Good for traditional web apps

#### Deployment Steps:

1. **Deploy using the script**
   ```bash
   ./scripts/deploy-app-engine.sh YOUR_PROJECT_ID
   ```

2. **Or deploy manually**
   ```bash
   gcloud app deploy app.yaml
   ```

## Environment Variables

Configure the following environment variables for production:

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NODE_ENV` | Set to "production" | Yes |
| `PORT` | Server port (default: 8080) | Yes |
| `SESSION_SECRET` | Secret for session encryption | Yes |
| `JWT_SECRET` | Secret for JWT tokens | Yes |

### Setting Environment Variables

#### For Cloud Run:
```bash
gcloud run services update summoned-spaces \
  --set-env-vars DATABASE_URL="your_database_url" \
  --set-env-vars SESSION_SECRET="your_secret"
```

#### For App Engine:
Add to `app.yaml`:
```yaml
env_variables:
  DATABASE_URL: "your_database_url"
  SESSION_SECRET: "your_secret"
```

## Database Setup

The application uses PostgreSQL. You can use:

1. **Google Cloud SQL**
   ```bash
   gcloud sql instances create summoned-spaces-db \
     --database-version=POSTGRES_14 \
     --tier=db-f1-micro \
     --region=us-central1
   ```

2. **Neon Database** (currently configured)
   - Keep your existing Neon database
   - Ensure the connection string is properly set

## Continuous Deployment

### Using Cloud Build

1. **Connect your GitHub repository**
   ```bash
   gcloud builds connect
   ```

2. **Create a build trigger**
   ```bash
   gcloud builds triggers create github \
     --repo-name=summoned-spaces \
     --repo-owner=YOUR_GITHUB_USERNAME \
     --branch-pattern="^main$" \
     --build-config=cloudbuild.yaml
   ```

## Testing Locally

### Test with Docker:
```bash
# Build the image
docker build -t summoned-spaces .

# Run locally
docker run -p 8080:8080 \
  -e DATABASE_URL="your_database_url" \
  -e NODE_ENV="production" \
  summoned-spaces
```

### Test App Engine locally:
```bash
# Install App Engine Python components
gcloud components install app-engine-python

# Run locally
dev_appserver.py app.yaml
```

## Monitoring and Logs

### View logs:
```bash
# Cloud Run logs
gcloud run logs read --service summoned-spaces

# App Engine logs
gcloud app logs tail -s default
```

### Monitor performance:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to your service
3. Check metrics, logs, and error reporting

## Troubleshooting

### Common Issues:

1. **Port binding errors**
   - Ensure your app listens on `process.env.PORT`
   - Default port should be 8080

2. **Database connection issues**
   - Check DATABASE_URL format
   - Ensure Cloud SQL proxy is configured (if using Cloud SQL)
   - Verify network connectivity

3. **Build failures**
   - Check Node.js version compatibility
   - Verify all dependencies are in package.json
   - Review Docker build logs

4. **Memory issues**
   - Increase memory allocation in deployment config
   - Optimize application code
   - Check for memory leaks

## Security Considerations

1. **Secrets Management**
   - Use Google Secret Manager for sensitive data
   - Never commit secrets to version control

2. **Network Security**
   - Configure VPC for database access
   - Use Cloud IAM for access control
   - Enable HTTPS only

3. **Application Security**
   - Keep dependencies updated
   - Use security headers
   - Implement rate limiting

## Cost Optimization

1. **Cloud Run**
   - Set minimum instances to 0
   - Configure concurrency settings
   - Use appropriate CPU/memory allocation

2. **App Engine**
   - Use automatic scaling
   - Configure idle instances
   - Monitor usage patterns

## Next Steps

1. Set up monitoring and alerting
2. Configure custom domain
3. Implement CI/CD pipeline
4. Set up backup strategies
5. Configure CDN for static assets

For more information, refer to:
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [App Engine Documentation](https://cloud.google.com/appengine/docs)
- [Cloud Build Documentation](https://cloud.google.com/build/docs)