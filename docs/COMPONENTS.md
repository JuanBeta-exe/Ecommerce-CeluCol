# Documentación Técnica de Componentes

## AuthModal

El componente `AuthModal` maneja la autenticación de usuarios mediante un modal con pestañas para registro e inicio de sesión.

### Props
```typescript
interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onAuthSuccess: (token: string) => void;
}
```

### Funcionalidades
- Registro de usuarios con nombre, email, contraseña y rol
- Inicio de sesión con email y contraseña
- Validación de formularios
- Manejo de errores con feedback visual
- Integración con Supabase Auth

### Ejemplo de Uso
```tsx
<AuthModal
  open={isAuthModalOpen}
  onClose={() => setIsAuthModalOpen(false)}
  onAuthSuccess={handleAuthSuccess}
/>
```

## ProductCard

Componente para mostrar información de productos con diferentes interfaces según el rol del usuario.

### Props
```typescript
interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
  isAdmin?: boolean;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
}
```

### Funcionalidades
- Visualización de imagen, nombre, descripción y precio
- Interfaz de administración (editar/eliminar) para admins
- Botón de "Agregar al carrito" para clientes
- Manejo de imágenes con fallback
- Truncamiento de texto largo

### Ejemplo de Uso
```tsx
<ProductCard
  product={product}
  isAdmin={isAdmin}
  onAddToCart={handleAddToCart}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

## CartSheet

Panel deslizable que muestra el carrito de compras y permite gestionar productos.

### Props
```typescript
interface CartSheetProps {
  open: boolean;
  onClose: () => void;
  cart: { items: CartItem[] };
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
}

interface CartItem {
  productId: string;
  quantity: number;
  product: Product;
}
```

### Funcionalidades
- Lista de productos en el carrito
- Control de cantidades
- Cálculo de subtotales y total
- Eliminación de productos
- Botón para proceder al checkout

### Ejemplo de Uso
```tsx
<CartSheet
  open={isCartOpen}
  onClose={() => setIsCartOpen(false)}
  cart={cart}
  onUpdateQuantity={handleUpdateQuantity}
  onRemoveItem={handleRemoveFromCart}
  onCheckout={handleCheckout}
/>
```

## CheckoutModal

Modal para procesar el pago y finalizar la compra.

### Props
```typescript
interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { paymentMethod: string; shippingAddress: string }) => void;
  total: number;
  isLoading?: boolean;
}
```

### Funcionalidades
- Selección de método de pago
- Formulario de tarjeta de crédito
- Información de transferencia bancaria
- Formulario de dirección de envío
- Resumen de la orden
- Manejo de estado de carga

### Ejemplo de Uso
```tsx
<CheckoutModal
  open={isCheckoutOpen}
  onClose={() => setIsCheckoutOpen(false)}
  onSubmit={handleCreateOrder}
  total={cartTotal}
  isLoading={isLoading}
/>
```

## OrdersView

Componente para visualizar y gestionar pedidos.

### Props
```typescript
interface OrdersViewProps {
  orders: Order[];
  isAdmin?: boolean;
  onUpdateStatus?: (orderId: string, status: string) => void;
}

interface Order {
  id: string;
  userId: string;
  userEmail: string;
  items: CartItem[];
  total: number;
  paymentMethod: string;
  shippingAddress: string;
  status: string;
  createdAt: string;
}
```

### Funcionalidades
- Lista de pedidos con detalles
- Visualización de productos por pedido
- Estados del pedido con colores
- Actualización de estados (admin)
- Ordenamiento por fecha

### Ejemplo de Uso
```tsx
<OrdersView
  orders={orders}
  isAdmin={isAdmin}
  onUpdateStatus={handleUpdateOrderStatus}
/>
```

## Estados de Pedidos

Los pedidos pueden tener los siguientes estados:
- `pendiente`: Pedido realizado, pendiente de confirmación
- `confirmado`: Pedido confirmado y en proceso
- `enviado`: Pedido en tránsito
- `entregado`: Pedido entregado al cliente
- `cancelado`: Pedido cancelado