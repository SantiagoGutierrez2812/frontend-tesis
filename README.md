# ImproExpress - Sistema de Gestión de Inventario - Frontend

Aplicación web moderna para la gestión de inventario empresarial desarrollada con React, TypeScript y Vite. Interfaz de usuario intuitiva con visualizaciones 3D, gráficos interactivos y gestión completa de productos, transacciones e inventarios.

## Características Principales

### Arquitectura del Frontend
- **Tipo de Aplicación**: SPA (Single Page Application)
  - Una sola página HTML que se carga inicialmente
  - Navegación del lado del cliente sin recargas de página
  - Actualización dinámica del contenido con JavaScript
  - React Router para manejo de rutas
- **Patrón Arquitectónico**: Component-Based Architecture
  - UI dividida en componentes reutilizables
  - Cada componente encapsula su lógica y vista
  - Composición de componentes (componentes dentro de componentes)
  - Flujo de datos unidireccional mediante props
  - Gestión de estado con React Hooks (useState, useEffect)
- **Gestión de Estado**: Local component state con React Hooks
- **Comunicación con Backend**: REST API mediante fetch/axios

### Tecnologías
- **Framework**: React 19.1.1
- **Lenguaje**: TypeScript 5.8.3
- **Build Tool**: Vite 7.0.4
- **Enrutamiento**: React Router DOM 7.7.1
- **Estilos**: CSS Modules + Styled Components 6.1.19
- **Notificaciones**: React Toastify 11.0.5
- **Visualización 3D**: Three.js 0.180.0 + React Three Fiber 9.3.0
- **Gráficos**: Recharts 3.2.1 + D3.js 7.9.0
- **Mapas**: Deck.gl 9.1.14 + React Map GL 6.1.21
- **Animaciones**: Framer Motion 12.23.24
- **HTTP Client**: Axios 1.12.2

### Funcionalidades Implementadas
- **Autenticación de Dos Factores**: Login con OTP enviado por correo
- **Dashboard Interactivo**: Widgets con información en tiempo real
- **Gestión de Usuarios**: CRUD completo con permisos por rol
- **Gestión de Productos**: Crear, editar, eliminar y visualizar productos
- **Gestión de Proveedores**: Administración completa de proveedores
- **Transacciones de Productos**: Registro y seguimiento de movimientos de inventario
- **Reportes Excel**: Descarga de reportes de transacciones
- **Visualizaciones 3D**: Elementos interactivos con Three.js
- **Gestión de Sucursales**: Administración multi-sucursal
- **Sistema de Inactividad**: Cierre automático de sesión por inactividad (15 minutos)
- **Responsive Design**: Adaptado a diferentes tamaños de pantalla

## Estructura del Proyecto

```
frontend-tesis/
├── public/                  # Archivos estáticos
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── Login/          # Componentes de autenticación
│   │   ├── PrivateRoute.tsx
│   │   └── UserSessionManager.tsx
│   ├── headquarters/        # Gestión de sucursales
│   ├── home/               # Página principal
│   ├── map/                # Componentes de mapas
│   ├── pages/              # Páginas de la aplicación
│   │   ├── Dashboard.tsx
│   │   └── NoAutorizado.tsx
│   ├── services/           # Servicios y API calls
│   │   ├── authservice/
│   │   ├── branchService/
│   │   ├── log/
│   │   ├── Product_Transactions/
│   │   ├── services/
│   │   ├── supplier/
│   │   ├── types/          # Tipos TypeScript
│   │   ├── user/
│   │   └── user_logins/
│   ├── TopControl/         # Controles superiores
│   ├── utils/              # Utilidades
│   │   └── auth.ts
│   ├── widget/             # Widgets del dashboard
│   │   ├── conf/          # Configuración
│   │   ├── material/      # Materiales
│   │   ├── personnel_record/  # Registro de personal
│   │   ├── rank/          # Rankings
│   │   ├── stores/        # Tiendas
│   │   └── supplier/      # Proveedores
│   ├── App.tsx             # Componente principal
│   ├── main.tsx            # Punto de entrada
│   └── ProtectedRoute.tsx  # Rutas protegidas
├── .env                    # Variables de entorno
├── .gitignore
├── eslint.config.js        # Configuración ESLint
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json           # Configuración TypeScript
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts          # Configuración Vite
└── README.md
```

## Instalación y Configuración

