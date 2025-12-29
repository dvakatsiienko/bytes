# Tailwind CSS Migration Plan
## Space Explorer UI: styled-components → Tailwind CSS

**Migration Strategy:** 1-to-1 style preservation with zero visual changes

---

## 📊 Current State Analysis

### Files Using styled-components: 11
1. `src/styles.ts` - Global styles + design tokens
2. `src/components/Button.tsx`
3. `src/components/Layout.tsx`
4. `src/components/Loading.tsx`
5. `src/components/MenuItem.tsx`
6. `src/components/Header/Header.tsx`
7. `src/components/Footer/Footer.tsx`
8. `src/components/Footer/LogoutButton.tsx`
9. `src/components/LaunchTile/LaunchTile.tsx`
10. `src/pages/Cart.tsx`
11. `src/pages/Login.tsx`

### Dependencies to Remove
- `styled-components@6.1.19`
- `polished@4.3.1` (color utilities)
- `@types/styled-components`

### Complexity Breakdown
- **Simple (static styles):** 6 files - Direct conversion to className
- **Moderate (dynamic props):** 4 files - Use `clsx`/`cn` helper for conditional classes
- **Advanced (animations):** 1 file - Convert to Tailwind animations

---

## 🎨 Design Token Migration

### Current Design Tokens (`src/styles.ts`)
```typescript
SPACING = 8px              → Tailwind: spacing.2 (8px)
COLORS = {
  accent: '#e535ab'        → Tailwind custom color: accent
  background: '#f7f8fa'    → Tailwind custom color: background
  grey: '#d8d9e0'          → Tailwind custom color: grey
  primary: '#220a82'       → Tailwind custom color: primary
  secondary: '#14cbc4'     → Tailwind custom color: secondary
  text: '#343c5a'          → Tailwind custom color: text
  textSecondary: '#747790' → Tailwind custom color: text-secondary
}
```

### Tailwind Config Strategy
```js
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        accent: '#e535ab',
        background: '#f7f8fa',
        grey: '#d8d9e0',
        primary: '#220a82',
        secondary: '#14cbc4',
        text: '#343c5a',
        'text-secondary': '#747790',
      },
      spacing: {
        // Keep default Tailwind spacing (already has 8px = spacing-2)
      },
    },
  },
}
```

---

## 🔧 Migration Phases

### Phase 1: Setup Tailwind CSS ✅

**Tasks:**
1. Install Tailwind dependencies
   ```bash
   pnpm add -D tailwindcss postcss autoprefixer
   pnpm dlx tailwindcss init -p
   ```

2. Configure `tailwind.config.js`
   - Add custom colors from COLORS token
   - Configure content paths: `['./index.html', './src/**/*.{js,ts,jsx,tsx}']`
   - Add keyframe animations for Loading spinner

3. Create `src/index.css` with Tailwind directives
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;

   @layer base {
     /* Global styles migration from createGlobalStyle */
     *, *::before, *::after { box-sizing: border-box; }
     html, body, #root { height: 100%; }
     #root { display: flex; flex-direction: column; }
     body {
       font-family: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, sans-serif;
       color: #343c5a;
       background-color: #f7f8fa;
       margin: 0;
       -webkit-font-smoothing: antialiased;
     }
     /* Scrollbar hiding */
     ::-webkit-scrollbar { display: none; }
     * { -ms-overflow-style: none; scrollbar-width: none; }
   }

   @layer components {
     /* Typography from createGlobalStyle */
     h1 { font-size: 2.25rem; font-weight: 800; letter-spacing: -0.0625rem; }
     h2 { font-size: 1.5rem; font-weight: 600; letter-spacing: -0.0313rem; }
     h3 { font-size: 1.3125rem; font-weight: 500; }
     h4 { font-size: 1.125rem; font-weight: 600; }
     h5 { font-size: 1rem; font-weight: 500; }
     h6 { font-size: 0.875rem; font-weight: 500; letter-spacing: 0.025rem; }
   }
   ```

4. Import in `src/main.tsx`
   ```typescript
   import './index.css'; // Add before App import
   ```

5. Install `clsx` for conditional className logic
   ```bash
   pnpm add clsx tailwind-merge
   ```

6. Create utility helper `src/lib/utils.ts`
   ```typescript
   import clsx, { ClassValue } from 'clsx';
   import { twMerge } from 'tailwind-merge';

   export function cn(...inputs: ClassValue[]) {
     return twMerge(clsx(inputs));
   }
   ```

---

### Phase 2: Migrate Global Styles & Design Tokens

**File:** `src/styles.ts`

**Actions:**
1. ✅ Design tokens → `tailwind.config.js` colors (done in Phase 1)
2. ✅ Global styles → `src/index.css` @layer base (done in Phase 1)
3. ❌ Delete `src/styles.ts` after all migrations complete
4. ❌ Remove `createGlobalStyle` import from `src/main.tsx`

**Validation:**
- Typography hierarchy renders identically
- Scrollbar hiding works cross-browser
- Root flexbox layout maintains structure

---

### Phase 3: Migrate Simple Components (Object API)

**Priority Order:** Layout → Footer → LoginForm helpers

#### 3.1 Layout.tsx (Simple - Object API)
**Current:**
```typescript
const Bar = styled('div')({
  backgroundColor: COLORS.primary,
  flexShrink: 0,
  height: 12,
});

