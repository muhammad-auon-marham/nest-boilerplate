#!/bin/bash
# Sync AI guidelines to all tools
set -euo pipefail

SOURCE=".ai/steering/project-guidelines.md"

echo "🔄 Syncing AI guidelines from $SOURCE..."

# Remove YAML frontmatter for tools that don't support it
awk 'NR==1 && /^---$/ {fm=1; next} fm && /^---$/ {fm=0; next} !fm' "$SOURCE" > temp_rules.md

# Copy to various tools
echo "  → .cursorrules"
cp temp_rules.md .cursorrules

echo "  → .github/copilot-instructions.md"
mkdir -p .github && cp temp_rules.md .github/copilot-instructions.md

echo "  → .windsurfrules"
cp temp_rules.md .windsurfrules

echo "  → .cody/instructions.md"
mkdir -p .cody && cp temp_rules.md .cody/instructions.md

echo "  → .windsurf/cascade.md"
mkdir -p .windsurf && cp temp_rules.md .windsurf/cascade.md

# Clean up
rm temp_rules.md

echo "✅ AI guidelines synced to all tools successfully!"
echo ""
echo "Configured tools:"
echo "  • Cursor AI (.cursorrules)"
echo "  • GitHub Copilot (.github/copilot-instructions.md)"
echo "  • Windsurf (.windsurfrules, .windsurf/cascade.md)"
echo "  • Sourcegraph Cody (.cody/instructions.md)"
echo "  • Kiro (already using .ai/steering/)"
echo "  • Claude Code / AGENTS.md readers (CLAUDE.md → AGENTS.md → .ai/steering/)"
