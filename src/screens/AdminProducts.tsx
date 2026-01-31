import { useState, useEffect, useCallback } from 'react';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '@lib/firebase';
import type { Product } from '@lib/firebase';
import { Button } from '@moondreamsdev/dreamer-ui/components';
import { Card } from '@moondreamsdev/dreamer-ui/components';
import { Modal } from '@moondreamsdev/dreamer-ui/components';
import { Form, FormFactories } from '@moondreamsdev/dreamer-ui/components';
import { useToast } from '@moondreamsdev/dreamer-ui/hooks';
import { useActionModal } from '@moondreamsdev/dreamer-ui/hooks';
import { validateUrl } from '@utils/validation';

export function AdminProducts() {
  const { addToast } = useToast();
  const { confirm } = useActionModal();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    shortDescription: string;
    siteUrl: string;
  }>({
    name: '',
    shortDescription: '',
    siteUrl: '',
  });

  // Define form fields using FormFactories
  const formFields = [
    FormFactories.input({
      name: 'name',
      label: 'Product Name',
      placeholder: 'Enter product name',
      required: true,
      colSpan: 'full',
      isValid: (value) => {
        const trimmed = value.trim();
        
        if (trimmed.length === 0) {
          return {
            valid: false,
            message: 'Product name is required',
          };
        }
        
        return { valid: true };
      },
    }),
    FormFactories.textarea({
      name: 'shortDescription',
      label: 'Short Description',
      placeholder: 'Enter a short description (optional)',
      rows: 3,
      colSpan: 'full',
    }),
    FormFactories.input({
      name: 'siteUrl',
      label: 'Site URL',
      type: 'url',
      placeholder: 'https://example.com (optional)',
      colSpan: 'full',
      isValid: validateUrl,
    }),
  ];

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

  async function handleSubmit(data: typeof formData) {
    try {
      if (editingProduct?.id) {
        await updateProduct(editingProduct.id, {
          name: data.name,
          shortDescription: data.shortDescription.trim() || undefined,
          siteUrl: data.siteUrl.trim() || undefined,
        });
        addToast({ title: 'Product updated successfully', type: 'success' });
      } else {
        await createProduct({
          name: data.name,
          shortDescription: data.shortDescription.trim() || undefined,
          siteUrl: data.siteUrl.trim() || undefined,
        });
        addToast({ title: 'Product created successfully', type: 'success' });
      }
      setShowModal(false);
      setFormData({ name: '', shortDescription: '', siteUrl: '' });
      setEditingProduct(null);
      loadProducts();
    } catch {
      addToast({ title: 'Failed to save product', type: 'error' });
    }
  }

  function handleEdit(product: Product) {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      shortDescription: product.shortDescription || '',
      siteUrl: product.siteUrl || '',
    });
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
    setFormData({ name: '', shortDescription: '', siteUrl: '' });
    setEditingProduct(null);
  }

  if (loading) {
    return (
      <div className='page flex items-center justify-center'>
        <p className='text-foreground/70'>Loading...</p>
      </div>
    );
  }

  return (
    <div className='page p-6'>
      <div className='mx-auto max-w-4xl space-y-6'>
        <div className='flex items-center justify-between'>
          <h1 className='text-primary text-3xl font-bold'>
            Product Management
          </h1>
          <Button onClick={() => setShowModal(true)}>Create Product</Button>
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {products.map((product) => {
            const addedAtDate = product.addedAt
              ? new Date(product.addedAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : 'N/A';

            return (
              <Card key={product.id} className='p-4'>
                <h3 className='mb-2 text-lg font-semibold'>{product.name}</h3>
                {product.shortDescription && (
                  <p className='text-foreground/80 mb-2 text-sm'>
                    {product.shortDescription}
                  </p>
                )}
                {product.siteUrl && (
                  <a 
                    href={product.siteUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-primary hover:underline mb-2 block text-sm'
                    aria-label={`Visit ${product.name} website`}
                  >
                    {product.siteUrl}
                  </a>
                )}
                <p className='text-foreground/60 mb-4 text-sm'>
                  Added on {addedAtDate}
                </p>
                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handleEdit(product)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant='destructive'
                    size='sm'
                    onClick={() => handleDelete(product)}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {products.length === 0 && (
          <Card className='p-8 text-center'>
            <p className='text-foreground/70'>
              No products yet. Create your first product to get started!
            </p>
          </Card>
        )}
      </div>

      <Modal isOpen={showModal} onClose={handleCloseModal}>
        <div className='space-y-4'>
          <h2 className='text-2xl font-bold'>
            {editingProduct ? 'Edit Product' : 'Create Product'}
          </h2>
          <Form
            form={formFields}
            initialData={formData}
            onDataChange={setFormData}
            onSubmit={handleSubmit}
            submitButton={
              <div className='flex justify-end gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={handleCloseModal}
                >
                  Cancel
                </Button>
                <Button type='submit'>
                  {editingProduct ? 'Update' : 'Create'}
                </Button>
              </div>
            }
          />
        </div>
      </Modal>
    </div>
  );
}
