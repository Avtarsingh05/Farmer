import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks';
import { getProduct, updateProduct, createProduct } from '@/services/productService';
import { getActiveCategories } from '@/services/categoryService';
import { productSchema, ProductFormData, UNITS, QUALITY_GRADES } from '@/schemas/product.schema';
import { Category, CloudinaryImage } from '@/types';
import { ImageUploader } from '@/components/shared/ImageUploader';

export default function FarmerProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = Boolean(id && id !== 'new');
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<CloudinaryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      unit: 'kg',
      qualityGrade: 'A',
      lowStockThreshold: 10,
    }
  });

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const cats = await getActiveCategories();
        setCategories(cats);

        if (isEdit && id) {
          const product = await getProduct(id);
          if (product && (product.farmerId === user?.uid || product.farmerId === user?.id)) {
            setImages(product.images || []);
            reset({
              name: product.name,
              categoryId: product.categoryId,
              description: product.description,
              quantity: product.quantity,
              unit: product.unit as any,
              price: product.price,
              qualityGrade: product.qualityGrade,
              location: product.location || '',
              district: product.district || '',
              state: product.state || '',
              lowStockThreshold: 10,
            });
          } else {
            navigate('/farmer/products');
          }
        }
      } catch (error) {
        console.error('Failed to load data', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, isEdit, user, reset, navigate]);

  const onSubmit = async (data: any) => {
    if (!user) return;
    const farmerUid = user.uid || user.id || '';
    const farmerName = user.name || 'Farmer';
    try {
      setSubmitting(true);
      const payload = { ...data, images };
      if (isEdit && id) {
        await updateProduct(id, farmerUid, payload);
      } else {
        await createProduct(farmerUid, farmerName, payload);
      }
      navigate('/farmer/products');
    } catch (error) {
      console.error('Submit error', error);
      alert('Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center text-sm text-neutral-600 hover:text-neutral-900">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Products
      </button>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-neutral-900">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit as any)} className="p-6 md:p-8 space-y-8">
          
          <div className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2">Product Images</h2>
            <ImageUploader 
              images={images}
              onImagesChange={setImages}
              maxImages={5}
            />
            {images.length === 0 && (
              <p className="text-xs text-amber-600">Please upload at least one image of your product.</p>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Product Name</label>
                <input {...register('name')} className="form-input" placeholder="e.g. Organic Tomatoes" />
                {errors.name && <p className="form-error">{errors.name.message}</p>}
              </div>
              
              <div>
                <label className="form-label">Category</label>
                <select {...register('categoryId')} className="form-input">
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {errors.categoryId && <p className="form-error">{errors.categoryId.message}</p>}
              </div>
            </div>

            <div>
              <label className="form-label">Description</label>
              <textarea {...register('description')} rows={4} className="form-input" placeholder="Describe your product..."></textarea>
              {errors.description && <p className="form-error">{errors.description.message}</p>}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2">Pricing & Inventory</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="form-label">Quantity</label>
                <input type="number" step="any" {...register('quantity')} className="form-input" />
                {errors.quantity && <p className="form-error">{errors.quantity.message}</p>}
              </div>
              
              <div>
                <label className="form-label">Unit</label>
                <select {...register('unit')} className="form-input">
                  {UNITS.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
                {errors.unit && <p className="form-error">{errors.unit.message}</p>}
              </div>

              <div>
                <label className="form-label">Price per Unit (₹)</label>
                <input type="number" step="any" {...register('price')} className="form-input" />
                {errors.price && <p className="form-error">{errors.price.message}</p>}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Quality Grade</label>
                <select {...register('qualityGrade')} className="form-input">
                  {QUALITY_GRADES.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="form-label">Low Stock Threshold</label>
                <input type="number" {...register('lowStockThreshold')} className="form-input" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2">Location</h2>
            
            <div>
              <label className="form-label">Address / Farm location</label>
              <input {...register('location')} className="form-input" placeholder="Farm address or landmark" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">District</label>
                <input {...register('district')} className="form-input" placeholder="e.g. Nashik" />
              </div>
              
              <div>
                <label className="form-label">State</label>
                <input {...register('state')} className="form-input" placeholder="e.g. Maharashtra" />
              </div>
            </div>
          </div>
          
          <div className="pt-6 border-t flex justify-end gap-3">
            <button type="button" onClick={() => navigate(-1)} className="btn-ghost btn">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary btn min-w-[120px]">
              {submitting ? 'Saving...' : 'Save Product'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
