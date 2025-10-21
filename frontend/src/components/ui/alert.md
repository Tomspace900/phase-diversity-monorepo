# Alert Component

Composant réutilisable pour afficher des messages d'information, d'avertissement, d'erreur ou de succès dans l'application.

## Usage Simple

```tsx
import { Alert } from './components/ui/alert';

// Alert simple sans titre
<Alert variant="info" icon="💡">
  Ceci est un message d'information
</Alert>

// Alert avec titre
<Alert variant="warning" icon="⚠️" title="Attention" size="sm">
  Ceci est un avertissement important
</Alert>

// Alert avec contenu structuré
<Alert variant="info" icon="📘" title="Guide de sélection" size="sm">
  <ul className="space-y-1">
    <li><strong>Option 1:</strong> Description</li>
    <li><strong>Option 2:</strong> Description</li>
  </ul>
</Alert>

// Alert compact (taille xs)
<Alert variant="destructive" icon="❌" size="xs">
  Erreur de validation
</Alert>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'info' \| 'success' \| 'warning' \| 'destructive'` | `'default'` | Variant visuel de l'alerte |
| `size` | `'xs' \| 'sm'` | `'sm'` | Taille de l'alerte (padding et taille de texte) |
| `icon` | `React.ReactNode` | - | Icône à afficher (emoji ou composant) |
| `title` | `string` | - | Titre optionnel de l'alerte |
| `children` | `React.ReactNode` | - | Contenu/description de l'alerte |
| `className` | `string` | - | Classes CSS additionnelles |

## Variants

- **`default`**: Style neutre (bordure grise, fond transparent)
- **`info`**: Information (bleu cyan) 💡 ℹ️ 📘
- **`success`**: Succès (vert) ✓ ✅
- **`warning`**: Avertissement (orange/jaune) ⚠️
- **`destructive`**: Erreur (rouge) ❌

## Sizes

- **`xs`**: Compact (p-2, text-xs) - Pour les petites validations inline
- **`sm`**: Standard (p-3, text-sm) - Pour les messages normaux (défaut)

## Exemples d'utilisation dans l'app

### Information simple

```tsx
<Alert variant="info" icon="💡" size="sm">
  Leave xc, yc, N empty to use automatic cropping
</Alert>
```

### Guide avec titre et liste

```tsx
<Alert variant="info" icon="📘" title="Basis Selection Guide" size="sm">
  <ul className="space-y-1">
    <li><strong>eigen:</strong> Best for &lt;1000 pixels, fast computation</li>
    <li><strong>eigenfull:</strong> All modes, slow for large pupils</li>
    <li><strong>zernike:</strong> Classical polynomials, good for circular pupils</li>
    <li><strong>zonal:</strong> Direct pixel representation (experimental)</li>
  </ul>
</Alert>
```

### Validation avec état conditionnel

```tsx
<Alert
  variant={
    !validation.isValid
      ? "destructive"
      : validation.warning
      ? "warning"
      : "success"
  }
  icon="🔍"
  title="Shannon Sampling Check"
  size="sm"
>
  {validation.error || validation.warning || validation.helperText}
</Alert>
```

### Messages de validation compacts

```tsx
{validation.error && (
  <Alert variant="destructive" icon="❌" size="xs">
    {validation.error}
  </Alert>
)}
```

### Liste d'avertissements

```tsx
{warnings.length > 0 && (
  <Alert variant="warning" icon="⚠️" title="Warnings" size="sm">
    <ul className="space-y-1">
      {warnings.map((warning, idx) => (
        <li key={idx}>{warning}</li>
      ))}
    </ul>
  </Alert>
)}
```

## Tailles de texte automatiques

Le composant gère automatiquement les tailles de texte selon la prop `size` :

| Size | Padding | Titre | Description | Espacement titre |
|------|---------|-------|-------------|------------------|
| `xs` | `p-2` | `text-xs` | `text-xs` | `mb-1` |
| `sm` | `p-3` | `text-sm` | `text-sm` | `mb-2` |

## Migration depuis les anciens styles inline

### Avant (style inline)

```tsx
<div className="bg-info/10 border border-info/30 rounded-lg p-3">
  <p className="text-sm text-info">Message</p>
</div>
```

### Après (composant Alert)

```tsx
<Alert variant="info" icon="💡" size="sm">
  Message
</Alert>
```

## Notes de conception

- Utilise `class-variance-authority` pour la gestion des variants et sizes
- Compatible avec le design system du projet (couleurs info/success/warning/destructive)
- API simplifiée : juste `title` + `children` au lieu de sous-composants
- Layout flexible avec `flex items-start gap-2` pour aligner icône et contenu
- Support complet des props HTML standard via spread
- Accessible avec `role="alert"`
