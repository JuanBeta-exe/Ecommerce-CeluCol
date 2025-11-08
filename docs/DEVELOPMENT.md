# Guía de Desarrollo

Esta guía proporciona información detallada para desarrolladores que trabajen en el proyecto.

## Configuración del Entorno

### Requisitos
- Node.js 18.x o superior
- npm 7.x o superior
- VS Code (recomendado)
- Git

### Extensiones Recomendadas para VS Code
- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense

### Configuración Inicial

1. Clonar el repositorio:
```bash
git clone https://github.com/JuanBeta-exe/El-Faro-del-Saber.git
cd "Ecommerce Web Application"
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```env
VITE_SUPABASE_PROJECT_ID=tu_project_id
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

4. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

## Estructura de Carpetas

```
├── src/
│   ├── components/         # Componentes React
│   │   ├── ui/            # Componentes base UI
│   │   └── ...           # Componentes específicos
│   ├── styles/            # Estilos globales
│   ├── supabase/          # Configuración Supabase
│   │   └── functions/     # Edge Functions
│   ├── utils/             # Utilidades
│   ├── App.tsx           # Componente raíz
│   └── main.tsx          # Punto de entrada
├── public/               # Archivos estáticos
├── docs/                # Documentación
└── .env                 # Variables de entorno
```

## Convenciones de Código

### Nombrado
- Componentes: PascalCase (ej. `ProductCard.tsx`)
- Hooks: camelCase con prefijo 'use' (ej. `useCart.ts`)
- Utilidades: camelCase (ej. `formatPrice.ts`)
- Tipos/Interfaces: PascalCase (ej. `interface OrderStatus`)

### Imports
```typescript
// Primero imports de React
import { useState, useEffect } from 'react';

// Luego librerías terceras
import { toast } from 'sonner';

// Después componentes propios
import { Button } from './ui/button';

// Finalmente tipos y utilidades
import { type Product } from '../types';
import { formatPrice } from '../utils';
```

### Estilos
- Usar Tailwind CSS para estilos
- Mantener clases ordenadas por categoría
- Usar variables CSS personalizadas para temas

```tsx
// Ejemplo de organización de clases
<div className="
  flex items-center justify-between  // Layout
  p-4 mb-2                         // Spacing
  bg-white rounded-lg              // Visual
  hover:bg-gray-50                 // Interactive
  dark:bg-gray-800                 // Dark mode
">
```

## Manejo de Estado

### Local
- Usar `useState` para estado simple de componente
- Preferir `useReducer` para estados complejos

### Global
- Evitar estado global innecesario
- Usar props drilling para componentes poco profundos
- Considerar Context para estados compartidos frecuentemente

## Testing

### Configuración
```bash
npm run test        # Ejecutar tests
npm run test:watch # Modo watch
npm run test:coverage # Reporte de cobertura
```

### Convenciones
- Un archivo de test por componente
- Nombrar archivos como `ComponentName.test.tsx`
- Usar descripciones claras en los tests

```typescript
describe('ProductCard', () => {
  it('should render product information correctly', () => {
    // ...
  });

  it('should call onAddToCart when button is clicked', () => {
    // ...
  });
});
```

## Deployment

### Build de Producción
```bash
npm run build
```

### Verificación Pre-deploy
```bash
npm run preview # Probar build localmente
```

### Supabase Edge Functions
1. Instalar Supabase CLI
```bash
npm i -g supabase-cli
```

2. Login
```bash
supabase login
```

3. Deploy functions
```bash
supabase functions deploy
```

## Debugging

### Herramientas
- React DevTools
- Vite DevTools
- Browser DevTools

### Logs
- Usar `console.log` en desarrollo
- Implementar sistema de logging en producción

### Error Boundaries
```typescript
<ErrorBoundary fallback={<ErrorMessage />}>
  <ComponentePropensoAErrores />
</ErrorBoundary>
```

## Performance

### Optimizaciones
- Usar `React.memo` para componentes que renderizan frecuentemente
- Implementar virtualización para listas largas
- Lazy loading para imágenes y componentes pesados

### Code Splitting
```typescript
const ProductDetail = lazy(() => import('./ProductDetail'));
```

## Seguridad

### Autenticación
- Validar tokens en cada request
- Implementar refresh tokens
- Sanitizar inputs

### Roles
- Verificar permisos en frontend y backend
- Usar HOCs o hooks para proteger rutas

## Mantenimiento

### Scripts NPM
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src",
    "format": "prettier --write src",
    "type-check": "tsc --noEmit"
  }
}
```

### Git Workflow
1. Crear rama feature/fix
2. Desarrollar y testear
3. Hacer PR a main
4. Code review
5. Merge