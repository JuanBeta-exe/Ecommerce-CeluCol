# Guía de API

Esta guía describe los endpoints disponibles en la API del servidor y cómo utilizarlos.

## Base URL

Todas las rutas de la API están prefijadas con:
```
https://{projectId}.supabase.co/functions/v1/make-server-c2dc5864
```

## Autenticación

La mayoría de los endpoints requieren autenticación mediante un token Bearer en el header:
```
Authorization: Bearer <access_token>
```

### Endpoints de Autenticación

#### Registro de Usuario
```http
POST /signup
Content-Type: application/json

{
  "email": "string",
  "password": "string",
  "name": "string",
  "role": "cliente" | "administrador"
}
```

#### Inicio de Sesión
```http
POST /signin
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}
```

## Productos

### Listar Productos
```http
GET /products
Authorization: Bearer <public_anon_key>
```

### Crear Producto (Admin)
```http
POST /products
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "string",
  "description": "string",
  "price": number,
  "imageUrl": "string"
}
```

### Actualizar Producto (Admin)
```http
PUT /products/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "string",
  "description": "string",
  "price": number,
  "imageUrl": "string"
}
```

### Eliminar Producto (Admin)
```http
DELETE /products/:id
Authorization: Bearer <access_token>
```

## Carrito

### Obtener Carrito
```http
GET /cart
Authorization: Bearer <access_token>
```

### Agregar al Carrito
```http
POST /cart
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "productId": "string",
  "quantity": number
}
```

### Actualizar Cantidad
```http
PUT /cart/:productId
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "quantity": number
}
```

### Eliminar del Carrito
```http
DELETE /cart/:productId
Authorization: Bearer <access_token>
```

## Pedidos

### Crear Pedido
```http
POST /orders
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "paymentMethod": "tarjeta" | "transferencia",
  "shippingAddress": "string"
}
```

### Listar Pedidos
```http
GET /orders
Authorization: Bearer <access_token>
```

### Actualizar Estado (Admin)
```http
PUT /orders/:id/status
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "status": "pendiente" | "confirmado" | "enviado" | "entregado" | "cancelado"
}
```

## Respuestas de Error

La API utiliza códigos de estado HTTP estándar:

- `400` - Bad Request: Error en los datos enviados
- `401` - Unauthorized: Token no proporcionado o inválido
- `403` - Forbidden: No tiene permisos para la acción
- `404` - Not Found: Recurso no encontrado
- `500` - Internal Server Error: Error del servidor

Ejemplo de respuesta de error:
```json
{
  "error": "Mensaje descriptivo del error"
}
```

## Límites y Consideraciones

- Tamaño máximo de imágenes: 5MB
- Formatos de imagen soportados: JPG, PNG, WebP
- Rate limiting: 100 requests por minuto por IP
- Timeout de sesión: 24 horas
- Tamaño máximo de payload: 5MB