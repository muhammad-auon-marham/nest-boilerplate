# Deployment Checklist

Copy this checklist into the pull request (or release ticket) for every feature that goes to production.

## Pre-Deployment Verification

### Code Quality
- [ ] All TypeScript files compile without errors (`npm run build`)
- [ ] `npm run lint:check` reports 0 errors
- [ ] `npm run lint:guidelines` passes
- [ ] No console.log statements
- [ ] No commented-out code
- [ ] Proper error handling implemented
- [ ] Logging integrated with `LoggerService` (no secrets or PII)

### Testing
- [ ] All unit tests pass (`npm test`)
- [ ] New code has unit tests (services, controllers, DTOs)
- [ ] E2E tests pass for affected flows (`npm run test:e2e`)
- [ ] Edge cases and error scenarios tested

### Architecture
- [ ] All queries in repository layer
- [ ] Repositories extend `BaseRepository`
- [ ] DTOs for all inputs
- [ ] Enums/constants instead of magic values
- [ ] Imports use `@` aliases
- [ ] Multi-table writes are transactional
- [ ] Soft deletes respected

### Documentation
- [ ] `API_DOCUMENTATION.md` updated
- [ ] `.ai/steering/project-context.md` → *Recent Implementations* entry added
- [ ] New environment variables added to `.env.example`

---

## Deployment Steps

### Step 1: Code Review
```bash
git diff origin/main...HEAD
```

### Step 2: Run Tests
```bash
npm ci
npm test
```

### Step 3: Build Verification
```bash
npm run build
npm run lint:check
```

### Step 4: Database Migration
```bash
npm run migration:run
```

### Step 5: Smoke Testing
```bash
npm run start:prod
curl -f http://localhost:3000/api/v1/health
```

### Step 6: Production Deployment
Deploy using your pipeline (e.g. `docker compose up -d --build`) and watch the logs:
```bash
tail -f logs/$(date +%F).log
```

---

## Post-Deployment Verification

### Database
- [ ] Migrations applied (`migrations` table contains the new entries)
- [ ] Indexes created successfully

### Application
- [ ] Health check returns `200`
- [ ] No errors in logs (`logs/error-*.log`)
- [ ] New module loaded successfully

### Functionality
- [ ] Critical user flows work end-to-end
- [ ] `TODO` feature-specific checks

---

## Rollback Plan

If issues occur:

### Step 1: Revert Code
```bash
git revert <commit-hash>
git push origin main
```

### Step 2: Revert Database
```bash
npm run migration:revert
```

### Step 3: Restart Application
Redeploy the previous image/build and confirm the health check.

---

## Monitoring

### Key Metrics
- Error rate (5xx) and latency per endpoint
- Authentication failure rate (401s)
- Rate-limit rejections (429s)
- Database query performance
- Queue depth / failed jobs (if `JobsModule` is enabled)

### Logs to Watch
```bash
tail -f logs/$(date +%F).log
tail -f logs/error-$(date +%F).log
```

---

## Sign-Off

- [ ] Code Review Approved
- [ ] Tests Passed
- [ ] Build Successful
- [ ] Migration Successful
- [ ] Smoke Tests Passed
- [ ] Production Deployment Complete
- [ ] Post-Deployment Verification Complete

---

**Deployment Date:** _______________
**Deployed By:** _______________
**Verified By:** _______________
