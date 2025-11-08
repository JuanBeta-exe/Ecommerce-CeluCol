import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Package, Clock, CheckCircle2, XCircle } from 'lucide-react';

interface Order {
  id: string;
  userId: string;
  userEmail: string;
  items: Array<{
    productId: string;
    quantity: number;
    product: {
      name: string;
      price: number;
    };
  }>;
  total: number;
  paymentMethod: string;
  shippingAddress: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

interface OrdersViewProps {
  orders: Order[];
  isAdmin?: boolean;
  onUpdateStatus?: (orderId: string, status: string) => void;
}

const statusConfig = {
  pendiente: { label: 'Pendiente', icon: Clock, color: 'bg-yellow-500' },
  procesando: { label: 'Procesando', icon: Package, color: 'bg-blue-500' },
  enviado: { label: 'Enviado', icon: Package, color: 'bg-purple-500' },
  entregado: { label: 'Entregado', icon: CheckCircle2, color: 'bg-green-500' },
  cancelado: { label: 'Cancelado', icon: XCircle, color: 'bg-red-500' },
};

export function OrdersView({ orders, isAdmin, onUpdateStatus }: OrdersViewProps) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Package className="size-16 mb-4" />
        <p>No hay pedidos</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pendiente;
        const StatusIcon = status.icon;

        return (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="mb-2">Pedido #{order.id.slice(0, 8)}</CardTitle>
                  <p className="text-muted-foreground">
                    {new Date(order.createdAt).toLocaleString('es-ES')}
                  </p>
                  {isAdmin && (
                    <p className="text-muted-foreground mt-1">
                      Cliente: {order.userEmail}
                    </p>
                  )}
                </div>
                <Badge variant="outline" className="gap-2">
                  <StatusIcon className="size-4" />
                  {status.label}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <h4 className="mb-2">Productos</h4>
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>
                        {item.product.name} x{item.quantity}
                      </span>
                      <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="flex justify-between">
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>

              <div>
                <h4 className="mb-1">Método de Pago</h4>
                <p className="text-muted-foreground capitalize">{order.paymentMethod}</p>
              </div>

              <div>
                <h4 className="mb-1">Dirección de Envío</h4>
                <p className="text-muted-foreground">{order.shippingAddress}</p>
              </div>

              {isAdmin && (
                <>
                  <Separator />
                  <div>
                    <h4 className="mb-2">Actualizar Estado</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(statusConfig).map(([key, value]) => (
                        <Button
                          key={key}
                          size="sm"
                          variant={order.status === key ? 'default' : 'outline'}
                          onClick={() => onUpdateStatus?.(order.id, key)}
                        >
                          {value.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
