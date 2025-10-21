# Phase Diversity - Design System

## 🎨 Philosophy

**Electric Science**: A professional scientific tool with vibrant neon accents.

Inspired by Linear's clarity and modern design tools, with a dash of futurism. This is a research application where clarity, precision, and visual hierarchy are paramount.

### Core Principles

1. **Clarity First**: Scientific data must be readable and unambiguous
2. **Vibrant Accents**: Use neon colors sparingly for emphasis and delight
3. **Dark Mode Native**: Designed for long research sessions
4. **Consistent**: Predictable patterns across all interfaces
5. **Performant**: Fast interactions, smooth animations

---

## 🌈 Color Palette

### Light Mode

```css
/* Backgrounds */
--background: #FFFFFF          /* Pure white */
--foreground: #1A1A2E          /* Deep blue-black */

/* Surfaces */
--card: #FAFAFA                /* Off-white */
--muted: #F1F5F9               /* Light blue-gray */

/* Primary */
--primary: #3B82F6             /* Electric Blue */

/* Neon Accents */
--accent-cyan: #0EA5E9         /* Info, highlights */
--accent-green: #10B981        /* Success, positive */
--accent-pink: #EC4899         /* Special highlights */
--accent-purple: #A855F7       /* Actions, modes */
--accent-orange: #FF8800       /* Warnings */
```

### Dark Mode

```css
/* Backgrounds */
--background: #09090B          /* Almost black with blue tint */
--foreground: #FAFAFA          /* Off-white */

/* Surfaces */
--card: #18181B                /* Dark card */
--muted: #27272A               /* Muted dark */

/* Primary */
--primary: #60A5FA             /* Brighter electric blue */

/* Neon Accents (Boosted 10-20% lightness) */
--accent-cyan: #22D3EE         /* Brighter cyan */
--accent-green: #34D399        /* Brighter green */
--accent-pink: #F472B6         /* Brighter pink */
--accent-purple: #C084FC       /* Brighter purple */
--accent-orange: #FB923C       /* Brighter orange */
```

### Usage Guidelines

#### ✅ DO

- Use accents for status indicators (success = green, warning = orange)
- Apply neon colors at 5-20% opacity for backgrounds
- Combine with neutral grays for text hierarchy
- Boost accent saturation in dark mode for visibility

#### ❌ DON'T

- Never use full-opacity neon backgrounds (except tiny badges)
- Don't mix more than 2 accent colors in one component
- Avoid neon text on neon backgrounds
- Don't override semantic colors (red for errors, green for success)

---

## 📝 Typography

### Font Families

```css
/* UI & Headings */
font-family: Inter, system-ui, sans-serif;

/* Data, Code, Numbers */
font-family: "JetBrains Mono", "Fira Code", monospace;
```

### Scale

| Size | rem   | px  | Usage                  |
| ---- | ----- | --- | ---------------------- |
| xs   | 0.75  | 12  | Captions, helper text  |
| sm   | 0.875 | 14  | Secondary text, labels |
| base | 1     | 16  | Body text              |
| lg   | 1.125 | 18  | Emphasized body        |
| xl   | 1.25  | 20  | Small headings         |
| 2xl  | 1.5   | 24  | Section titles         |
| 3xl  | 1.875 | 30  | Page headings          |
| 4xl  | 2.25  | 36  | Hero headings          |

### Hierarchy

```tsx
<h1 className="text-4xl font-bold">Page Title</h1>
<h2 className="text-2xl font-semibold">Section</h2>
<h3 className="text-xl font-medium">Subsection</h3>
<p className="text-base text-muted-foreground">Body</p>
<span className="text-sm text-muted-foreground">Caption</span>
<code className="font-mono text-accent-cyan">data_value</code>
```

---

## 🧩 Components

### Scientific Components

Located in `frontend/src/components/scientific/`

#### ScientificValue

Display a single scientific value with unit, precision, and color coding.

```tsx
<ScientificValue
  label="Wavelength"
  value={550e-9}
  unit="m"
  precision={2}
  notation="scientific"
  color="cyan"
/>
// Output: Wavelength: 5.50e-7 m
```

**Props:**

- `label`: string
- `value`: number
- `unit?`: string
- `precision?`: number (default: 2)
- `notation?`: 'standard' | 'scientific' | 'engineering'
- `color?`: 'cyan' | 'green' | 'pink' | 'purple' | 'orange' | 'default'

#### StatsGrid

Responsive grid of scientific values.

```tsx
<StatsGrid
  title="Dataset Information"
  stats={[
    { label: "Images", value: 3, precision: 0, color: "cyan" },
    { label: "Dimensions", value: 512, unit: "px", color: "green" },
  ]}
  columns={3}
/>
```

**Props:**

- `title?`: string
- `stats`: Stat[]
- `columns?`: 2 | 3 | 4 (responsive breakpoints)

#### StatusBadge

Status indicators with semantic colors and pulse animations.

```tsx
<StatusBadge status="running" pulse />
<StatusBadge status="completed" customLabel="Analysis Complete" />
<StatusBadge status="warning" customLabel="Low sampling" />
```

