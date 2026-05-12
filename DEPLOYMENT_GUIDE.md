# BAYNOIRE HR - Deployment Guide

Complete guide to deploy BAYNOIRE HR to production environments.

## 📋 Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database schema imported in Firebase
- [ ] RLS policies enabled
- [ ] Demo data created (if needed)
- [ ] Email authentication enabled in Firebase
- [ ] Production build tested locally
- [ ] Code reviewed and tested
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Responsive design verified

## 🔧 Pre-Deployment Setup

### 1. Firebase Production Setup

**Create Production Firebase Project:**
1. Log in to Firebase dashboard
2. Create new project with production credentials
3. Keep passwords safe (use password manager)
4. Enable backup and recovery options

**Import Database Schema:**
1. Go to SQL Editor
2. Copy contents of `database-schema.sql`
3. Execute in SQL Editor
4. Verify all tables and policies created

**Configure Authentication:**
1. Go to Authentication → Providers
2. Enable Email provider
3. Set email templates (optional)
4. Configure redirect URLs for your domain

**Production Environment Variables:**
```
VITE_Firebase_URL=https://your-production-project.Firebase.co
VITE_Firebase_ANON_KEY=your-production-anon-key
```

### 2. Local Build Verification

```bash
# Clean previous builds
rm -rf dist

# Install dependencies
npm install

# Run build
npm run build

# Test production build locally
npm run preview
```

Visit `http://localhost:4173` and verify:
- Login page renders correctly
- Forms work without errors
- Navigation functions properly
- All API calls succeed

## 🚀 Deployment Methods

### Option 1: Deploy to Vercel (Recommended)

**Setup:**
1. Create Vercel account at https://vercel.com
2. Connect GitHub repository (or link project)

**Via Command Line:**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to production
vercel --prod
```

**Configuration:**
1. Set environment variables:
   ```
   VITE_Firebase_URL=yourvalue
   VITE_Firebase_ANON_KEY=yourvalue
   ```
2. Set build command: `npm run build`
3. Set output directory: `dist`

**Deploy via GitHub:**
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Automatic deployments on push to main

### Option 2: Deploy to Netlify

**Setup:**
1. Create Netlify account at https://netlify.com
2. Connect GitHub repository

**Via Command Line:**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build project
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

**Via Netlify Dashboard:**
1. Connect GitHub repo
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables
5. Deploy

**netlify.toml Configuration:**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Option 3: Deploy to Heroku

**Setup:**
1. Create Heroku account
2. Install Heroku CLI
3. Create static site buildpack

**Deployment:**
```bash
heroku create baynoire-hr
heroku buildpacks:add heroku/nodejs
heroku buildpacks:add https://github.com/heroku/heroku-buildpack-static.git

# Set environment variables
heroku config:set VITE_Firebase_URL=yourvalue
heroku config:set VITE_Firebase_ANON_KEY=yourvalue

# Deploy
git push heroku main
```

**static.json:**
```json
{
  "root": "dist",
  "clean_urls": true,
  "routes": {
    "/**": "index.html"
  }
}
```

### Option 4: Deploy to AWS S3 + CloudFront

**Setup:**
1. Create S3 bucket for static hosting
2. Create CloudFront distribution
3. Configure bucket policy

**Deployment:**
```bash
# Build project
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

### Option 5: Docker Deployment

**Dockerfile:**
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

**Build and run:**
```bash
docker build -t baynoire-hr .
docker run -p 3000:3000 baynoire-hr
```

## 🔐 Production Security Checklist

### Authentication & Authorization
- [ ] All routes protected with role checks
- [ ] Sensitive operations require auth
- [ ] RLS policies enforced at database level
- [ ] CORS properly configured in Firebase

### Data Protection
- [ ] HTTPS enabled (automatic with major hosts)
- [ ] Sensitive data not logged
- [ ] Database backups enabled in Firebase
- [ ] API keys rotated regularly

### Frontend Security
- [ ] CSRF protection enabled
- [ ] Input validation on all forms
- [ ] XSS prevention with React
- [ ] No sensitive data in local storage

### Monitoring & Logging
- [ ] Error tracking enabled (e.g., Sentry)
- [ ] Database logs monitored
- [ ] Performance monitoring enabled
- [ ] Regular security audits scheduled

## 📊 Post-Deployment

### Verification Checklist
- [ ] Application loads in production
- [ ] Login/logout works
- [ ] Leave requests can be submitted
- [ ] Manager approvals function
- [ ] Database data persists
- [ ] Email notifications work (if configured)
- [ ] No console errors in production

### Monitoring Setup
```javascript
// Add error tracking (example with Sentry)
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production",
  tracesSampleRate: 0.1,
});
```

### Analytics (Optional)
```javascript
// Add Google Analytics or similar
import { Analytics } from "@vercel/analytics/react";

export default function App() {
  return (
    <>
      <YourApp />
      <Analytics />
    </>
  );
}
```

## 🚨 Troubleshooting Deployment

### Build Fails
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Environment Variables Not Working
- Verify variable names start with `VITE_`
- Check `.env.local` is in `.gitignore`
- Restart dev server after env changes
- Verify in Vercel/Netlify dashboard

### Cannot Connect to Firebase
- Verify credentials are correct
- Check Firebase project is active
- Ensure RLS policies allow operations
- Test from local first, then production

### CORS Errors
- Add domain to Firebase CORS in browser security
- Check request headers in browser DevTools
- Verify Firebase project settings

### Styling Issues in Production
- Verify Tailwind CSS build completed
- Check CSS file size in browser DevTools
- Ensure no conflicting global styles

## 🔄 Continuous Deployment Setup

### GitHub Actions Example
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          production: true
```

## 📈 Performance Optimization

### Build Optimization
```bash
# Analyze bundle size
npm install --save-dev webpack-bundle-analyzer
```

### Runtime Optimization
- Enable code splitting for routes
- Lazy load heavy components
- Optimize images
- Enable caching headers

### Database Optimization
- Create indexes on frequently queried columns
- Use views for complex queries
- Monitor query performance in Firebase

## 🌍 Custom Domain Setup

### Vercel
1. Go to project settings
2. Add domain
3. Update DNS records
4. Wait for verification

### Netlify
1. Go to Domain settings
2. Add domain
3. Update DNS records
4. Configure SSL certificate

### DNS Configuration
```
Type: A
Name: @
Value: <provider-ip>

Type: CNAME
Name: www
Value: <provider-domain>
```

## 📧 Email Configuration

### Enable Transactional Emails (Optional)
1. In Firebase, go to Authentication → Email Templates
2. Customize email templates
3. Configure SMTP (optional for custom emails)
4. Test email sending

## 🔄 Updating in Production

### Update Process
```bash
# On main branch
git commit -am "Update feature"
git push origin main

# Automatic deployment triggers
# (if CI/CD configured)
```

### Rollback
```bash
git revert <commit-hash>
git push origin main

# Or revert to previous deployment in host dashboard
```

## 📞 Support Resources

- **Vercel Issues**: https://vercel.com/support
- **Netlify Issues**: https://support.netlify.com
- **Firebase Issues**: https://Firebase.com/support
- **Report Bugs**: Create GitHub issues

## ✅ Final Checklist

Before declaring production ready:
- [ ] All tests passing
- [ ] No console errors or warnings
- [ ] Database backups configured
- [ ] Error monitoring enabled
- [ ] Security headers configured
- [ ] Performance optimized
- [ ] Documentation updated
- [ ] Team trained on system
- [ ] Support plan ready
- [ ] Budget for hosting covered

---

**Production deployment complete!** 🎉