### Prerrequisitos
- Node.js 18.x o superior
- npm 9.x o superior
- Backend API corriendo en `http://localhost:5000`

### 1. Clonar el Repositorio
```bash
git clone <url-del-repositorio>
cd improexpress_app/frontend-tesis
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Variables de Entorno
Crear archivo `.env` en la raíz del proyecto:
```env
VITE_API_URL=http://127.0.0.1:5000
```

### 4. Ejecutar en Modo Desarrollo
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### 5. Compilar para Producción
```bash
npm run build
```

### 6. Vista Previa de Producción
```bash
npm run preview
```

## Rutas de la Aplicación

### Rutas Públicas
- `/` - Página de login

### Rutas Protegidas (requieren autenticación)
- `/home` - Dashboard principal
- `/conf` - Configuración
- `/supplier` - Gestión de proveedores
- `/material` - Gestión de materiales/productos
- `/rank` - Rankings y estadísticas
- `/stores` - Gestión de tiendas/sucursales
- `/personnel_record` - Registro de personal

## Componentes Principales

### Dashboard (`src/pages/Dashboard.tsx`)
Página principal con widgets interactivos:
- Widget de tiendas (PowerWidget)
- Widget de personal (ThermostatWidget)
- Widget de rankings (HumidityWidget)
- Widget de configuración (ConfiWidget)
- Widget de proveedores (Loader)
- Widget de materiales (MaterialWidget)
- Botón de perfil de usuario
- Botón de descarga de reportes Excel
- Botón de cierre de sesión

### Sistema de Autenticación

#### LoginForm (`src/components/Login/LoginForm.tsx`)
- Login con usuario y contraseña
- Envío de OTP por correo
- Verificación de código OTP
- Almacenamiento de token JWT en localStorage
- Redirección a dashboard después del login

#### UserSessionManager (`src/components/UserSessionManager.tsx`)
- Monitoreo de actividad del usuario
- Cierre automático de sesión después de 15 minutos de inactividad
- Detección de eventos: mousemove, mousedown, keydown, scroll, touchstart

### Rutas Protegidas (`src/ProtectedRoute.tsx` y `src/components/PrivateRoute.tsx`)
- Verificación de token JWT
- Redirección a login si no está autenticado
- Protección de rutas sensibles

## Servicios y API

### Configuración de API (`src/services/services/apiService.ts`)
URL base configurada mediante variable de entorno:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL;
```

### Servicios Implementados

#### AuthService (`src/services/authservice/authService.ts`)
- Login con credenciales
- Verificación OTP
- Reseteo de contraseña

#### UserService (`src/services/user/user_service.ts`)
- Obtener usuario actual
- Actualizar perfil de usuario
- Cambio de contraseña

#### API Service (`src/services/services/apiService.ts`)
- Obtener lista de usuarios
- Crear usuarios
- Actualizar usuarios
- Eliminar usuarios

#### Branch Service (`src/services/branchService/branchService.ts`)
- Obtener sucursales
- No requiere autenticación

#### Supplier Service (`src/services/supplier/supplier_service.ts`)
- Obtener proveedores
- Crear proveedores
- Actualizar proveedores
- Eliminar proveedores

#### Transaction Service (`src/services/Product_Transactions/Transactions.ts`)
- Obtener transacciones
- Crear transacciones
- Validación de datos

#### Log Service (`src/services/log/log.ts`)
- Obtener logs del sistema
- Manejo de errores silencioso

### Descarga de Reportes Excel (`src/pages/Dashboard.tsx`)
```typescript
const handleDownloadReport = async () => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/product-transactions/report/excel`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    // Descarga automática del archivo
};
```

## Gestión de Estado

### LocalStorage
- `token`: JWT para autenticación
- `role`: Rol del usuario
- `branch_id`: ID de la sucursal del usuario
- `welcome`: Estado de bienvenida
- `userName`: Nombre del usuario (opcional)

### Estado de React
- useState para estado local de componentes
- useEffect para efectos secundarios y llamadas API
- useNavigate para navegación programática
- Contexto de sesión mediante UserSessionManager

## Autenticación y Seguridad

### Flujo de Autenticación
1. Usuario ingresa credenciales
2. Backend envía OTP por correo
3. Usuario ingresa código OTP
4. Backend valida y retorna JWT
5. Frontend almacena JWT en localStorage
6. JWT se envía en header Authorization en cada petición

### Protección de Rutas
```typescript
<Route path="/home" element={
    <UserSessionManager>
        <Dashboard />
    </UserSessionManager>
} />
```

### Headers de Autenticación
```typescript
headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
}
```

### Sistema de Inactividad
- Timer de 15 minutos
- Reinicio automático con actividad del usuario
- Alerta antes de cerrar sesión
- Limpieza de localStorage al cerrar

## Estilos y UI

### CSS Modules
Cada componente tiene su propio archivo de estilos:
```
Dashboard.module.css
LoginForm.module.css
```

### Styled Components
Componentes con estilos en JavaScript para mayor dinamismo.

### Animaciones
- Framer Motion para animaciones fluidas
- Transiciones en navegación
- Efectos hover y click

### Visualizaciones 3D
- Three.js para renderizado 3D
- React Three Fiber para integración con React
- React Three Drei para helpers y abstracciones

## Notificaciones

### React Toastify
```typescript
import { toast, ToastContainer } from 'react-toastify';

