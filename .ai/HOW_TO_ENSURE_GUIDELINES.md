# How to Ensure AI Tools Always Follow Your Guidelines

## Current Setup ✅

Your guidelines are already configured to be **automatically included** in every Kiro conversation, and are referenced from `AGENTS.md` / `CLAUDE.md` for other agents:

- **File**: `.ai/steering/project-guidelines.md`
- **Status**: Active with `inclusion: always`
- **Verification**: Look for "## Included Rules (project-guidelines.md) [Workspace]" at the top of AI responses

## Additional Safeguards

### 1. Pre-Tool-Use Hook (Already Created ✅)

A hook has been created that **automatically reminds the AI** to check guidelines before writing any code.

**What it does**:
- Triggers before any file write operation
- Reminds AI to verify all guidelines
- Lists critical rules to check
- Prevents guideline violations

**To view/edit**: Open Command Palette → "Open Kiro Hook UI"

### 2. Verification Methods

**How to Check if Guidelines are Active:**

1. **Look for the header** in AI responses:
   ```
   ## Included Rules (project-guidelines.md) [Workspace]
   ```

2. **Test the AI**:
   Ask: "Create a new service that fetches user data"
   
   The AI should:
   - Create a repository with the query
   - Create a service that calls the repository
   - NOT put queries in the service

3. **Run the validator**:
   ```bash
   npm run lint:guidelines
   ```

4. **Check the hook**:
   - Open Kiro Hooks panel
   - Verify "Check Coding Guidelines" hook exists
   - Status should be "Active"

## What You Need to Do

### Nothing! It's Already Working ✅

The setup is complete:
1. ✅ Guidelines are in `.ai/steering/project-guidelines.md`
2. ✅ Auto-included with `inclusion: always`
3. ✅ Pre-tool-use hook is active
4. ✅ Kiro reads from `.ai/` automatically

### Optional Enhancements

**For Other AI Tools:**
Run `./sync-ai-rules.sh` (macOS/Linux) or `sync-ai-rules.bat` (Windows) to configure Cursor, Copilot, Windsurf, etc.

**For Your Team:**
Share `.ai/README.md` with team members so they configure their AI tools

**For Stricter Enforcement:**
Run `npm run lint:guidelines` in a git pre-commit hook or CI

## How It Works

1. **Every conversation**: Guidelines are automatically loaded
2. **Before writing code**: Hook triggers and reminds AI to check rules
3. **If violation occurs**: You point it out, AI corrects immediately
4. **Learning**: AI learns from corrections and improves

## When AI Violates Guidelines

Simply say:
```
"This violates the guideline: [specific rule]"
```

The AI will:
1. Acknowledge the violation
2. Explain what was wrong
3. Fix it immediately
4. Remember for future code

## Summary

**You don't need to do anything!** The system is already working:

✅ Guidelines auto-loaded
✅ Hook active
✅ AI reminded before every code write
✅ Corrections applied when violations occur

**Optional**: Configure other AI tools using `sync-ai-rules.sh` / `sync-ai-rules.bat`
