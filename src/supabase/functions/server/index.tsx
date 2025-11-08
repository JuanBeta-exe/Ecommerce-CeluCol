import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const bucketName = 'make-c2dc5864-products';

// Initialize storage bucket
async function initStorage() {
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
  if (!bucketExists) {
    await supabase.storage.createBucket(bucketName, { public: false });
    console.log(`Bucket ${bucketName} created`);
  }
}

initStorage();

// Helper function to get user from access token
async function getUser(request: Request) {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1];
  if (!accessToken) {
    return null;
  }
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user) {
    return null;
  }
  return user;
}

// ============= AUTH ROUTES =============

app.post('/make-server-c2dc5864/signup', async (c) => {
  try {
    const { email, password, name, role = 'cliente' } = await c.req.json();

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log(`Error creating user during signup: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ user: data.user });
  } catch (error) {
    console.log(`Error in signup route: ${error}`);
    return c.json({ error: 'Error creating user' }, 500);
  }
});

app.get('/make-server-c2dc5864/user', async (c) => {
  try {
    const user = await getUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    return c.json({ user });
  } catch (error) {
    console.log(`Error getting user: ${error}`);
    return c.json({ error: 'Error getting user' }, 500);
  }
});

// ============= PRODUCTS ROUTES =============

app.post('/make-server-c2dc5864/products', async (c) => {
  try {
    const user = await getUser(c.req.raw);
    if (!user || user.user_metadata?.role !== 'administrador') {
      return c.json({ error: 'Unauthorized. Admin access required.' }, 403);
    }

    const { name, description, price, image } = await c.req.json();
    
    const productId = crypto.randomUUID();
    let imageUrl = null;

    // Handle image upload if provided
    if (image && image.startsWith('data:')) {
      const base64Data = image.split(',')[1];
      const mimeType = image.split(':')[1].split(';')[0];
      const ext = mimeType.split('/')[1];
      const fileName = `${productId}.${ext}`;

      const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, imageBuffer, {
          contentType: mimeType,
          upsert: true
        });

      if (uploadError) {
        console.log(`Error uploading image: ${uploadError.message}`);
        return c.json({ error: 'Error uploading image' }, 500);
      }

      const { data: signedUrlData } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(fileName, 31536000); // 1 year

      imageUrl = signedUrlData?.signedUrl;
    }

    const product = {
      id: productId,
      name,
      description,
      price: parseFloat(price),
      imageUrl,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`product:${productId}`, product);

    return c.json({ product });
  } catch (error) {
    console.log(`Error creating product: ${error}`);
    return c.json({ error: 'Error creating product' }, 500);
  }
});

app.get('/make-server-c2dc5864/products', async (c) => {
  try {
    const products = await kv.getByPrefix('product:');
    return c.json({ products });
  } catch (error) {
    console.log(`Error fetching products: ${error}`);
    return c.json({ error: 'Error fetching products' }, 500);
  }
});

app.get('/make-server-c2dc5864/products/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const product = await kv.get(`product:${id}`);
    
    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }

    return c.json({ product });
  } catch (error) {
    console.log(`Error fetching product: ${error}`);
    return c.json({ error: 'Error fetching product' }, 500);
  }
});

app.put('/make-server-c2dc5864/products/:id', async (c) => {
  try {
    const user = await getUser(c.req.raw);
    if (!user || user.user_metadata?.role !== 'administrador') {
      return c.json({ error: 'Unauthorized. Admin access required.' }, 403);
    }

    const id = c.req.param('id');
    const { name, description, price, image } = await c.req.json();
    
    const existingProduct = await kv.get(`product:${id}`);
    if (!existingProduct) {
      return c.json({ error: 'Product not found' }, 404);
    }

    let imageUrl = existingProduct.imageUrl;

    // Handle image upload if provided
    if (image && image.startsWith('data:')) {
      const base64Data = image.split(',')[1];
      const mimeType = image.split(':')[1].split(';')[0];
      const ext = mimeType.split('/')[1];
      const fileName = `${id}.${ext}`;

      const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, imageBuffer, {
          contentType: mimeType,
          upsert: true
        });

      if (uploadError) {
        console.log(`Error uploading image: ${uploadError.message}`);
        return c.json({ error: 'Error uploading image' }, 500);
      }

      const { data: signedUrlData } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(fileName, 31536000);

      imageUrl = signedUrlData?.signedUrl;
    }

    const product = {
      ...existingProduct,
      name: name || existingProduct.name,
      description: description || existingProduct.description,
      price: price ? parseFloat(price) : existingProduct.price,
      imageUrl,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`product:${id}`, product);

    return c.json({ product });
  } catch (error) {
    console.log(`Error updating product: ${error}`);
    return c.json({ error: 'Error updating product' }, 500);
  }
});

app.delete('/make-server-c2dc5864/products/:id', async (c) => {
  try {
    const user = await getUser(c.req.raw);
    if (!user || user.user_metadata?.role !== 'administrador') {
      return c.json({ error: 'Unauthorized. Admin access required.' }, 403);
    }

    const id = c.req.param('id');
    await kv.del(`product:${id}`);

    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting product: ${error}`);
    return c.json({ error: 'Error deleting product' }, 500);
  }
});

