# Couleurs de l'Entreprise - GestAsso

## Palette Principale

### Vert (Couleur Primaire)
- **Vert 400**: `#4ade80` - Vert clair
- **Vert 500**: `#22c55e` - Vert standard ✅ PRINCIPAL
- **Vert 600**: `#16a34a` - Vert foncé
- **Vert 700**: `#15803d` - Vert très foncé

### Orange (Couleur Secondaire)
- **Orange 400**: `#fb923c` - Orange clair
- **Orange 500**: `#f97316` - Orange standard ✅ PRINCIPAL
- **Orange 600**: `#ea580c` - Orange foncé
- **Orange 700**: `#c2410c` - Orange très foncé

## Gradients Principaux

### Gradient Principal (Vert → Orange)
```css
bg-gradient-to-r from-green-500 to-orange-500
```
Utilisation : Boutons principaux, éléments actifs, logo

### Gradient Inversé (Orange → Vert)
```css
bg-gradient-to-r from-orange-500 to-green-500
```
Utilisation : Variantes, hover states

### Gradient Diagonal
```css
bg-gradient-to-br from-green-500 to-orange-500
```
Utilisation : Icônes, avatars, cards

## Couleurs Fonctionnelles

### Success (Vert)
- **Fond**: `bg-green-100 dark:bg-green-900/30`
- **Texte**: `text-green-800 dark:text-green-400`
- **Bordure**: `border-green-500`

### Warning (Orange)
- **Fond**: `bg-orange-100 dark:bg-orange-900/30`
- **Texte**: `text-orange-800 dark:text-orange-400`
- **Bordure**: `border-orange-500`

### Info (Bleu - Conservé pour informations)
- **Fond**: `bg-blue-100 dark:bg-blue-900/30`
- **Texte**: `text-blue-800 dark:text-blue-400`
- **Bordure**: `border-blue-500`

### Error (Rouge - Conservé pour erreurs)
- **Fond**: `bg-red-100 dark:bg-red-900/30`
- **Texte**: `text-red-800 dark:text-red-400`
- **Bordure**: `border-red-500`

## Utilisation par Composant

### Sidebar
- Logo : `bg-gradient-to-br from-green-500 to-orange-500`
- Menu actif : `bg-gradient-to-r from-green-500 to-orange-500`
- Shadow actif : `shadow-green-500/50`

### Boutons Principaux
- Primary : `bg-gradient-to-r from-green-500 to-orange-500`
- Hover : `hover:shadow-lg hover:shadow-green-500/30`

### Stats Cards
- Vert : `from-green-500 to-green-600`
- Orange : `from-orange-500 to-orange-600`
- Alternance selon le type de donnée

### Badges de Statut
- ACTIF : Vert (`bg-green-100 text-green-800`)
- EN_ATTENTE : Orange (`bg-orange-100 text-orange-800`)
- ERREUR : Rouge (conservé)

## Pages Spécifiques

### Login/Register
- Fond : Gradient vert-orange subtil
- Boutons : Gradient vert-orange
- Inputs : Bordure verte au focus

### Dashboard
- KPI Cards : Alternance vert/orange
- Graphiques : Palette vert-orange

### Membres
- Avatar : Gradient vert-orange
- Bouton "Nouveau" : Gradient vert-orange

### Tontines
- Icônes : Gradient vert-orange
- Bouton "Nouvelle" : Gradient vert-orange

### Caisses
- Caisse Fonds : Vert
- Caisse Sanctions : Orange
- Caisse Épargne : Vert clair

## Dark Mode

Les couleurs s'adaptent automatiquement en dark mode :
- Vert 500 → Vert 400 (plus clair)
- Orange 500 → Orange 400 (plus clair)
- Opacité réduite pour les fonds

## Exemples de Code

### Bouton Principal
```tsx
<button className="bg-gradient-to-r from-green-500 to-orange-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all">
  Action
</button>
```

### Card avec Icône
```tsx
<div className="w-12 h-12 bg-gradient-to-br from-green-500 to-orange-500 rounded-lg flex items-center justify-center">
  <Icon className="w-6 h-6 text-white" />
</div>
```

### Badge Success
```tsx
<span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-semibold">
  Actif
</span>
```

### Badge Warning
```tsx
<span className="px-2 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 rounded-full text-xs font-semibold">
  En attente
</span>
```

---

**Note** : Ces couleurs reflètent l'identité de l'entreprise et doivent être utilisées de manière cohérente dans toute l'application.
