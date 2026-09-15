# AI Tools Configuration Guide

This folder contains shared instructions, guidelines, and skills for all AI coding assistants.

## Folder Structure

```
.ai/
├── steering/                        # Coding guidelines and rules
│   ├── project-guidelines.md        # MASTER rules (inclusion: always)
│   ├── CRITICAL-RULES-CHECKLIST.md  # Pre-write checklist (inclusion: always)
│   ├── project-context.md           # Impact map + log of recent implementations
│   ├── PRODUCT-FLOWS.md             # User journeys / API sequences
│   └── MISSING-GUIDANCE.md          # What project-context.md should grow into
├── skills/                          # Testing patterns and specialized knowledge
│   ├── api-testing-patterns/
│   └── e2e-testing-patterns/
└── cursor/                          # Cursor-specific configs
    └── worktrees.json
```

Root-level entry points that point back here:

- `AGENTS.md` — summary of the rules for agents that read `AGENTS.md` (Codex, Cursor, Gemini CLI, ...)
- `CLAUDE.md` — imports `AGENTS.md` for Claude Code
- `.kiro/hooks/` — pre-write reminder hook for Kiro
- `skills/` + `skills-lock.json` — installed agent skills (source of `.ai/skills`)

## Configuration by AI Tool

### 1. Kiro (Current - Already Configured ✅)

Kiro automatically reads from `.ai/steering/` and `.ai/skills/`.

**Files with `inclusion: always`** in frontmatter are automatically loaded.

No additional configuration needed!

### 2. Cursor AI

**Method 1: Using .cursorrules file (Recommended)**

Create `.cursorrules` in project root:

```bash
# In project root
cat .ai/steering/project-guidelines.md > .cursorrules
```

Or manually create `.cursorrules`:

```markdown
# Project Coding Guidelines

Always write the query inside repository. Never write direct query inside the service.
Always create proper repository (avoid Injecting Entity as Repository)
Always extend repository from the /src/common/repositories/base.repository.ts
Always create proper service, controller, repository, dto, entities for any module
While importing one file into another, if the file is 2 directories back, use @ in paths rather than '../../'
After creating API, Always update the API_DOCUMENTATION.md file
Always import all file in the .module.ts file
If a module has more than one repository or controller or service, move them to a proper folder as {module}/services or /controllers or /repositories
Don't add the functions like encode, decode, format, transform time/date in the services or controllers. Always create proper utils for them and add such functions there
Always use proper enums constants instead of using magic values like === 1, or === 2
Maximum of one white line is allowed before/after the start/end of the function.
Always, re-use the code and avoid creating boilerplate code.
Don't create separate .md files for the explanation of the feature, unless demanded by user.
If incoming request has more than 1 parameters, also make a dto for this
If more than 2 variables are passed in any internal function, make a proper interface for this
```

> The list above is a quick copy. The full, current rules always live in `.ai/steering/project-guidelines.md` — run `./sync-ai-rules.sh` instead of copying by hand.

**Method 2: Reference in Chat**

In Cursor chat, use:
```
@.ai/steering/project-guidelines.md
```

**Method 3: Cursor Settings**

1. Open Cursor Settings (Ctrl+,)
2. Search for "Rules for AI"
3. Add path: `.ai/steering/project-guidelines.md`

### 3. Claude Code (Anthropic)

**Method 1: CLAUDE.md (Already Configured ✅)**

Claude Code loads `CLAUDE.md` from the project root automatically. It imports `AGENTS.md`, which links to `.ai/steering/`.

**Method 2: Custom instructions**

```
Read and follow the coding guidelines in .ai/steering/project-guidelines.md

Key rules:
- Write queries in repositories, not services
- Extend repositories from /src/common/repositories/base.repository.ts
- Use @ imports for files 2+ directories back
- Update API_DOCUMENTATION.md after creating APIs
- Create DTOs for requests with multiple parameters
- Use enums instead of magic values
```

**Method 3: Reference in Chat**

```
Please read .ai/steering/project-guidelines.md and follow those guidelines
```

### 4. GitHub Copilot

**Method 1: Using .github/copilot-instructions.md**

Create `.github/copilot-instructions.md`:

```bash
mkdir -p .github
cp .ai/steering/project-guidelines.md .github/copilot-instructions.md
```

**Method 2: Inline Comments**

Add to key files:
```typescript
/**
 * CODING GUIDELINES:
 * - Queries in repositories only
 * - Extend from base.repository.ts
 * - Use @ imports for 2+ directories back
 * See .ai/steering/project-guidelines.md for full guidelines
 */
```

### 5. Codeium

**In Codeium Settings:**

1. Open Codeium settings
2. Look for "Context" or "Instructions"
3. Add reference to `.ai/steering/project-guidelines.md`

**Or in chat:**
```
@file .ai/steering/project-guidelines.md
```

### 6. Tabnine

**In Tabnine Settings:**

1. Open Tabnine Hub
2. Go to "Team Settings" or "Workspace Settings"
3. Add custom instructions referencing `.ai/steering/project-guidelines.md`

### 7. Windsurf (Codeium)

**Method 1: .windsurfrules file**

Create `.windsurfrules` in project root:

```bash
cp .ai/steering/project-guidelines.md .windsurfrules
```

**Method 2: Cascade Configuration**

Create `.windsurf/cascade.md`:

```bash
mkdir -p .windsurf
cp .ai/steering/project-guidelines.md .windsurf/cascade.md
```

### 8. Aider

