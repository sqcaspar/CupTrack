# CupTrack Development Guide

## 🚨 Preventing Development Server Issues

### **Why does `http://localhost:3000` become inaccessible?**

When you make code changes and the development server becomes unreachable, it's usually due to:

1. **TypeScript Compilation Errors**: React dev server stops serving when there are type errors
2. **Hot Module Replacement Failures**: Broken modules prevent the app from updating
3. **Syntax Errors**: JavaScript/TypeScript syntax issues break compilation
4. **Import/Export Issues**: Missing or incorrect imports cause module resolution failures

## 🛠️ Enhanced Development Scripts

We've added several scripts to `package.json` to prevent and diagnose issues:

```bash
# Check TypeScript types without building
npm run type-check

# Watch for type errors in real-time  
npm run type-check:watch

# Fix ESLint errors automatically
npm run lint:fix

# Safe development start (checks types first)
npm run dev:safe

# Run all checks (types + linting)
npm run dev:check
```

## 📋 Safe Development Workflow

### **Making Type Changes Safely**

When changing TypeScript interfaces or types:

1. **Before Making Changes**:
   ```bash
   cd frontend
   npm run type-check    # Ensure current state is clean
   ```

2. **Make Changes Incrementally**:
   - Update interface definitions first
   - Update one file at a time to match new types
   - Run `npm run type-check` after each file update

3. **Test Frequently**:
   ```bash
   npm run dev:check     # Check types + linting
   npm run build         # Full build test
   ```

### **Recovery from Broken State**

If your development server becomes inaccessible:

1. **Stop all processes**:
   ```bash
   # Kill any running servers
   pkill -f "react-scripts"
   pkill -f "node.*3000"
   pkill -f "node.*3001"
   ```

2. **Check for errors**:
   ```bash
   cd frontend
   npm run type-check     # Look for TypeScript errors
   npm run lint          # Look for ESLint errors
   ```

3. **Fix errors before restarting**:
   - Address any TypeScript compilation errors shown
   - Fix syntax errors or import issues
   - Use `npm run lint:fix` for automatic fixes

4. **Safe restart**:
   ```bash
   npm run dev:safe      # This checks types before starting
   ```

## 🎯 VS Code Integration

### **Automatic Setup**

The workspace includes:
- **Settings**: Auto-save, format on save, TypeScript validation
- **Tasks**: Pre-configured tasks for type checking and safe development
- **Problem Detection**: Real-time error highlighting

### **Using VS Code Tasks**

Press `Cmd+Shift+P` (macOS) or `Ctrl+Shift+P` (Windows/Linux) and type:
- "Tasks: Run Task" → "Type Check Frontend"
- "Tasks: Run Task" → "Safe Dev Start"
- "Tasks: Run Task" → "Full Development Check"

### **Problem Panel**

- Press `Cmd+Shift+M` to open the Problems panel
- See TypeScript errors, ESLint warnings, and other issues
- Fix issues before they break the development server

## 🔄 Common Development Scenarios

### **Scenario 1: Adding New Form Fields**

```bash
# 1. Plan the change
npm run type-check

# 2. Update interface
# Edit src/types/brew.ts

# 3. Check impact
npm run type-check

# 4. Update components one by one
# Edit components that use the interface
npm run type-check  # after each component

# 5. Test full build
npm run build
```

### **Scenario 2: Changing Existing Types**

```bash
# 1. Identify all affected files
grep -r "oldTypeName" src/

# 2. Update type definition
# Edit the interface/type file

# 3. Fix errors incrementally
npm run type-check  # see all errors
# Fix one file at a time
npm run type-check  # repeat until clean

# 4. Safe restart
npm run dev:safe
```

### **Scenario 3: Complex Refactoring**

```bash
# 1. Create a feature branch
git checkout -b feature/my-changes

# 2. Use type-check watch mode
npm run type-check:watch  # in separate terminal

# 3. Make changes with real-time feedback
# Watch the type-check terminal for errors

# 4. Validate before committing
npm run dev:check
npm run build
```

## ⚡ Performance Tips

### **Faster Development**

1. **Use TypeScript Watch Mode**:
   ```bash
   npm run type-check:watch
   ```

2. **Keep Problems Panel Open**: See issues immediately

3. **Enable Auto-Save**: Configured in VS Code settings

4. **Use ESLint Auto-Fix**: 
   ```bash
   npm run lint:fix
   ```

### **Avoiding Common Pitfalls**

❌ **Don't do this**:
- Make multiple type changes at once
- Ignore TypeScript errors and "fix later"
- Skip type checking before restarting servers
- Change interfaces without checking usage

✅ **Do this instead**:
- Make incremental changes
- Fix types immediately when errors appear
- Use `npm run dev:safe` for server starts
- Plan interface changes carefully

## 🧪 Testing Your Changes

### **Before Committing**

```bash
# Full validation
npm run dev:check      # Types + linting
npm run build         # Production build test
npm test              # Unit tests
```

### **Before Starting Work**

```bash
# Ensure clean starting state
npm run type-check
npm run lint
```

### **During Development**

```bash
# In one terminal
npm run type-check:watch

# In another terminal  
npm start
```

## 🔧 Troubleshooting

### **Server Won't Start**

1. Check for TypeScript errors: `npm run type-check`
2. Check for syntax errors: `npm run lint`
3. Clear build cache: `rm -rf node_modules/.cache`
4. Restart with type checking: `npm run dev:safe`

### **Hot Reloading Not Working**

1. Save files properly (auto-save helps)
2. Check browser console for errors
3. Refresh browser manually
4. Restart development server

### **TypeScript Errors After Refactoring**

1. Run `npm run type-check` to see all errors
2. Fix errors in dependency order (types first, then users)
3. Use VS Code's "Go to Definition" to find usage
4. Consider using "Find All References" for complex changes

## 🎯 Summary

**Key takeaway**: The development server becomes inaccessible when there are compilation errors. The new scripts and VS Code setup help you:

1. **Catch errors early** with `type-check` and watch mode
2. **Fix issues safely** with incremental validation
3. **Start servers safely** with `dev:safe`
4. **Get immediate feedback** with VS Code integration

Always run `npm run type-check` before making significant changes and after any refactoring!