const Container = styled('div')({
  alignItems: 'stretch',
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  maxWidth: 450,
  width: '100%',
});
```

**Migrated:**
```typescript
// Delete styled imports
export const Layout = ({ children }: LayoutProps) => {
  return (
    <>
      <div className="h-3 flex-shrink-0 bg-primary" />
      <div className="flex flex-1 flex-col items-stretch w-full max-w-[450px]">
        {children}
      </div>
    </>
  );
};
```

**Changes:**
- Remove `styled` imports
- Replace styled components with `className` props
- `height: 12` → `h-3` (12px)
- `backgroundColor: COLORS.primary` → `bg-primary`
- `flexShrink: 0` → `flex-shrink-0`
- `maxWidth: 450` → `max-w-[450px]` (arbitrary value)

---

#### 3.2 Footer.tsx (Simple - Object API)
**Current:**
```typescript
const Container = styled('footer')({
  backgroundColor: 'white',
  bottom: 0,
  flexShrink: 0,
  height: 130,
  left: 0,
  paddingBottom: SPACING * 2,
  position: 'sticky',
  right: 0,
});

const InnerContainer = styled('div')({
  alignItems: 'center',
  display: 'flex',
  height: '100%',
  maxWidth: 450,
  padding: `0 ${SPACING * 3}px`,
  width: '100%',
});
```

**Migrated:**
```typescript
export const Footer = () => {
  return (
    <footer className="sticky bottom-0 left-0 right-0 h-[130px] flex-shrink-0 bg-white pb-4">
      <div className="flex items-center h-full w-full max-w-[450px] px-6">
        {/* children */}
      </div>
    </footer>
  );
};
```

**Changes:**
- `height: 130` → `h-[130px]`
- `paddingBottom: SPACING * 2` → `pb-4` (16px = SPACING * 2)
- `padding: 0 ${SPACING * 3}px` → `px-6` (24px = SPACING * 3)
- Sticky positioning maintained

---

#### 3.3 LoginForm Helpers (Simple - Object API)
**Current:**
```typescript
const StyledInput = styled('input')({
  ':focus': { borderColor: COLORS.primary },
  border: `1px solid ${COLORS.grey}`,
  outline: 'none',
  padding: `${SPACING * 1.25}px ${SPACING * 2.5}px`,
});

const Header = styled('header')(
  { marginBottom: SPACING * 5 },
  svgClassName
);
```

**Migrated:**
```typescript
// Input
<input className="border border-grey px-5 py-2.5 outline-none focus:border-primary" />

