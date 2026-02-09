# GitHub Actions Workflows

This directory contains CI/CD workflows for automated testing and deployment.

## Workflows

### 1. CI/CD Pipeline (`ci.yml`)

**Triggers:**
- Push to `main`, `master`, or `develop` branches
- Pull requests to `main`, `master`, or `develop` branches

**Jobs:**

#### Test
- Runs on Node.js 16.x, 18.x, and 20.x
- Executes all unit tests with coverage
- Uploads coverage reports to Codecov (Node 20.x only)

#### Lint
- Validates code quality
- Runs build to check for errors

#### Build
- Creates production build
- Uploads build artifacts for 7 days
- Only runs after tests and linting pass

#### Deploy
- Deploys to Netlify (production)
- Only runs on push to `main`/`master` branches
- Requires secrets: `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID`

### 2. PR Checks (`pr-checks.yml`)

**Triggers:**
- Pull request opened, synchronized, or reopened

**Jobs:**

#### Test Coverage Check
- Runs full test suite with coverage
- Posts coverage report as PR comment

#### Code Quality
- Validates build succeeds
- Ensures no breaking changes

### 3. Dependency Review (`dependency-review.yml`)

**Triggers:**
- All pull requests

**Purpose:**
- Scans for vulnerable dependencies
- Fails on moderate+ severity issues
- Helps maintain secure dependencies

## Setup Instructions

### Required GitHub Secrets

To enable deployment, add these secrets to your repository:

1. **NETLIFY_AUTH_TOKEN**
   - Get from: Netlify → User Settings → Applications → Personal access tokens
   - Scope: Full access

2. **NETLIFY_SITE_ID**
   - Get from: Netlify → Site Settings → Site information → API ID

### Adding Secrets

1. Go to GitHub repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add each secret with the corresponding value

### Optional: Codecov Integration

For enhanced coverage reporting:

1. Sign up at [codecov.io](https://codecov.io)
2. Connect your GitHub repository
3. Coverage will be automatically uploaded (no token needed for public repos)

## Status Badges

Add these badges to your README.md:

```markdown
![CI/CD](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/CI/CD%20Pipeline/badge.svg)
[![codecov](https://codecov.io/gh/YOUR_USERNAME/YOUR_REPO/branch/main/graph/badge.svg)](https://codecov.io/gh/YOUR_USERNAME/YOUR_REPO)
```

## Local Testing

Test the same commands locally before pushing:

```bash
# Run tests with coverage
npm run test:ci

# Build for production
npm run build
```

## Troubleshooting

### Tests fail in CI but pass locally
- Check Node.js version compatibility
- Ensure all dependencies are in `package.json`
- Review CI logs for specific errors

### Deployment fails
- Verify `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID` are set
- Check Netlify build settings match local configuration
- Review Netlify deployment logs

### Coverage threshold not met
- Run `npm run test:coverage` locally
- Add tests for uncovered code
- Adjust thresholds in `package.json` if needed
