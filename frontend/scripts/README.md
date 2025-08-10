# Development Scripts

This directory contains scripts to help maintain a stable development environment for the CupTrack application.

## Scripts Overview

### 🚀 `dev-start.sh` - Automated Development Server Startup

**Purpose**: Provides automated cleanup and reliable startup of the React development server.

**Usage**:
```bash
# Direct execution
./scripts/dev-start.sh

# Via npm script (recommended)
npm run dev
```

**What it does**:
1. **Process Cleanup** - Kills any existing processes on ports 3000-3003
2. **Dependency Health** - Checks and fixes missing or corrupted dependencies
3. **Cache Management** - Clears npm cache if it's old or corrupted
4. **Configuration Validation** - Verifies TypeScript and critical dependencies
5. **Server Startup** - Starts the development server with proper configuration

**When to use**:
- Every time you start development (replaces `npm start`)
- When you encounter "can't connect to server" issues
- After switching branches or pulling updates
- When the server was previously terminated unexpectedly

### 🏥 `health-check.sh` - Development Environment Health Check

**Purpose**: Comprehensive validation of the development environment health.

**Usage**:
```bash
# Direct execution
./scripts/health-check.sh

# Via npm script
npm run health
```

**What it checks**:
- **System Requirements**: Node.js and npm versions
- **Dependencies**: Installation status and known conflicts
- **Network & Ports**: Port availability and npm registry connectivity
- **Configuration**: Required files and directory structure
- **Environment Health**: Cache status, disk space, conflicting lockfiles

**Output**:
- ✅ **PASS**: All checks successful
- ⚠️ **WARN**: Issues that may cause problems but won't prevent startup
- ❌ **FAIL**: Critical issues that will prevent development

**When to use**:
- Before starting development work
- When diagnosing development environment issues
- After major dependency changes
- When onboarding new team members

## Common Development Issues Resolved

### Server Won't Start / "Can't Connect" Errors

**Root Causes**:
1. **Port Conflicts**: Previous server processes still running
2. **Dependency Issues**: TypeScript version mismatches, missing modules
3. **npm Cache Problems**: Corrupted package cache
4. **Build System Issues**: Webpack configuration problems

**Solution**: Use `npm run dev` for automated resolution

### TypeScript / Dependency Conflicts

**Root Cause**: react-scripts 5.0.1 expects TypeScript ^3.2.1 || ^4, but the project uses ^5.x

**Solution**: 
- The scripts automatically handle this with `--legacy-peer-deps`
- package.json has been updated with version constraints and resolutions

### Performance Issues / Slow Startup

**Root Causes**:
1. Large npm cache
2. Multiple node_modules reinstallations
3. Missing optimizations

**Prevention**:
- Regular cache cleanup (handled automatically)
- Consistent use of npm scripts
- Health checks before major work sessions

## Advanced Usage

### Manual Troubleshooting

If the automated scripts don't resolve your issues:

```bash
# Check what's running on development ports
lsof -ti:3000,3001,3002,3003

# Kill all processes on those ports
lsof -ti:3000,3001,3002,3003 | xargs kill -9

# Full dependency reset
rm -rf node_modules package-lock.json
npm cache clean --force
npm install --legacy-peer-deps

# Start with explicit configuration
PORT=3000 npm start
```

### Customizing the Scripts

Both scripts are designed to be safe and non-destructive. They:
- Never delete source code or configuration files
- Always ask before making major changes (when interactive)
- Provide detailed output about what they're doing
- Can be safely interrupted with Ctrl+C

To modify behavior:
1. Edit the scripts in this directory
2. Test your changes in a development environment first
3. Update this README with any behavioral changes

## Integration with Development Workflow

### Recommended Daily Workflow

1. **Start of day**: `npm run health` to check environment
2. **Begin work**: `npm run dev` to start the server
3. **After breaks**: If server is unresponsive, `npm run dev` to restart cleanly
4. **End of day**: Ctrl+C to stop the server (scripts handle cleanup)

### Team Development

- All team members should use `npm run dev` instead of `npm start`
- Run `npm run health` when experiencing any development issues
- Include script output in bug reports for faster resolution

### CI/CD Integration

The health check script returns appropriate exit codes:
- `0`: All checks passed, ready for development
- `1+`: Number of critical issues found

This makes it suitable for pre-commit hooks or CI validation:

```bash
# In a pre-commit hook
./scripts/health-check.sh || exit 1
```

## Troubleshooting the Scripts

### Script Won't Execute

**Error**: `Permission denied` or `command not found`

**Solution**:
```bash
# Make scripts executable
chmod +x scripts/*.sh

# Run with explicit bash if needed
bash scripts/dev-start.sh
```

### Script Fails with Dependency Issues

**Error**: Scripts report missing dependencies

**Solution**:
1. Check that you're in the frontend directory
2. Ensure package.json exists
3. Try manual npm install: `npm install --legacy-peer-deps`

### Performance Issues

If scripts run slowly:
1. Check available disk space: `df -h`
2. Clear system caches if needed
3. Consider using a faster package manager (yarn/pnpm) for future projects

## Future Enhancements

Potential improvements to consider:
- Docker integration for fully consistent environments
- Integration with VS Code tasks
- Automatic environment variable validation
- Performance profiling during startup
- Integration with testing frameworks

---

**Need Help?** Check the troubleshooting section in CLAUDE.md or run `npm run health` for environment diagnostics.