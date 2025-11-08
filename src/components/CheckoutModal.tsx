import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { CreditCard, Smartphone } from 'lucide-react';

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { paymentMethod: string; shippingAddress: string }) => void;
  total: number;
  isLoading?: boolean;
}

export function CheckoutModal({ open, onClose, onSubmit, total, isLoading }: CheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'tarjeta' | 'transferencia'>('tarjeta');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    onSubmit({
      paymentMethod,
      shippingAddress: formData.get('address') as string,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Finalizar Compra</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Payment Method */}
          <div className="space-y-3">
            <Label>Método de Pago</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('tarjeta')}
                className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-colors ${
                  paymentMethod === 'tarjeta'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <CreditCard className="size-6" />
                <span>Tarjeta</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('transferencia')}
                className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-colors ${
                  paymentMethod === 'transferencia'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <Smartphone className="size-6" />
                <span>Transferencia</span>
              </button>
            </div>
          </div>

          {/* Payment Details */}
          {paymentMethod === 'tarjeta' && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <div className="space-y-2">
                <Label htmlFor="card-number">Número de Tarjeta</Label>
                <Input
                  id="card-number"
                  placeholder="1234 5678 9012 3456"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Vencimiento</Label>
                  <Input
                    id="expiry"
                    placeholder="MM/AA"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    maxLength={3}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="card-name">Nombre en la Tarjeta</Label>
                <Input
                  id="card-name"
                  placeholder="Juan Pérez"
                  required
                />
              </div>
            </div>
          )}

          {paymentMethod === 'transferencia' && (
            <div className="p-4 border rounded-lg bg-muted/50 space-y-2">
              <p>Por favor realiza la transferencia a:</p>
              <div className="space-y-1 text-muted-foreground">
                <p><strong>Banco:</strong> Banco Nacional</p>
                <p><strong>Cuenta:</strong> 1234567890</p>
                <p><strong>Titular:</strong> CeluCol</p>
                <p><strong>Monto:</strong> ${total.toFixed(2)}</p>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Una vez realizada la transferencia, recibirás un correo de confirmación.
              </p>
            </div>
          )}

          {/* Shipping Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Dirección de Envío</Label>
            <Textarea
              id="address"
              name="address"
              placeholder="Calle Principal #123, Apartamento 4B, Ciudad, País, CP 12345"
              rows={3}
              required
            />
          </div>

          {/* Order Summary */}
          <div className="p-4 border rounded-lg bg-muted/50 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Envío</span>
              <span>Gratis</span>
            </div>
            <div className="flex justify-between border-t pt-2 mt-2">
              <span>Total a Pagar</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? 'Procesando...' : 'Confirmar Pedido'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