// Header
<header className="mb-10 block fill-current">
```

**Changes:**
- `padding: ${SPACING * 1.25}px ${SPACING * 2.5}px` → `px-5 py-2.5` (10px/20px)
- `:focus` → `focus:border-primary`
- `marginBottom: SPACING * 5` → `mb-10` (40px)

---

### Phase 4: Migrate Dynamic Components (Props-Based)

**Priority Order:** Button → LaunchTile → Header → MenuItem

#### 4.1 Button.tsx (Moderate - Transient Props + Polished)
**Current:**
```typescript
const height = 56;
const StyledButton = styled.button<ButtonProps>`
  min-width: ${(props) => (props.$mini ? 175 : 200)}px;
  height: ${(props) => (props.$mini ? height / 1.3 : height)}px;
  border-radius: ${height / 2}px;
  background-color: ${COLORS.accent};
  &:hover { background-color: ${lighten(0.1, COLORS.accent)}; }
  &:active { background-color: ${lighten(0.2, COLORS.accent)}; }
  &:disabled { background-color: ${darken(0.2, COLORS.accent)}; }
`;
```

**Migrated:**
```typescript
import { cn } from '@/lib/utils';

export const Button = ({ mini, children, ...props }: ButtonProps) => {
  return (
    <button
      className={cn(
        // Base styles
        "rounded-[28px] px-8 text-white font-bold uppercase",
        "transition-colors duration-200",
        "bg-accent hover:bg-accent-light active:bg-accent-lighter",
        "disabled:bg-accent-dark disabled:cursor-not-allowed",
        // Conditional sizing
        mini ? "min-w-[175px] h-[43px]" : "min-w-[200px] h-14"
      )}
      {...props}
    >
      {children}
    </button>
  );
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  mini?: boolean;
}
```

**Tailwind Config Addition:**
```js
// tailwind.config.js - Add accent color variants
colors: {
  accent: '#e535ab',
  'accent-light': '#e85ebf',   // lighten(0.1, #e535ab)
  'accent-lighter': '#ec87d3', // lighten(0.2, #e535ab)
  'accent-dark': '#b72a89',    // darken(0.2, #e535ab)
}
```

**Changes:**
- Remove `polished` dependency (color variants in config)
- `$mini` prop → `mini` prop (no transient props needed)
- Conditional classes via `cn()` helper
- Pseudo-states: `hover:`, `active:`, `disabled:`
- Border-radius: `28px` (height / 2 = 56 / 2)

---

#### 4.2 LaunchTile.tsx (Moderate - Transient Props + Background Image)
**Current:**
```typescript
const StyledLink = styled(Link)<StyledLinkProps>`
  background-image: ${(props) => props.$bgImage};
  background-position: center;
  background-size: cover;
  height: ${(props) => (props.$isDetailed ? 365 : 193)}px;
  &:not(:last-child) { margin-bottom: ${SPACING * 3}px; }
`;
```

**Migrated:**
```typescript
export const LaunchTile = ({ launch, isDetailed }: LaunchTileProps) => {
  const bgImage = launch.mission.missionPatch
    ? `url(${launch.mission.missionPatch})`
    : '';

  return (
    <Link
      to={`/launch/${launch.id}`}
      className={cn(
        "bg-cover bg-center rounded-lg overflow-hidden",
        "[&:not(:last-child)]:mb-6",
        isDetailed ? "h-[365px]" : "h-[193px]"
      )}
      style={{ backgroundImage: bgImage }}
    >
      {/* content */}
    </Link>
  );
};
```

**Changes:**
- Background image via `style` prop (dynamic URL)
- `$isDetailed` → `isDetailed` prop
- `&:not(:last-child)` → `[&:not(:last-child)]:mb-6` (arbitrary variant)
- Height: conditional via `cn()`

---

#### 4.3 Header.tsx (Moderate - Transient Props)
**Current:**
```typescript
const StyledImage = styled.img<{ $round: boolean }>`
  border-radius: ${(props) => (props.$round ? '50%' : '0%')};
  height: 134px;
  width: 134px;
`;
```

**Migrated:**
```typescript
export const Header = ({ image, round = false }: HeaderProps) => {
  return (
    <img
      src={image || '/path/to/default.png'}
      className={cn(
        "h-[134px] w-[134px]",
        round ? "rounded-full" : "rounded-none"
      )}
    />
  );
};

