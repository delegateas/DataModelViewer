# 🧠 AI Agent Rules for DataModelViewer Codebase

You are an expert in **TypeScript**, **Node.js**, **Next.js App Router**, **React**, **Radix**, **JointJS**, **TailwindCSS**, and general frontend development.

---

## 📘 Project Overview

This is a **DataModelViewer** built with Next.js 15, React 19, TypeScript, and JointJS for data model visualization. It uses a modern tech stack including **shadcn/ui**, **Tailwind CSS**, and follows React best practices.

---

## 🛠 Core Technologies & Dependencies

- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui
- **Diagram Library**: JointJS (@joint/core v4.1.3)
- **Icons**: Lucide React
- **Utilities**: Lodash, clsx, tailwind-merge
- **Authentication**: jose (JWT)

---

## 🏗 Architecture Patterns

### 📂 1. File Structure
```
Website/
├── app/              # Next.js App Router
├── components/       # Reusable components
│   ├── ui/           # shadcn/ui components
│   ├── diagram/      # Diagram-specific
│   └── entity/       # Entity components
├── contexts/         # React Context
├── hooks/            # Custom hooks
├── lib/              # Utilities/constants
├── routes/           # Route components
└── public/           # Static assets
```

---

### 🧩 2. Component Architecture
- Use **functional components** and hooks.
- Always **strictly type** props and state.
- Define **props interfaces**.
- Use destructuring with defaults.

---

### ⚙️ 3. State Management
- **React Context** for global state (e.g., `DiagramContext`).
- **Custom Hooks** for complex logic (`useDiagram`, `useEntitySelection`).
- **useState** for local state.
- **useRef** for mutable values not requiring re-renders.

---

## 🧑‍💻 Coding Standards

### 1️⃣ TypeScript Conventions
```typescript
interface ComponentProps {
  data: EntityData;
  onSelect?: (id: string) => void;
  className?: string;
}

const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  // handler logic
};

const useCustomHook = (): CustomHookReturn => {
  // hook logic
};
```

---

### 2️⃣ Component Patterns
```typescript
interface IComponentName {
  data: number[];
  onSelect: () => void;
  className: string;
}

function ComponentName({ data, onSelect, className }: IComponentName) {
  const [state, setState] = useState();

  useEffect(() => {
    // effect
  }, [dependencies]);

  const handleAction = useCallback(() => {
    // action
  }, [dependencies]);

  return (
    <div className="base-classes">
      {/* content */}
    </div>
  );
}
```

---

### 3️⃣ Styling Conventions
- Use **Tailwind utility classes**.
- For variants, use **class-variance-authority**.
- Ensure **responsive design**.

---

## 🟢 Diagram-Specific Rules

### 1️⃣ JointJS Integration

1. **Model and View Separation**
   - Keep model logic separate from view rendering.
   - Define `joint.dia.Element` and `joint.dia.Link` for business data.
   - Use `joint.shapes` for reusable shapes.
   - Use `ElementView` for rendering/UI.

2. **Graph as Single Source of Truth**
   - Always store state in `joint.dia.Graph`.
   - Never rely on paper alone.
   - Use `element.set()` to trigger events.

3. **Batch Operations**
   ```typescript
   graph.startBatch('batch-updates');
   graph.addCells([cell1, cell2, link]);
   cell1.resize(100, 80);
   graph.stopBatch('batch-updates');
   ```

4. **Unique IDs**
   - Ensure each element/link has a unique `id`.

5. **Paper Events**
   - Use events (`cell:pointerdown`, `element:pointerclick`) for interactions.
   - Avoid mixing DOM events.

6. **Memory Cleanup**
   - Call `paper.remove()` and `graph.clear()` when destroying.
   - Remove listeners.

7. **Debounce/Throttle**
   - Throttle high-frequency handlers (`cell:position`).

8. **Styling**
   - Use Tailwind classes over hardcoded styles.

---

### 2️⃣ Entity Element Patterns
- **Custom Elements**: Extend JointJS.
- **Ports**: Consistent naming.
- **Data Binding**: Link model data to visuals.
- **Events**: Proper interaction handling.

---

## 📝 File Naming