**Props:**

- `status`: 'idle' | 'running' | 'completed' | 'error' | 'warning'
- `customLabel?`: string
- `pulse?`: boolean

**Status Colors:**

- `idle`: muted gray
- `running`: cyan (with pulse)
- `completed`: green
- `error`: red
- `warning`: orange

#### DataTable

Table with auto-formatting for scientific data.

```tsx
<DataTable
  columns={[
    { key: "name", label: "Parameter", type: "text" },
    { key: "value", label: "Value", type: "scientific", precision: 3 },
  ]}
  data={[{ name: "Chi²", value: 0.0012 }]}
/>
```

#### CodeBlock

Syntax-highlighted code/log viewer with copy, download, search.

```tsx
<CodeBlock
  code={pythonCode}
  language="python"
  maxHeight="400px"
  showLineNumbers
/>
```

#### PlotlyCard

Plotly charts with automatic dark/light theme switching.

```tsx
<PlotlyCard
  title="Phase Map"
  data={plotData}
  layout={{ xaxis: { title: "X" } }}
/>
```

Uses MutationObserver to detect theme changes and update Plotly colors automatically.

#### LoadingState

Dual-ring loading animation with message.

```tsx
<LoadingState message="Loading results..." />
```

#### EmptyState

Empty state with icon, title, description, and action.

```tsx
<EmptyState
  icon={<Layers className="h-20 w-20 text-accent-cyan" />}
  title="No Sessions Yet"
  description="Start your first analysis"
  accentColor="cyan"
  action={<Button>Start</Button>}
/>
```

---

### UI Components (shadcn/ui)

Located in `frontend/src/components/ui/`

#### Button

```tsx
<Button variant="default">Primary Action</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outlined</Button>
<Button variant="ghost">Ghost</Button>
```

**Enhancements:**

- Add `className="group"` for icon animations
- Use `shadow-lg shadow-primary/20` for glow effects

```tsx
<Button className="group shadow-lg shadow-primary/20">
  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
  Next
</Button>
```

#### Card

```tsx
<Card className="border-accent-cyan/20">
  <CardHeader className="bg-accent-cyan/5">
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

**Patterns:**

- Use accent-colored borders for emphasis
- Apply 5% opacity background in header
- Use `interactive-card` class for hover effects

#### Tabs

Active tabs have cyan underline.

```tsx
<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
</Tabs>
```

**Styling:**

- Active tab: `after:bg-accent-cyan` underline
- Focus ring: `focus-ring-cyan`

---

## 🎬 Animations & Micro-interactions

### Hover Effects

```tsx
/* Cards */
<Card className="interactive-card glow-accent-cyan">

/* Buttons with Icons */
<Button className="group">
  <Icon className="group-hover:rotate-90 transition-transform" />
</Button>

/* Scale on Hover */
<div className="hover:scale-[1.02] transition-all" />
```

### Focus Rings

All interactive elements should have neon focus rings:

```tsx
<input className="focus-ring-cyan" />
<button className="focus-ring-purple" />
```

### Loading States

```tsx
<div className="animate-spin rounded-full border-t-accent-cyan" />
<StatusBadge status="running" pulse /> {/* Uses animate-pulse-glow */}
```

### Custom Animations

```css
/* Pulse Glow (for running status) */
.animate-pulse-glow          /* Cyan glow */
/* Cyan glow */
/* Cyan glow */
/* Cyan glow */
/* Cyan glow */
/* Cyan glow */
/* Cyan glow */
/* Cyan glow */
.animate-pulse-glow-green    /* Green glow */
.animate-pulse-glow-purple; /* Purple glow */
```

Example:

```tsx
<div className="p-2 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20 animate-pulse-glow">
  <Icon className="text-accent-cyan" />
</div>
```

---

## 📐 Spacing & Layout

### 8pt Grid System

Use multiples of 4px (0.25rem):

```css
/* Spacing scale */
gap-1   /* 4px */
gap-2   /* 8px */
gap-3   /* 12px */
gap-4   /* 16px */
gap-6   /* 24px */
gap-8   /* 32px */
gap-12  /* 48px */
gap-16  /* 64px */
```

### Container Widths

```tsx
<div className="max-w-7xl mx-auto">  {/* Main pages */}
<div className="max-w-6xl mx-auto">  {/* Sessions, results */}
<div className="max-w-4xl mx-auto">  {/* Centered content */}
```

### Responsive Breakpoints

```css
sm:   640px
md:   768px
lg:   1024px
xl:   1280px
2xl:  1536px
```

### Grid Patterns

```tsx
/* 3-column responsive grid */
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

/* 65/35 split (form | preview) */
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div className="lg:col-span-2">Form</div>
  <div className="lg:col-span-1">Preview</div>
</div>
```

---

## 🎯 Common Patterns

### Hero Section

```tsx
<div className="relative overflow-hidden bg-gradient-to-br from-background via-background to-accent-cyan/5 rounded-2xl p-8 mb-8 border border-border">
  <div className="flex items-center gap-6">
    <div className="p-4 bg-accent-cyan/10 rounded-xl border border-accent-cyan/20 shadow-lg shadow-accent-cyan/10">
      <Icon className="h-10 w-10 text-accent-cyan" />
    </div>
    <div>
      <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent-cyan bg-clip-text text-transparent">
        Page Title
      </h1>
      <p className="text-muted-foreground text-lg">Description</p>
    </div>
  </div>
