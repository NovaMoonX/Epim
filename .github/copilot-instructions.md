# GitHub AI Instructions for project

## Core Development Rules

### 1. Code Formatting
- **Use 2 spaces for indentation** (NOT 4 spaces or tabs)
- This applies to all TypeScript/JavaScript, JSON, and configuration files
- Ensure consistent indentation throughout the codebase

### 2. Component Creation
- Use `export function ComponentName` syntax (NOT `React.FC` or arrow functions)

### 3. Return Value Debugging
- Always store return values in variables before returning them for easier debugging
- This applies to all callbacks, computed values, and complex expressions

```tsx
// ❌ Hard to debug - direct return
const answeredCount = useMemo(() => {
  if (!selectedApartment) return 0;
  return allQuestions.filter(
    (q) => getAnswer(q.id, selectedApartment) !== '',
  ).length;
}, [allQuestions, selectedApartment, getAnswer]);

// ✅ Easy to debug - store in variable first
const answeredCount = useMemo(() => {
  if (!selectedApartment) return 0;
  
  const result = allQuestions.filter(
    (q) => getAnswer(q.id, selectedApartment) !== '',
  ).length;
  
  return result;
}, [allQuestions, selectedApartment, getAnswer]);
```

### 4. Styling & Class Names
- Use TailwindCSS exclusively
- **ALWAYS** use `join` from `@moondreamsdev/dreamer-ui/utils` for conditional class names
- **NEVER** use template literals with `${` for className - always use `join()` instead
- Use existing styles and colors from `src/dreamer-ui.css` and `src/index.css` when applicable (do not modify them)

```tsx
import { join } from '@moondreamsdev/dreamer-ui/utils';

export function Test({ variant, className }: TestProps) {
  return (
    <div 
      className={join(
        'px-4 py-2 rounded',
        variant === 'primary' ? 'bg-primary text-primary-foreground' : 'bg-secondary',
        className
      )}
    >
      Click me
    </div>
  );
}
```

**❌ NEVER DO THIS:**
```tsx
// Bad - template literals for conditional classes
className={`base-class ${condition ? 'conditional-class' : ''}`}
className={`base-class ${isActive ? 'active' : 'inactive'}`}
```

**✅ ALWAYS DO THIS:**
```tsx
// Good - use join() for all conditional classes
className={join('base-class', condition && 'conditional-class')}
className={join('base-class', isActive ? 'active' : 'inactive')}
```

### 5. Component Library Priority
- Always check Dreamer UI first before creating custom components
- Import from `@moondreamsdev/dreamer-ui/components`, `/hooks`, `/symbols`, `/utils`
- Always check existing props of Dream UI components before setting custom styles

### 6. File Structure
Follow the existing structure:
```
src/
├── components/ # Reusable UI components
├── contexts/   # React context providers (Should always import the context from its hook file)
├── hooks/      # Custom React hooks (should always declare the context they use)
├── lib/        # Utilities and constants
├── routes/     # Router configuration
├── screens/    # Page/route components
├── store/      # State management (i.e. Redux store)
├── styles/     # Additional CSS/styling files
├── ui/         # Layout and core UI components
├── utils/      # Utility functions
```

### 7. Import Patterns
```tsx
// Dreamer UI imports
import { Button } from '@moondreamsdev/dreamer-ui/components';
import { join } from '@moondreamsdev/dreamer-ui/utils';
import { useTheme } from '@moondreamsdev/dreamer-ui/hooks';

// Project imports using aliases
import { APP_TITLE } from '@lib/app';
import Home from '@screens/Home';
import Layout from '@ui/Layout';
import { router } from '@routes/AppRoutes';
import MyComponent from '@components/MyComponent';
import { useCustomHook } from '@hooks/useCustomHook';
import { MyContext } from '@contexts/MyContext';
import { store } from '@store';
import { helper } from '@utils/helper';
```

### 8. Available Import Aliases
- `@/` → `src/`
- `@components/` → `src/components/`
- `@contexts/` → `src/contexts/`
- `@hooks/` → `src/hooks/`
- `@lib/` → `src/lib/`
- `@routes/` → `src/routes/`
- `@screens/` → `src/screens/`
- `@store/` → `src/store/`
- `@styles/` → `src/styles/`
- `@ui/` → `src/ui/`
- `@utils/` → `src/utils/`

## Quick Reference
- **Indentation: 2 spaces (NOT 4 spaces or tabs)**
- Component syntax: `export function ComponentName`
- **Class names: ALWAYS use `join()` for conditionals - NEVER template literals**
- Check Dreamer UI first
- Use import aliases: `@components/`, `@hooks/`, `@lib/`, `@screens/`, `@ui/`, etc.
- Follow structured folder organization with proper separation of concerns

## ⚠️ Critical Reminders
- **Use 2 spaces for indentation throughout the entire codebase**
- **Template literals with `${` in className are FORBIDDEN**
- **Always import and use `join` from `@moondreamsdev/dreamer-ui/utils`**
- **Before writing any conditional className, ask: "Am I using join()?"**