- **Components**: PascalCase (`DiagramCanvas.tsx`)
- **Hooks**: camelCase with `use` (`useDiagram.ts`)
- **Utilities**: camelCase (`utils.ts`)
- **Shared Types**: `types.ts`

---

## 🧷 Import & Export

### Import Organization
```typescript
// React & Next.js
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

// Third-party
import { dia } from '@joint/core';
import { Button } from '@/components/ui/button';

// Local
import { useDiagramContext } from '@/contexts/DiagramContext';
import { cn } from '@/lib/utils';

// Relative
import { EntityElement } from './entity/entity';
```

---

### Export Patterns
```typescript
// Named component
export const ComponentName: React.FC<Props> = () => {};

// Default page
export default function PageName() {}

// Utilities
export function utilityFunction() {}
export const CONSTANT_VALUE = 'value';
```

---

## 🚀 Performance Guidelines

### React
- `useCallback` for handlers.
- `useMemo` for expensive computations.
- `React.memo` for frequently re-rendered components.
- Always include dependencies in hooks.

---

### Diagram
- **Debounce** expensive handlers.
- **Clean up** listeners.
- **Refs over state** for mutable values.
- **Batch** updates.

---

### Bundle
- Use **dynamic imports** for large components.
- Ensure **tree shaking**.
- Leverage **Next.js code splitting**.

---

## ⚠️ Error Handling

### TypeScript
- Strict mode.
- Type guards.
- Optional chaining.
- Null checks.

---

### Runtime
- Error boundaries.
- Try/catch for async.
- Validate all props and data.

---

## 🧪 Testing

### Components
- Unit tests.
- Integration tests.
- Accessibility tests.

---

### Diagram
- Mock JointJS.
- Test interactions and state.

---

## 🔒 Security

### Authentication
- Use **jose** for JWT.
- Protect routes.
- Validate inputs.

---

### Data
- Sanitize before rendering.
- Escape output (prevent XSS).
- Use CSRF protection if needed.

---

## 🗂 Documentation Standards

- Use **JSDoc** for complex logic.
- Add **inline comments** where necessary.
- Include **TODOs** for incomplete work.
- Document setup, usage, and architecture in README.

---

## 🏷 Common Patterns

### Custom Hook
```typescript
export const useCustomHook = (): HookReturn => {
  const [state, setState] = useState(initialState);

  const action = useCallback(() => {
    // logic
  }, []);

  useEffect(() => {
    // setup
    return () => {
      // cleanup
    };
  }, []);

  return { state, action };
};
```

---

### Context Provider
```typescript
const Context = createContext<ContextType | null>(null);

export const Provider: React.FC = ({ children }) => {
  const value = useCustomHook();
  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export const useContext = (): ContextType => {
  const context = useContext(Context);
  if (!context) throw new Error('Must be used within Provider');
  return context;
};
```

---

### Component Composition
```typescript
const ParentComponent = () => (
  <Provider>
    <ChildComponent />
  </Provider>
);

const ChildComponent = () => {
  const context = useContext();
  return <div>{/* Use context */}</div>;
};
```

---

## 🚫 Anti-Patterns to Avoid

### React
- Avoid `useState` for refs—use `useRef`.
- Don’t create objects in render—use `useMemo`.
- Always clean up effects.
- Never mutate state directly.

---

### Diagram
- Don’t reinitialize `paper` unnecessarily—use refs.
- Always clean up event listeners.
- Avoid storing zoom/pan in React state.
- Debounce expensive ops.

---

### TypeScript
- Avoid `any`.
- Fix all errors—don’t ignore them.
- Use type guards over assertions.
- Always check for `null`.

---

## 🧭 Migration Guidelines

### Updating Dependencies
- Review changelogs for breaking changes.
- Update gradually.
- Test thoroughly.
- Verify TypeScript compatibility.

---

### Refactoring
- Preserve functionality.
- Update tests.
- Document changes.
- Validate performance.

---

## 🆘 Emergency Procedures

### When Things Break
- Check console errors.
- Inspect network requests.
- Verify React state/context.
- Roll back via Git if needed.

---

### Performance Issues
- Profile with React DevTools.
- Check for excessive re-renders.
- Analyze bundle size.
- Apply optimizations.

---

**Remember:** Prioritize clarity and maintainability. When in doubt, follow established patterns and documented practices.
