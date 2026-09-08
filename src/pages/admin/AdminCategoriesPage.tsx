import React, { useEffect, useState } from 'react';
import { getAllCategories, updateCategory, createCategory, deleteCategory } from '@/services/categoryService';
import { Category } from '@/types';
import { Loader2, Plus, Edit2, Trash2, Tag } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const categorySchema = z.object({
  name: z.string().min(2, "Name is required"),
  slug: z.string().min(2, "Slug is required"),
  description: z.string().optional(),
  icon: z.string().optional(),
  isActive: z.boolean().default(true)
});

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: { isActive: true, name: '', slug: '', description: '', icon: '' }
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getAllCategories();
      // Sort by order if it exists
      data.sort((a, b) => (a.order || 0) - (b.order || 0));
      setCategories(data);
    } catch (err) {
      console.error("Error loading categories", err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      reset({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        icon: category.icon || '',
        isActive: category.isActive !== false
      });
    } else {
      setEditingCategory(null);
      reset({ isActive: true, name: '', slug: '', description: '', icon: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const onSubmit = async (data: any) => {
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, data);
      } else {
        await createCategory({ ...data, order: categories.length } as any);
      }
      await loadCategories();
      closeModal();
    } catch (err) {
      console.error("Error saving category", err);
      alert("Failed to save category.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this category? This might affect products.")) return;
    try {
      await deleteCategory(id);
      setCategories(categories.filter(c => c.id !== id));
    } catch (err) {
      console.error("Error deleting category", err);
      alert("Failed to delete category.");
    }
  };

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setValue('name', name);
    if (!editingCategory) {
      setValue('slug', name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 container-content py-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-neutral-900">Category Management</h1>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="card p-0 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200">
              <th className="table-th w-12 text-center">Icon</th>
              <th className="table-th">Name & Slug</th>
              <th className="table-th">Status</th>
              <th className="table-th">Order</th>
              <th className="table-th text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {categories.length === 0 ? (
              <tr><td colSpan={5} className="py-8 text-center text-neutral-500">No categories found.</td></tr>
            ) : (
              categories.map(category => (
                <tr key={category.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="table-td text-center">
                    <div className="w-8 h-8 rounded bg-primary/10 text-primary flex items-center justify-center mx-auto text-sm">
                      <Tag className="w-4 h-4" />
                    </div>
                  </td>
                  <td className="table-td">
                    <p className="font-medium text-neutral-900">{category.name}</p>
                    <p className="text-xs text-neutral-500">/{category.slug}</p>
                  </td>
                  <td className="table-td">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${category.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-600'}`}>
                      {category.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="table-td text-sm">{category.order || 0}</td>
                  <td className="table-td text-right space-x-2">
                    <button onClick={() => openModal(category)} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(category.id)} className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="form-label">Name</label>
                <input {...register('name')} onChange={handleNameChange} className="form-input" placeholder="e.g. Vegetables" />
                {errors.name && <p className="form-error">{errors.name.message?.toString()}</p>}
              </div>
              <div>
                <label className="form-label">Slug</label>
                <input {...register('slug')} className="form-input" placeholder="e.g. vegetables" />
                {errors.slug && <p className="form-error">{errors.slug.message?.toString()}</p>}
              </div>
              <div>
                <label className="form-label">Description (Optional)</label>
                <textarea {...register('description')} className="form-input" rows={2} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isActive" {...register('isActive')} className="w-4 h-4 text-primary rounded border-neutral-300 focus:ring-primary" />
                <label htmlFor="isActive" className="text-sm font-medium text-neutral-700">Active (Visible to users)</label>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
                <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary">
                  {isSubmitting ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