interface HeaderProps {
  image?: string;
  round?: boolean;
}
```

**Changes:**
- `$round` → `round` prop
- `border-radius: 50%` → `rounded-full`
- `border-radius: 0%` → `rounded-none`

---

#### 4.4 MenuItem.tsx (Moderate - CSS Fragments)
**Current:**
```typescript
export const menuItemClassName = css`
  position: relative;
  cursor: pointer;
  flex-grow: 1;
  & svg { display: block; width: 60px; fill: ${COLORS.secondary}; }
  & .count {
    position: absolute;
    top: -10px;
    right: 20px;
    background-color: ${COLORS.accent};
  }
`;

export const MenuItem = styled(Link)(
  { textDecoration: 'none' },
  menuItemClassName
);
```

**Migrated:**
```typescript
// Create className string (no css`` needed)
export const menuItemClassName =
  "relative cursor-pointer flex-grow no-underline " +
  "[&_svg]:block [&_svg]:w-[60px] [&_svg]:fill-secondary " +
  "[&_.count]:absolute [&_.count]:-top-2.5 [&_.count]:right-5 [&_.count]:bg-accent";

export const MenuItem = ({ to, children }: MenuItemProps) => {
  return (
    <Link to={to} className={menuItemClassName}>
      {children}
    </Link>
  );
};
```

**Changes:**
- Remove `css` template literal
- Nested selectors: `& svg` → `[&_svg]:block` (arbitrary variant)
- `top: -10px` → `-top-2.5` (closest: -10px ≈ -0.625rem)
- Export plain className string for reuse

---

### Phase 5: Migrate Advanced Components (Animations)

#### 5.1 Loading.tsx (Advanced - Keyframe Animation)
**Current:**
```typescript
import { size } from 'polished';

const spin = css`
  to { transform: rotate(360deg); }
`;

