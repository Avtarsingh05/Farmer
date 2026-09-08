import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Image as ImageIcon, Upload, Check, X, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks';
import { getProduct, updateProduct, createProduct } from '@/services/productService';
import { getActiveCategories } from '@/services/categoryService';
import { productSchema, ProductFormData, UNITS, QUALITY_GRADES } from '@/schemas/product.schema';
import { Category, CloudinaryImage } from '@/types';
import { ImageUploader } from '@/components/shared/ImageUploader';
import { getStockImageSuggestions, stockImageToCloudinaryImage, StockProduceImage } from '@/utils/produceImages';
import { cn } from '@/utils/cn';

type ImageTab = 'stock' | 'upload';

export default function FarmerProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = Boolean(id && id !== 'new');

  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<CloudinaryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imageTab, setImageTab] = useState<ImageTab>('stock');
  const [stockSuggestions, setStockSuggestions] = useState<StockProduceImage[]>([]);
  const [selectedStockUrl, setSelectedStockUrl] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      unit: 'kg',
      qualityGrade: 'A',
      lowStockThreshold: 10,
    }
  });

  const productName = watch('name');

  // Auto-suggest stock images as name is typed
  useEffect(() => {
    const suggestions = getStockImageSuggestions(productName || '', 8);
    setStockSuggestions(suggestions);
    // Auto-select first suggestion if no image is chosen yet
    if (suggestions.length > 0 && images.length === 0 && !selectedStockUrl) {
      const img = stockImageToCloudinaryImage(suggestions[0]);
      setImages([img]);
      setSelectedStockUrl(suggestions[0].url);
    }
  }, [productName]);

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
            if (product.images?.[0]) {
              setSelectedStockUrl(product.images[0].secureUrl);
            }
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

  const handleSelectStock = useCallback((stock: StockProduceImage) => {
    const img = stockImageToCloudinaryImage(stock);
    setImages([img]);
    setSelectedStockUrl(stock.url);
  }, []);

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
      alert('Failed to save product. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-40 bg-neutral-200 rounded-xl"></div>
        <div className="h-[600px] bg-neutral-100 rounded-3xl"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-neutral-900 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Products
      </button>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">{isEdit ? 'Edit Product' : 'Add New Listing'}</h1>
          <p className="text-neutral-500 mt-1">{isEdit ? 'Update your product information.' : 'List your farm produce on KisanMitra.'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">

        {/* ─── Section 1: Image Selection ─────────────────────────── */}
        <div className="bg-white rounded-3xl border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <div className="p-6 border-b border-neutral-100 bg-neutral-50/50">
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-neutral-500" />
              Product Image
            </h2>
            <p className="text-sm text-neutral-500 mt-1">Type your product name below and a matching stock image will appear instantly, or upload your own photo.</p>
          </div>
          <div className="p-6">
            {/* Tabs */}
            <div className="flex gap-2 mb-6 bg-neutral-100 p-1 rounded-xl w-fit">
              <button
                type="button"
                onClick={() => setImageTab('stock')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
                  imageTab === 'stock' ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
                )}
              >
                <Sparkles className="w-4 h-4" /> Stock Images
              </button>
              <button
                type="button"
                onClick={() => setImageTab('upload')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
                  imageTab === 'upload' ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
                )}
              >
                <Upload className="w-4 h-4" /> Upload My Photo
              </button>
            </div>

            {imageTab === 'stock' ? (
              <div className="space-y-4">
                {/* Selected image preview */}
                {images.length > 0 && selectedStockUrl && (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-primary/30 shadow-md">
                    <img src={images[0].secureUrl} alt="Selected" className="w-full h-52 object-cover" />
                    <div className="absolute top-3 right-3 bg-primary text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow">
                      <Check className="w-3 h-3" /> Selected
                    </div>
                    <button
                      type="button"
                      onClick={() => { setImages([]); setSelectedStockUrl(null); }}
                      className="absolute top-3 left-3 bg-white/90 text-neutral-700 p-1.5 rounded-full hover:bg-white hover:text-red-600 transition-colors shadow"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Stock suggestions grid */}
                {stockSuggestions.length > 0 ? (
                  <div>
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">
                      Matching stock images for "{productName}"
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {stockSuggestions.map((stock, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSelectStock(stock)}
                          className={cn(
                            "relative rounded-xl overflow-hidden border-2 transition-all group",
                            selectedStockUrl === stock.url
                              ? "border-primary shadow-lg scale-[1.02]"
                              : "border-neutral-200 hover:border-neutral-400 hover:shadow-md"
                          )}
                        >
                          <img src={stock.url} alt={stock.label} className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-300" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          <span className="absolute bottom-2 left-2 right-2 text-white text-xs font-bold text-left leading-tight">{stock.label}</span>
                          {selectedStockUrl === stock.url && (
                            <div className="absolute top-2 right-2 bg-primary text-white p-1 rounded-full">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 text-neutral-400 border-2 border-dashed border-neutral-200 rounded-2xl">
                    <Sparkles className="w-10 h-10 mx-auto mb-3 text-neutral-300" />
                    <p className="font-semibold text-neutral-600">Type your product name above</p>
                    <p className="text-sm mt-1">Stock images will appear automatically as you type (e.g. "tomato", "wheat", "mango")</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <ImageUploader images={images} onImagesChange={setImages} maxImages={5} />
                {images.length === 0 && (
                  <p className="text-xs text-amber-600 font-medium">Please upload at least one image of your product.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ─── Section 2: Basic Information ───────────────────────── */}
        <div className="bg-white rounded-3xl border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <div className="p-6 border-b border-neutral-100 bg-neutral-50/50">
            <h2 className="text-lg font-bold text-neutral-900">Basic Information</h2>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-1.5">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('name')}
                  className={cn(
                    "w-full px-4 py-3 bg-neutral-50 border rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none",
                    errors.name ? "border-red-300 bg-red-50/30" : "border-neutral-200"
                  )}
                  placeholder="e.g. Fresh Tomatoes, Basmati Rice, Alphonso Mangoes"
                />
                {errors.name && <p className="text-xs text-red-600 font-medium mt-1.5">{errors.name.message}</p>}
                <p className="text-xs text-neutral-400 mt-1.5">Stock images auto-match as you type the name.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-1.5">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('categoryId')}
                  className={cn(
                    "w-full px-4 py-3 bg-neutral-50 border rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none",
                    errors.categoryId ? "border-red-300" : "border-neutral-200"
                  )}
                >
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {errors.categoryId && <p className="text-xs text-red-600 font-medium mt-1.5">{errors.categoryId.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-1.5">Description</label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none resize-none"
                placeholder="Describe quality, freshness, farm practices, variety name..."
              />
              {errors.description && <p className="text-xs text-red-600 font-medium mt-1.5">{errors.description.message}</p>}
            </div>
          </div>
        </div>

        {/* ─── Section 3: Pricing & Stock ─────────────────────────── */}
        <div className="bg-white rounded-3xl border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <div className="p-6 border-b border-neutral-100 bg-neutral-50/50">
            <h2 className="text-lg font-bold text-neutral-900">Pricing & Stock</h2>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-1.5">
                  Available Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  {...register('quantity', { valueAsNumber: true })}
                  className={cn(
                    "w-full px-4 py-3 bg-neutral-50 border rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none",
                    errors.quantity ? "border-red-300" : "border-neutral-200"
                  )}
                  placeholder="e.g. 500"
                />
                {errors.quantity && <p className="text-xs text-red-600 font-medium mt-1.5">{errors.quantity.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-1.5">Unit</label>
                <select
                  {...register('unit')}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                >
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-1.5">
                  Price per Unit (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-bold">₹</span>
                  <input
                    type="number"
                    step="any"
                    {...register('price', { valueAsNumber: true })}
                    className={cn(
                      "w-full pl-9 pr-4 py-3 bg-neutral-50 border rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none",
                      errors.price ? "border-red-300" : "border-neutral-200"
                    )}
                    placeholder="e.g. 32"
                  />
                </div>
                {errors.price && <p className="text-xs text-red-600 font-medium mt-1.5">{errors.price.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-1.5">Quality Grade</label>
                <div className="grid grid-cols-4 gap-2">
                  {QUALITY_GRADES.map(g => (
                    <label key={g} className="cursor-pointer">
                      <input type="radio" {...register('qualityGrade')} value={g} className="peer sr-only" />
                      <div className="peer-checked:bg-neutral-900 peer-checked:text-white peer-checked:border-neutral-900 border-2 border-neutral-200 rounded-xl py-2.5 text-center text-sm font-bold text-neutral-600 hover:border-neutral-400 transition-all">
                        {g}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-1.5">Low Stock Alert (threshold)</label>
                <input
                  type="number"
                  {...register('lowStockThreshold', { valueAsNumber: true })}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-amber-400 transition-all outline-none"
                  placeholder="e.g. 50"
                />
                <p className="text-xs text-neutral-400 mt-1.5">You'll be alerted when stock falls below this.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Section 4: Location ────────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <div className="p-6 border-b border-neutral-100 bg-neutral-50/50">
            <h2 className="text-lg font-bold text-neutral-900">Farm Location</h2>
          </div>
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-1.5">Farm Address / Landmark</label>
              <input
                {...register('location')}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                placeholder="e.g. Nashik Agri Valley, near Pimpalgaon"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-1.5">District</label>
                <input
                  {...register('district')}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                  placeholder="e.g. Nashik"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-1.5">State</label>
                <input
                  {...register('state')}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                  placeholder="e.g. Maharashtra"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ─── Submit ─────────────────────────────────────────────── */}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)} className="px-6 py-3 border border-neutral-200 rounded-xl text-sm font-bold text-neutral-700 bg-white hover:bg-neutral-50 transition-all shadow-sm">
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              isEdit ? 'Update Product' : 'Publish Listing'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
