@echo off
REM Sync AI guidelines to all tools (Windows version)

set SOURCE=.ai\steering\project-guidelines.md

echo Syncing AI guidelines from %SOURCE%...

REM Remove YAML frontmatter (first 4 lines: ---, inclusion, priority, ---) for tools that don't support it
powershell -Command "Get-Content '%SOURCE%' | Select-Object -Skip 4 | Out-File -Encoding UTF8 temp_rules.md"

REM Copy to various tools
echo   -^> .cursorrules
copy /Y temp_rules.md .cursorrules >nul

echo   -^> .github\copilot-instructions.md
if not exist .github mkdir .github
copy /Y temp_rules.md .github\copilot-instructions.md >nul

echo   -^> .windsurfrules
copy /Y temp_rules.md .windsurfrules >nul

echo   -^> .cody\instructions.md
if not exist .cody mkdir .cody
copy /Y temp_rules.md .cody\instructions.md >nul

echo   -^> .windsurf\cascade.md
if not exist .windsurf mkdir .windsurf
copy /Y temp_rules.md .windsurf\cascade.md >nul

REM Clean up
del temp_rules.md

echo.
echo AI guidelines synced to all tools successfully!
echo.
echo Configured tools:
echo   * Cursor AI (.cursorrules)
echo   * GitHub Copilot (.github\copilot-instructions.md)
echo   * Windsurf (.windsurfrules, .windsurf\cascade.md)
echo   * Sourcegraph Cody (.cody\instructions.md)
echo   * Kiro (already using .ai\steering\)
echo   * Claude Code / AGENTS.md readers (CLAUDE.md -^> AGENTS.md -^> .ai\steering\)
echo.
pause
