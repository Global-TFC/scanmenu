// components/CreateMenuForm.tsx

 'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { MenuTemplateType } from '@/generated/prisma/enums';
import { createMenu, isMenuFormAlreadyFilled } from '@/lib/api/menus';
import { useRouter } from 'next/navigation';

interface FormData {
  slug: string;
  title: string;
  summary: string;
  template: MenuTemplateType;
}

interface FormErrors {
  slug?: string;
  title?: string;
  summary?: string;
  general?: string;
}

export default function CreateMenuForm() {
  const { data: session } = useSession();
  const router = useRouter()

  useEffect(() => {
    const checkForm = async () => {
      const response = await isMenuFormAlreadyFilled(session?.user?.id || '');
      if (response.exists && response.menu?.slug) {
        router.push(`/admin/${response.menu.slug}`);
      }
    };
    checkForm();
  }, [session, router])

  const [formData, setFormData] = useState<FormData>({
    slug: '',
    title: '',
    summary: '',
    template: 'PRO' as MenuTemplateType,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user types
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Client-side validation
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    // userId is taken from the logged-in session on submit

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrors({});

    // Validate form
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const userId = session?.user?.id;
      if (!userId) throw new Error('Not authenticated');

      const menuData = {
        userId,
        slug: formData.slug,
        title: formData.title,
        summary: formData.summary || undefined,
        template: formData.template,
      };

      const newMenu = await createMenu(menuData);
      
      setSuccessMessage(`Menu "${newMenu.title}" created successfully!`);
      
      // Navigate to admin page with the new slug
      router.push(`/admin/${formData.slug}`);
      
      // Reset form
      setFormData({
        slug: '',
        title: '',
        summary: '',
        template: 'PRO' as MenuTemplateType,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create menu';
      setErrors({ general: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Create New Menu</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Logged-in user info */}
        {session?.user && (
          <div className="text-sm text-gray-700">
            Creating menu as: <strong>{session.user.name || session.user.email}</strong>
          </div>
        )}

        {/* Slug */}
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
            Slug <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="slug"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.slug ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="my-menu-slug"
            disabled={isSubmitting}
          />
          {errors.slug && (
            <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Only lowercase letters, numbers, and hyphens
          </p>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="My Awesome Menu"
            disabled={isSubmitting}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        {/* Summary */}
        <div>
          <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-1">
            Summary (Optional)
          </label>
          <textarea
            id="summary"
            name="summary"
            value={formData.summary}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Brief description of your menu..."
            disabled={isSubmitting}
          />
        </div>

        {/* Template */}
        <div>
          <label htmlFor="template" className="block text-sm font-medium text-gray-700 mb-1">
            Template Type
          </label>
          <select
            id="template"
            name="template"
            value={formData.template}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
          >
            <option value="NORMAL">NORMAL</option>
            <option value="PRO">PRO</option>
            <option value="E_COM">E_COM</option>
          </select>
        </div>

        {/* Error Message */}
        {errors.general && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errors.general}</p>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-600">{successMessage}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 px-4 rounded-md font-medium text-white transition-colors ${
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          }`}
        >
          {isSubmitting ? 'Creating Menu...' : 'Create Menu'}
        </button>
      </form>
    </div>
  );
}
