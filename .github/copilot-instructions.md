# Design Wishes Tarot - AI Coding Assistant Instructions

## Project Overview

This is a Progressive Web App (PWA) Tarot card reading application built with **p5.js**, featuring interactive card layouts, animations, and offline capabilities. The cards are based on wishes from Open University Design students, transformed into AI-generated artwork.

## Architecture & Key Components

### Core Files Structure
- `index.htm` - Main entry point with PWA configuration and install button logic
- `sketch.js` - Primary p5.js application logic (~900 lines)
- `style.css` - Minimal styling, loads custom Poppins font
- `service-worker.js` - Handles offline caching for all assets
- `data/` - Contains 78 WebP card images (major arcana + 4 suits)
- `descriptions.txt` - Card meanings, one per line (78 total)

### State Management Pattern
The app uses a string-based state machine in `sketch.js`:
- `"cover"` → `"intro"` → `"display"` or `"about"`
- State changes trigger custom events: `window.dispatchEvent(new CustomEvent('tarot-state-change'))`
- Install button visibility controlled by state changes

### Card System Architecture
Cards are stored in two parallel arrays:
- `cardData[]` - Static card info (name, description)
- `filePaths[]` - Image paths matching cardData indices
- `imageCache{}` - Runtime image loading cache

Card objects contain animation state:
```javascript
{
  showingFront: boolean,
  showingBack: boolean, 
  flipping: boolean,
  flipProgress: 0-1,
  isFlipped: boolean
}
```

### Layout System
9 predefined layouts in `layouts[]` array with specialized rendering logic:
- Single cards use full-viewport sizing
- Multi-card layouts have position calculation functions
- Special case: Celtic Cross has rotated "Challenge" card (index 1)
- Layout labels defined in `layoutLabels{}` object

## Development Workflow

### Local Development
```bash
./start-local.sh        # Starts Python HTTP server on port 8080
# OR double-click "Start Tarot.command" on macOS
```

### Card Image Naming Convention
- Major Arcana: `major_{index}_{name_with_underscores}.webp`
- Minor Arcana: `{suit}_{rank}.webp`
- All lowercase, spaces → underscores

### PWA Features
- Service worker caches ALL 78 card images + core assets
- Handles both online and file:// protocol access
- Install button shows only during intro state
- Versioned cache (`CACHE_VERSION = 'v3'`)

## Critical Patterns

### Mobile-First Design
```javascript
let isMobile = isMobileDevice();
// All UI dimensions scale: isMobile ? smallValue : largeValue
```

### Image Loading Strategy
- Lazy loading: Images load only when layout is selected
- Uses `imageCache{}` to prevent duplicate requests  
- Loading state tracked per card: `c.isLoading = true`

### Animation System
Card flips use progress-based scaling:
- `flipProgress` 0→1 controls scale factor
- At 0.5, switches from back→front image
- Scale factor: `abs(0.5 - flipProgress) * 2`

### Touch/Mouse Interaction
- Single `mousePressed()` handles all interactions
- State-specific hit detection
- Mobile: `touchStarted()` calls `mousePressed()`
- Fullscreen on non-iOS devices

## Device-Specific Behaviors

### iOS Special Handling
- No fullscreen mode (iOS PWA limitation)
- Detected via: `navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1`

### Desktop vs Mobile
- Desktop: Fixed 1200x800 canvas
- Mobile: Full `windowWidth/windowHeight`
- Different button sizes and margins throughout

## Service Worker Gotchas

The SW handles both network and local file access:
- `file://` URLs always serve from cache first
- Network requests cache responses for offline use
- Navigation requests have special handling in `handleNavigation()`

## Adding New Features

### New Layouts
1. Add to `layouts[]` array with `positionsCount`
2. Add positioning logic in `drawLayout()`
3. Optionally add labels to `layoutLabels{}`

### New Card Types
1. Add images to `data/` following naming convention
2. Update `cardData[]` and `filePaths[]` arrays
3. Update `IMAGE_ASSETS` in service worker

## Common Debugging Points

- Card images not loading: Check `imageCache` and `isLoading` states
- Layout positioning: Verify `cardWidth/cardHeight` calculations in `calculateCardSize()`
- PWA install issues: Check state changes and event listeners in `index.htm`
- Animation glitches: Debug `flipProgress` values and `showingFront/showingBack` flags