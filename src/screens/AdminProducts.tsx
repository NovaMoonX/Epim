import { useState, useEffect, useCallback } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '@lib/firebase';
import type { Product } from '@lib/firebase';
import { Button } from '@moondreamsdev/dreamer-ui/components';
import { Input } from '@moondreamsdev/dreamer-ui/components';
import { Card } from '@moondreamsdev/dreamer-ui/components';
import { Modal } from '@moondreamsdev/dreamer-ui/components';
import { useToast } from '@moondreamsdev/dreamer-ui/hooks';
import { useActionModal } from '@moondreamsdev/dreamer-ui/hooks';

export function AdminProducts() {
  const { addToast } = useToast();
  const { confirm } = useActionModal();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productName, setProductName] = useState('');

  const loadProducts = useCallback(async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
      addToast({ title: 'Failed to load products', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!productName.trim()) {
      addToast({ title: 'Product name is required', type: 'warning' });
      return;
    }

    try {
      if (editingProduct?.id) {
        await updateProduct(editingProduct.id, { name: productName });
        addToast({ title: 'Product updated successfully', type: 'success' });
      } else {
        await createProduct({ name: productName });
        addToast({ title: 'Product created successfully', type: 'success' });
      }
      setShowModal(false);
      setProductName('');
      setEditingProduct(null);
      loadProducts();
    } catch {
      addToast({ title: 'Failed to save product', type: 'error' });
    }
  }

  function handleEdit(product: Product) {
    setEditingProduct(product);
    setProductName(product.name);
    setShowModal(true);
  }

  async function handleDelete(product: Product) {
    const confirmed = await confirm({
      title: 'Delete Product',
      message: `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      destructive: true,
    });

    if (confirmed) {
      try {
        if (product.id) {
          await deleteProduct(product.id);
          addToast({ title: 'Product deleted successfully', type: 'success' });
          loadProducts();
        }
      } catch {
        addToast({ title: 'Failed to delete product', type: 'error' });
      }
    }
  }

  function handleCloseModal() {
    setShowModal(false);
    setProductName('');
    setEditingProduct(null);
  }

  if (loading) {
    return (
      <div className="page flex items-center justify-center">
        <p className="text-foreground/70">Loading...</p>
      </div>
    );
  }

  return (
    <div className="page p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-primary">Product Management</h1>
          <Button onClick={() => setShowModal(true)}>Create Product</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => {
            const createdDate = product.addedAt ? new Date(product.addedAt).toLocaleDateString() : 'N/A';
            
            return (
              <Card key={product.id} className="p-4">
                <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                <p className="text-sm text-foreground/60 mb-4">Created: {createdDate}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(product)}>
                    Delete
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {products.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-foreground/70">No products yet. Create your first product to get started!</p>
          </Card>
        )}
      </div>

      <Modal isOpen={showModal} onClose={handleCloseModal}>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{editingProduct ? 'Edit Product' : 'Create Product'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Product Name</label>
              <Input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Enter product name"
                required
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit">{editingProduct ? 'Update' : 'Create'}</Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