toast.success("Operación exitosa");
toast.error("Error al procesar");
toast.warning("Advertencia");
```

Configuración:
```typescript
<ToastContainer position="top-right" autoClose={3000} />
```

## Tipos TypeScript

### Interfaces Principales

#### User
```typescript
interface UserTransformed {
    name: string;
    username: string;
    document_id: string;
    email: string;
    phone_number: string;
    role: string;
    branch_id: string;
    deleted_at?: string;
}
```

#### Branch
```typescript
interface Branch {
    id: number;
    name: string;
}
```

#### Transaction
```typescript
interface Transaction {
    id: number;
    description: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    transaction_date: string;
    product_id: number;
    branch_id: number;
    transaction_type_id: number;
    app_user_id: number;
    supplier_id?: number;
}
```

#### Supplier
```typescript
interface Proveedor {
    id?: number;
    name: string;
    nit: string;
    email: string;
    phone_number: string;
    address: string;
}
```

## Dependencias Principales

```json
{
  "dependencies": {
    "@deck.gl/layers": "^9.1.14",
    "@react-three/drei": "^10.7.6",
    "@react-three/fiber": "^9.3.0",
    "@splinetool/react-spline": "^4.1.0",
    "axios": "^1.12.2",
    "d3": "^7.9.0",
    "deck.gl": "^9.1.14",
    "framer-motion": "^12.23.24",
    "lucide-react": "^0.544.0",
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "react-icons": "^5.5.0",
    "react-map-gl": "^6.1.21",
    "react-parallax-tilt": "^1.7.309",
    "react-router-dom": "^7.7.1",
    "react-toastify": "^11.0.5",
    "recharts": "^3.2.1",
    "styled-components": "^6.1.19",
    "three": "^0.180.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.6.0",
    "typescript": "~5.8.3",
    "vite": "^7.0.4",
    "eslint": "^9.30.1"
  }
}
```

## Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Compilar para producción
npm run build

# Vista previa de producción
npm run preview

# Linting
npm run lint
```

## Configuración de Vite

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
```

## Configuración de TypeScript

El proyecto usa tres archivos de configuración TypeScript:
- `tsconfig.json`: Configuración base
- `tsconfig.app.json`: Configuración para código de aplicación
- `tsconfig.node.json`: Configuración para scripts de Node

## Configuración de ESLint

Linting con reglas específicas para React y TypeScript:
```javascript
export default tseslint.config({
  extends: [
    js.configs.recommended,
    ...tseslint.configs.recommended,
  ],
  plugins: {
    'react-hooks': reactHooks,
    'react-refresh': reactRefresh,
  }
})
```

## Manejo de Errores

### Try-Catch en Servicios
```typescript
try {
    const res = await fetch(endpoint, options);
    if (!res.ok) throw new Error(`Error: ${res.status}`);
    return await res.json();
} catch (error) {
    toast.error("Error al procesar la solicitud");
    throw error;
}
```

### Validación de Respuestas
```typescript
if (!data.ok) {
    throw new Error(data.error || "Error desconocido");
}
```

## Optimizaciones

### Code Splitting
Vite automáticamente divide el código en chunks.

### Lazy Loading
Componentes cargados bajo demanda.

### Tree Shaking
Eliminación de código no utilizado en producción.

## Solución de Problemas

### Error de conexión con API
- Verificar que el backend esté corriendo en `http://localhost:5000`
- Verificar variable `VITE_API_URL` en `.env`
- Verificar CORS en el backend