**In .aider.conf.yml:**

```yaml
# .aider.conf.yml
read:
  - .ai/steering/project-guidelines.md
  - .ai/skills/api-testing-patterns/SKILL.md
  - .ai/skills/e2e-testing-patterns/SKILL.md
```

**Or via command line:**
```bash
aider --read .ai/steering/project-guidelines.md
```

### 9. Continue.dev

**In .continuerc.json:**

```json
{
  "systemMessage": "Follow the coding guidelines in .ai/steering/project-guidelines.md",
  "contextProviders": [
    {
      "name": "file",
      "params": {
        "files": [".ai/steering/project-guidelines.md"]
      }
    }
  ]
}
```

### 10. Sourcegraph Cody

**In .cody/instructions.md:**

```bash
mkdir -p .cody
cp .ai/steering/project-guidelines.md .cody/instructions.md
```

### 11. Amazon CodeWhisperer

**In .aws/codewhisperer/instructions.md:**

```bash
mkdir -p .aws/codewhisperer
cp .ai/steering/project-guidelines.md .aws/codewhisperer/instructions.md
```

### 12. Replit AI (Ghostwriter)

**In .replit file:**

```toml
[ai]
instructions = """
Follow guidelines in .ai/steering/project-guidelines.md
"""
```

## Universal Approach (Works with Most Tools)

### Option 1: Create Tool-Specific Config Files

Run this script to create configs for multiple tools:

```bash
# Create .cursorrules
cp .ai/steering/project-guidelines.md .cursorrules

# Create .github/copilot-instructions.md
mkdir -p .github
cp .ai/steering/project-guidelines.md .github/copilot-instructions.md

# Create .windsurfrules
cp .ai/steering/project-guidelines.md .windsurfrules

# Create .cody/instructions.md
mkdir -p .cody
cp .ai/steering/project-guidelines.md .cody/instructions.md
```

### Option 2: Reference in Every Chat

Start your conversation with:
```
Please read and follow the guidelines in .ai/steering/project-guidelines.md
```

### Option 3: Add to README.md

Add a section to your project README:

```markdown
## AI Coding Guidelines

All AI assistants should follow the guidelines in `.ai/steering/project-guidelines.md`

Key principles:
- Queries in repositories only
- Extend from base.repository.ts
- Use @ imports for nested paths
- Update API_DOCUMENTATION.md
- Create DTOs and interfaces appropriately
```

## Maintaining Consistency

### Single Source of Truth

The **master file** is: `.ai/steering/project-guidelines.md`

When updating guidelines:

1. Edit `.ai/steering/project-guidelines.md`
2. Sync to other tools:

```bash
# Update all tool-specific configs
cp .ai/steering/project-guidelines.md .cursorrules
cp .ai/steering/project-guidelines.md .github/copilot-instructions.md
cp .ai/steering/project-guidelines.md .windsurfrules
cp .ai/steering/project-guidelines.md .cody/instructions.md
```

### Automation Script

Create `sync-ai-rules.sh`:

```bash
#!/bin/bash
# Sync AI guidelines to all tools

SOURCE=".ai/steering/project-guidelines.md"

# Remove YAML frontmatter for tools that don't support it
awk 'NR==1 && /^---$/ {fm=1; next} fm && /^---$/ {fm=0; next} !fm' "$SOURCE" > temp_rules.md

# Copy to various tools
cp temp_rules.md .cursorrules
mkdir -p .github && cp temp_rules.md .github/copilot-instructions.md
cp temp_rules.md .windsurfrules
mkdir -p .cody && cp temp_rules.md .cody/instructions.md
mkdir -p .windsurf && cp temp_rules.md .windsurf/cascade.md

rm temp_rules.md

echo "✅ AI guidelines synced to all tools"
```

Make it executable:
```bash
chmod +x sync-ai-rules.sh
```

Run after updating guidelines:
```bash
./sync-ai-rules.sh
```

## Testing Configuration

To verify each tool is reading the guidelines:

1. **Ask the AI**: "What are the project coding guidelines?"
2. **Test a rule**: Ask it to create a repository and see if it extends from base.repository.ts
3. **Check imports**: See if it uses `@` for nested imports

## Troubleshooting

### Tool Not Following Guidelines

1. Check if the tool supports custom instructions
2. Try referencing the file explicitly in chat: `@.ai/steering/project-guidelines.md`
3. Copy content directly into tool's settings
4. Use inline comments in code as reminders

### Guidelines Not Loading

1. Verify file path is correct
2. Check file permissions
3. Restart the IDE/tool
4. Try absolute path instead of relative

### Conflicts Between Tools

If different tools interpret guidelines differently:
1. Make guidelines more explicit
2. Add tool-specific sections in the guidelines
3. Create separate files for tools with unique requirements

## Best Practices

1. **Keep it DRY**: Maintain one source of truth in `.ai/steering/`
2. **Version Control**: Commit all AI config files
3. **Document Changes**: Update this README when adding new tools
4. **Team Alignment**: Ensure all team members configure their tools
5. **Regular Sync**: Run sync script after updating guidelines

## Adding New Tools

When adding a new AI tool:

1. Check tool's documentation for custom instructions
2. Add configuration section to this README
3. Update sync script if needed
4. Test that guidelines are being followed
5. Document any tool-specific quirks

## Questions?

If you're unsure how to configure a specific tool, check:
- Tool's official documentation
- `.ai/steering/project-guidelines.md` for the master guidelines
- This README for tool-specific instructions