// ============= CART ROUTES =============

app.get('/make-server-c2dc5864/cart', async (c) => {
  try {
    const user = await getUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const cart = await kv.get(`cart:${user.id}`) || { items: [] };
    return c.json({ cart });
  } catch (error) {
    console.log(`Error fetching cart: ${error}`);
    return c.json({ error: 'Error fetching cart' }, 500);
  }
});

app.post('/make-server-c2dc5864/cart', async (c) => {
  try {
    const user = await getUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { productId, quantity } = await c.req.json();
    const product = await kv.get(`product:${productId}`);
    
    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }

    const cart = await kv.get(`cart:${user.id}`) || { items: [] };
    const existingItemIndex = cart.items.findIndex((item: any) => item.productId === productId);

    if (existingItemIndex >= 0) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({
        productId,
        quantity,
        product
      });
    }

    await kv.set(`cart:${user.id}`, cart);
    return c.json({ cart });
  } catch (error) {
    console.log(`Error adding to cart: ${error}`);
    return c.json({ error: 'Error adding to cart' }, 500);
  }
});

app.put('/make-server-c2dc5864/cart/:productId', async (c) => {
  try {
    const user = await getUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const productId = c.req.param('productId');
    const { quantity } = await c.req.json();

    const cart = await kv.get(`cart:${user.id}`) || { items: [] };
    const itemIndex = cart.items.findIndex((item: any) => item.productId === productId);

    if (itemIndex < 0) {
      return c.json({ error: 'Item not found in cart' }, 404);
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    await kv.set(`cart:${user.id}`, cart);
    return c.json({ cart });
  } catch (error) {
    console.log(`Error updating cart: ${error}`);
    return c.json({ error: 'Error updating cart' }, 500);
  }
});

app.delete('/make-server-c2dc5864/cart/:productId', async (c) => {
  try {
    const user = await getUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const productId = c.req.param('productId');
    const cart = await kv.get(`cart:${user.id}`) || { items: [] };
    
    cart.items = cart.items.filter((item: any) => item.productId !== productId);
    
    await kv.set(`cart:${user.id}`, cart);
    return c.json({ cart });
  } catch (error) {
    console.log(`Error removing from cart: ${error}`);
    return c.json({ error: 'Error removing from cart' }, 500);
  }
});

// ============= ORDER ROUTES =============

app.post('/make-server-c2dc5864/orders', async (c) => {
  try {
    const user = await getUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { paymentMethod, shippingAddress } = await c.req.json();
    const cart = await kv.get(`cart:${user.id}`);

    if (!cart || cart.items.length === 0) {
      return c.json({ error: 'Cart is empty' }, 400);
    }

    const orderId = crypto.randomUUID();
    const total = cart.items.reduce((sum: number, item: any) => {
      return sum + (item.product.price * item.quantity);
    }, 0);

    const order = {
      id: orderId,
      userId: user.id,
      userEmail: user.email,
      items: cart.items,
      total,
      paymentMethod,
      shippingAddress,
      status: 'pendiente',
      createdAt: new Date().toISOString(),
    };

    await kv.set(`order:${orderId}`, order);
    await kv.set(`user:${user.id}:order:${orderId}`, orderId);
    
    // Clear cart
    await kv.set(`cart:${user.id}`, { items: [] });

    return c.json({ order });
  } catch (error) {
    console.log(`Error creating order: ${error}`);
    return c.json({ error: 'Error creating order' }, 500);
  }
});

app.get('/make-server-c2dc5864/orders', async (c) => {
  try {
    const user = await getUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const allOrders = await kv.getByPrefix('order:');
    
    let orders;
    if (user.user_metadata?.role === 'administrador') {
      orders = allOrders;
    } else {
      orders = allOrders.filter((order: any) => order.userId === user.id);
    }

    return c.json({ orders });
  } catch (error) {
    console.log(`Error fetching orders: ${error}`);
    return c.json({ error: 'Error fetching orders' }, 500);
  }
});

app.get('/make-server-c2dc5864/orders/:id', async (c) => {
  try {
    const user = await getUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const orderId = c.req.param('id');
    const order = await kv.get(`order:${orderId}`);

    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }

    if (order.userId !== user.id && user.user_metadata?.role !== 'administrador') {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    return c.json({ order });
  } catch (error) {
    console.log(`Error fetching order: ${error}`);
    return c.json({ error: 'Error fetching order' }, 500);
  }
});

app.put('/make-server-c2dc5864/orders/:id/status', async (c) => {
  try {
    const user = await getUser(c.req.raw);
    if (!user || user.user_metadata?.role !== 'administrador') {
      return c.json({ error: 'Unauthorized. Admin access required.' }, 403);
    }

    const orderId = c.req.param('id');
    const { status } = await c.req.json();

    const order = await kv.get(`order:${orderId}`);
    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }

    order.status = status;
    order.updatedAt = new Date().toISOString();

    await kv.set(`order:${orderId}`, order);

    return c.json({ order });
  } catch (error) {
    console.log(`Error updating order status: ${error}`);
    return c.json({ error: 'Error updating order status' }, 500);
  }
});

Deno.serve(app.fetch);
