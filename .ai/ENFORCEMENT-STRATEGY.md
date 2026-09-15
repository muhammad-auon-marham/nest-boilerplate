# How to Ensure Guidelines Are Never Missed

## Multi-Layer Solution

### Layer 1: Auto-Included Guidelines ✅ ACTIVE
Files: .ai/steering/project-guidelines.md + CRITICAL-RULES-CHECKLIST.md
Both have inclusion: always

### Layer 2: Pre-Tool-Use Hook ✅ ACTIVE
Triggers before every file write
Reminds AI to check guidelines

### Layer 3: Automated Validation ✅ READY
Run after AI generates code:
npm run lint:guidelines

Checks (validate-guidelines.js):
- Queries in services (ERROR)
- Entity injection via @InjectRepository (ERROR)
- process.env in services/controllers (ERROR)
- console.log in src (WARNING)
- Deep relative imports (WARNING)

### Layer 4: Lint, Tests & CI ✅ READY
npm run lint:check && npm run build && npm test
Also runs in .github/workflows/ci.yml on every push and pull request

### Layer 5: Your Code Review
After AI writes code, run validation
If violations found, point them out
AI fixes immediately and learns

## Your Workflow

After AI writes code:
1. Run: npm run lint:guidelines
2. If violations → Tell AI to fix
3. AI corrects and learns
4. Commit code

## Why This Works

Prevention: Hook reminds before writing
Detection: Script catches after writing
Correction: Your feedback teaches AI
Learning: AI improves over time

## Bottom Line

Run npm run lint:guidelines after AI generates code
Violations caught immediately
AI learns from corrections
Quality improves over time
