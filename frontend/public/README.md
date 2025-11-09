# Public Folder

This directory contains static assets that will be served as-is without processing by Vite.

## What goes here?

- **Favicon** (`favicon.ico`) - Browser tab icon
- **Images** - Static images that don't need processing
- **Fonts** - Custom font files
- **robots.txt** - Search engine crawler instructions
- **manifest.json** - PWA manifest file
- **Other static files** - Any files that should be accessible at the root URL

## How to use

Files in this directory are copied to the root of the dist folder during build and can be referenced with absolute paths starting with `/`.

### Examples:

```html
<!-- In HTML -->
<img src="/logo.png" alt="Logo" />
<link rel="icon" href="/favicon.ico" />
```

```jsx
// In React components
<img src="/images/banner.jpg" alt="Banner" />
```

## Important Notes

- Files in `public` are **not processed** by Vite
- They are copied **as-is** to the build output
- Use absolute paths (starting with `/`) to reference them
- The `public` folder name is **not included** in the URL path

## Current Files

- `robots.txt` - Search engine crawler configuration
- `manifest.json` - Progressive Web App manifest
- `.gitkeep` - Ensures the folder is tracked by git

## Adding Assets

1. Place your static files in this directory
2. Reference them using absolute paths (e.g., `/filename.ext`)
3. They will be automatically copied during build