### Error de autenticación
- Verificar que el token no haya expirado (1 hora)
- Verificar que el token esté en localStorage
- Verificar formato del header Authorization

### Error al descargar reportes
- Verificar que haya transacciones en la base de datos
- Verificar que el token sea válido
- Verificar que el backend tenga openpyxl instalado

### Sesión se cierra automáticamente
- El sistema cierra sesión después de 15 minutos de inactividad
- El JWT expira después de 1 hora desde el login
- Cualquier actividad del usuario reinicia el contador de inactividad

## Buenas Prácticas Implementadas

### Arquitectura Component-Based
- **Separación de responsabilidades**: Cada componente tiene una única responsabilidad
- **Reutilización**: Componentes diseñados para ser reutilizables
- **Composición sobre herencia**: Componentes se componen entre sí
- **Props para comunicación**: Datos fluyen de padres a hijos mediante props
- **Hooks para lógica**: useState y useEffect para manejar estado y efectos

### Código
- Componentes funcionales con hooks (no clases)
- TypeScript para type safety y mejor DX
- CSS Modules para estilos aislados por componente
- Servicios separados para lógica de API
- Manejo consistente de errores
- Interfaces TypeScript para contratos de datos

### Seguridad
- Tokens en localStorage (considerar httpOnly cookies para producción)
- Validación de inputs
- Sanitización de datos
- Headers de autenticación en todas las peticiones protegidas

### UX
- Notificaciones toast para feedback
- Loading states
- Error boundaries
- Navegación intuitiva
- Responsive design

## Próximas Mejoras Sugeridas

- Implementar refresh tokens
- Agregar testing (Jest + React Testing Library)
- Implementar PWA
- Mejorar accesibilidad (ARIA labels)
- Implementar lazy loading de rutas
- Agregar internacionalización (i18n)
- Implementar caché de datos con React Query
- Agregar modo oscuro

## Arquitectura Completa del Proyecto

### Arquitectura General: Client-Server con SPA y REST API

El proyecto ImproExpress implementa una arquitectura de 3 capas desacopladas:

```
┌─────────────────────────────────────────────────────┐
│          CAPA DE PRESENTACIÓN (Frontend)            │
│                                                     │
│  SPA con Component-Based Architecture              │
│  - React Components (UI)                           │
│  - Services (HTTP calls)                           │
│  - Local State (Hooks)                             │
│  - React Router (Navegación)                       │
│                                                     │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ HTTP/REST (JSON)
                   │ Authorization: Bearer JWT
                   ↓
┌─────────────────────────────────────────────────────┐
│       CAPA DE LÓGICA DE NEGOCIO (Backend)          │
│                                                     │
│  Service Layer Architecture                        │
│  - Routes (HTTP endpoints)                         │
│  - Services (Business logic)                       │
│  - Models (ORM)                                    │
│  - Utils (Validators, helpers)                     │
│                                                     │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ SQL
                   │ SQLAlchemy ORM
                   ↓
┌─────────────────────────────────────────────────────┐
│           CAPA DE DATOS (Database)                  │
│                                                     │
│  MySQL Database                                     │
│  - Tablas relacionales                             │
│  - Constraints y foreign keys                      │
│  - Índices                                         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Características de la Arquitectura

#### Frontend: SPA + Component-Based
- **SPA**: Una página, navegación sin recargas
- **Component-Based**: Componentes reutilizables y composables
- **No es MVC ni MVVM**: Usa patrón de React con Hooks

#### Backend: Service Layer (3 capas)
- **Routes**: Solo HTTP, sin lógica de negocio
- **Services**: Toda la lógica de negocio separada
- **Models**: Solo definición de datos con ORM
- **No es MVC tradicional**: Capa de servicios separa responsabilidades

#### Comunicación
- **REST API**: Endpoints HTTP que retornan JSON
- **Stateless**: Autenticación con JWT
- **CORS habilitado**: Frontend y backend desacoplados

### Ventajas de esta Arquitectura

1. **Desacoplamiento total**: Frontend y backend pueden desplegarse independientemente
2. **Escalabilidad**: Cada capa puede escalar por separado
3. **Mantenibilidad**: Separación clara de responsabilidades
4. **Testabilidad**: Cada capa puede probarse independientemente
5. **Flexibilidad**: Se puede cambiar el frontend o backend sin afectar al otro

## Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Contacto

Para preguntas o soporte, contactar al equipo de desarrollo.