export const Loading = styled(LogoSvg)(
  size(64),
  {
    display: 'block',
    fill: COLORS.grey,
    path: { animation: `${spin} 1s linear infinite` },
  }
);
```

**Migrated:**
```typescript
export const Loading = () => {
  return (
    <LogoSvg className="block h-16 w-16 fill-grey [&_path]:animate-spin" />
  );
};
```

**Tailwind Config Addition:**
```js
// tailwind.config.js
theme: {
  extend: {
    animation: {
      spin: 'spin 1s linear infinite', // Already built-in!
    },
  },
}
```

**Changes:**
- Remove `polished` size utility
- `size(64)` → `h-16 w-16` (64px)
- Animation: `animate-spin` (Tailwind built-in)
- Path animation: `[&_path]:animate-spin`

---

### Phase 6: Migrate Remaining Pages

#### 6.1 Cart.tsx (Simple - Sticky Positioning)
**Current:**
```typescript
const BookTrips = styled('div')({
  bottom: SPACING * 2.5,
  position: 'sticky',
});
```

**Migrated:**
```typescript
<div className="sticky bottom-5">{/* Book trips button */}</div>
```

**Changes:**
- `bottom: SPACING * 2.5` → `bottom-5` (20px)

---

#### 6.2 Login.tsx (Already covered in 3.3)
See Phase 3.3 for LoginForm component migrations.

---

### Phase 7: Cleanup & Verification

**Tasks:**
1. ❌ Remove styled-components dependencies
   ```bash
   pnpm remove styled-components @types/styled-components polished
   ```

2. ❌ Delete `src/styles.ts`

3. ❌ Remove styled-components imports from all files
   - Search: `import.*styled` (Grep tool)
   - Search: `from 'styled-components'` (Grep tool)

4. ❌ Remove polished imports
   - Search: `from 'polished'` (Grep tool)

5. ✅ Verify no runtime errors
   ```bash
   pnpm typecheck
   pnpm dev
   ```

6. ✅ Visual regression testing
   - Compare each route before/after screenshots
   - Check responsive behavior
   - Test interactive states (hover, focus, active)
   - Verify animations

7. ❌ Update CLAUDE.md
   - Remove "Styled Components v6" from tech stack
   - Add "Tailwind CSS" to styling section
   - Update component patterns section

---

## 📋 Migration Checklist

### Setup
- [ ] Install Tailwind CSS dependencies
- [ ] Configure `tailwind.config.js` with custom colors
- [ ] Create `src/index.css` with base styles
- [ ] Install `clsx` and create `cn()` helper
- [ ] Import Tailwind CSS in `main.tsx`

### Global Styles
- [ ] Migrate design tokens to Tailwind config
- [ ] Migrate createGlobalStyle to @layer base
- [ ] Test typography hierarchy (h1-h6)
- [ ] Verify scrollbar hiding works

### Simple Components (6 files)
- [ ] Layout.tsx
- [ ] Footer/Footer.tsx
- [ ] Footer/LogoutButton.tsx (reuse MenuItem pattern)
- [ ] Login.tsx (form inputs, headers)
- [ ] Cart.tsx (sticky positioning)

### Dynamic Components (4 files)
- [ ] Button.tsx (props-based sizing + hover states)
- [ ] LaunchTile.tsx (props-based height + background image)
- [ ] Header/Header.tsx (conditional border-radius)
- [ ] MenuItem.tsx (CSS fragments + nested selectors)

### Advanced Components (1 file)
- [ ] Loading.tsx (keyframe animation)

### Cleanup
- [ ] Remove styled-components package
- [ ] Remove polished package
- [ ] Delete src/styles.ts
- [ ] Remove all styled-components imports
- [ ] TypeScript compilation check
- [ ] Visual regression testing

### Documentation
- [ ] Update CLAUDE.md tech stack section
- [ ] Update component patterns documentation
- [ ] Add Tailwind config documentation

---

## 🎯 Expected Outcomes

### Bundle Size Reduction
- **Before:** ~150KB (styled-components + polished runtime)
- **After:** ~10KB (Tailwind CSS purged)
- **Savings:** ~140KB (-93%)

### Developer Experience
- ✅ Autocomplete for Tailwind classes
- ✅ Faster HMR (no runtime CSS generation)
- ✅ Easier responsive design with built-in breakpoints
- ✅ Better integration with design systems

### Maintenance
- ✅ Simpler component files (no styled wrappers)
- ✅ Consistent utility-first approach
- ✅ Easier refactoring (search/replace className)
- ✅ Better TypeScript support (no transient props)

---

## ⚠️ Potential Challenges

### 1. Dynamic Background Images
**Solution:** Use inline `style` prop for dynamic URLs
```typescript
<div style={{ backgroundImage: `url(${imageUrl})` }} className="bg-cover" />
```

### 2. Color Calculations (lighten/darken)
**Solution:** Pre-calculate variants in Tailwind config
```js
colors: {
  accent: '#e535ab',
  'accent-light': '#e85ebf',   // Pre-calculated lighten(0.1)
  'accent-dark': '#b72a89',    // Pre-calculated darken(0.2)
}
```

### 3. Nested CSS Selectors
**Solution:** Use arbitrary variants `[&_selector]:`
```typescript
// Before: & svg { fill: blue; }
// After: [&_svg]:fill-blue
```

### 4. Complex Animations
**Solution:** Extend Tailwind theme with custom keyframes
```js
keyframes: {
  spin: { to: { transform: 'rotate(360deg)' } },
}
```

---

## 🚀 Execution Order

1. **Phase 1:** Setup (1 file change)
2. **Phase 2:** Global styles (1 file change)
3. **Phase 3:** Simple components (6 files)
4. **Phase 4:** Dynamic components (4 files)
5. **Phase 5:** Advanced components (1 file)
6. **Phase 6:** Pages (covered in Phase 3)
7. **Phase 7:** Cleanup (dependency removal)

**Total files to modify:** 11 component files + 3 config files

---

## 📝 Notes

- All color values are preserved exactly (no visual changes)
- Spacing values use Tailwind's 8px base unit (matches current SPACING)
- Custom colors added to theme for brand consistency
- TypeScript interfaces updated to remove `$` transient props
- No component behavior changes - only styling migration
- All hover/focus/active states preserved
- Animations preserved with Tailwind utilities

---

**Migration Time Estimate:** 2-3 hours for thorough implementation + testing
**Risk Level:** Low (straightforward utility class conversion)
**Visual Changes:** None (1-to-1 migration)