</div>
```

### Stat Display

```tsx
<div className="grid grid-cols-3 gap-4">
  <Card>
    <CardContent className="p-4">
      <div className="text-sm text-muted-foreground">Chi²</div>
      <div className="text-2xl font-bold font-mono text-accent-green">
        0.0012
      </div>
    </CardContent>
  </Card>
</div>
```

### Form Input with Focus Ring

```tsx
<input
  type="text"
  className="px-3 py-2 border border-border rounded-md bg-background focus-ring-cyan"
/>
```

### Navigation Buttons

```tsx
<div className="flex justify-between">
  <Button variant="outline" className="group">
    <ArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
    Back
  </Button>
  <Button className="group shadow-lg shadow-primary/20">
    Next
    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
  </Button>
</div>
```

### Session Card

```tsx
<Card className="group hover:border-accent-cyan hover:shadow-lg hover:shadow-accent-cyan/20 transition-all">
  <CardHeader className="bg-accent-cyan/5">
    <div className="flex justify-between">
      <div className="p-2 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20">
        <Icon className="h-5 w-5 text-accent-cyan" />
      </div>
      <StatusBadge status="completed" />
    </div>
    <CardTitle className="font-mono text-sm">session_id</CardTitle>
  </CardHeader>
  <CardContent>
    <Button className="w-full group">
      <Eye className="mr-2 group-hover:scale-110 transition-transform" />
      View Results
    </Button>
  </CardContent>
</Card>
```

---

## ✨ Best Practices

### Do's

✅ Use `font-mono` for all numeric values, IDs, and technical data
✅ Apply accent colors at 5-20% opacity for backgrounds
✅ Add hover transitions to all interactive elements
✅ Use semantic colors (green = success, orange = warning, red = error)
✅ Provide loading states for all async operations
✅ Include empty states with clear call-to-action
✅ Use gradient text for hero headings
✅ Add icon animations on button hover

### Don'ts

❌ Never use more than 2 accent colors in one component
❌ Don't apply full-opacity neon backgrounds (except badges)
❌ Avoid mixing font families (Inter for UI, Mono for data)
❌ Don't skip focus rings on interactive elements
❌ Never use generic "Loading..." without context
❌ Don't use emojis in production (use Lucide icons instead)

---

## 🔍 Accessibility

### Color Contrast

All text meets WCAG AA standards:

- Body text: 4.5:1 minimum
- Large text (18px+): 3:1 minimum
- Interactive elements: clear focus indicators

### Focus Management

```tsx
/* All inputs */
<input className="focus-ring-cyan" />

/* All buttons */
<Button /> {/* Has built-in focus ring */

/* Custom interactive */
<div tabIndex={0} className="focus-ring-cyan" />
```

### Keyboard Navigation

- All interactive elements are keyboard accessible
- Tab order follows visual hierarchy
- Escape key closes modals/popovers
- Enter activates primary actions

---

## 📦 File Structure

```
frontend/src/
├── components/
│   ├── scientific/           # Scientific data components
│   │   ├── ScientificValue.tsx
│   │   ├── StatsGrid.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── DataTable.tsx
│   │   ├── CodeBlock.tsx
│   │   ├── PlotlyCard.tsx
│   │   ├── LoadingState.tsx
│   │   ├── EmptyState.tsx
│   │   └── index.ts
│   ├── ui/                   # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── tabs.tsx
│   │   └── ...
│   ├── Header.tsx            # Global header
│   └── ThemeSwitcher.tsx     # Dark/light toggle
├── pages/
│   ├── UploadPage.tsx
│   ├── SetupPage.tsx
│   ├── SessionsPage.tsx
│   └── ResultsPage.tsx
├── index.css                 # Global styles, theme
└── App.tsx                   # Router
```

---

## 🚀 Quick Start Examples

### Adding a new page

```tsx
import { EmptyState, LoadingState } from "@/components/scientific";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function MyPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  if (loading) return <LoadingState message="Loading..." />;

  if (!data) {
    return (
      <EmptyState
        icon={<Icon />}
        title="No Data"
        description="Get started by..."
        action={<Button>Action</Button>}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero */}
      <div className="bg-gradient-to-br from-background to-accent-cyan/5 rounded-2xl p-8 mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent-cyan bg-clip-text text-transparent">
          My Page
        </h1>
      </div>

      {/* Content */}
      <Card className="interactive-card glow-accent-cyan">{/* ... */}</Card>
    </div>
  );
}
```

---

## 📚 Resources

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [Plotly.js](https://plotly.com/javascript/)
- [Inter Font](https://rsms.me/inter/)
- [JetBrains Mono](https://www.jetbrains.com/lp/mono/)

---

**Last Updated**: January 2025
**Version**: 1.0
**Maintained by**: Phase Diversity Team
