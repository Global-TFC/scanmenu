'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { MenuTemplateType } from '@/generated/prisma/enums';
import { createMenu, isMenuFormAlreadyFilled } from '@/lib/api/menus';
import { useRouter } from 'next/navigation';
import { 
  LayoutTemplate, 
  ShoppingBag, 
  Utensils, 
  Check, 
  Store, 
  MapPin, 
  Phone, 
  Link as LinkIcon, 
  ArrowRight,
  Eye
} from 'lucide-react';

interface FormData {
  slug: string;
  shopName: string;
  place: string;
  contactNumber: string;
  template: MenuTemplateType;
}

interface FormErrors {
  slug?: string;
  shopName?: string;
  place?: string;
  contactNumber?: string;
  general?: string;
}

const TEMPLATES = [
  {
    id: 'NORMAL',
    name: 'Normal Menu',
    description: 'Classic list view perfect for simple menus.',
    icon: Utensils,
    color: 'bg-orange-100 text-orange-600',
    previewUrl: '/showrt',
  },
  {
    id: 'PRO',
    name: 'Pro Menu',
    description: 'Rich visual experience with categories and featured items.',
    icon: LayoutTemplate,
    color: 'bg-purple-100 text-purple-600',
    previewUrl: '/myshop',
  },
  {
    id: 'E_COM',
    name: 'E-Commerce',
    description: 'Full shopping experience with cart and checkout.',
    icon: ShoppingBag,
    color: 'bg-blue-100 text-blue-600',
    previewUrl: '/myshop',
  },
] as const;

export default function CreateMenuForm() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    const checkForm = async () => {
      const response = await isMenuFormAlreadyFilled(session?.user?.id || '');
      if (response.exists && response.menu?.slug) {
        router.push(`/admin/${response.menu.slug}`);
      }
    };
    checkForm();
  }, [session, router]);

  const [formData, setFormData] = useState<FormData>({
    slug: '',
    shopName: '',
    place: '',
    contactNumber: '',
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
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleTemplateSelect = (templateId: MenuTemplateType) => {
    setFormData((prev) => ({ ...prev, template: templateId }));
  };

  // Client-side validation
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
    }

    if (!formData.shopName.trim()) {
      newErrors.shopName = 'Shop Name is required';
    } else if (formData.shopName.length < 3) {
      newErrors.shopName = 'Shop Name must be at least 3 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrors({});

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const userId = session?.user?.id;
      if (!userId) throw new Error('Not authenticated');

      const menuData = {
        userId,
        slug: formData.slug,
        shopName: formData.shopName,
        place: formData.place || undefined,
        contactNumber: formData.contactNumber || undefined,
        template: formData.template,
      };

      const newMenu = await createMenu(menuData);
      
      setSuccessMessage(`Menu "${newMenu.shopName}" created successfully!`);
      router.push(`/admin/${formData.slug}`);
      
      setFormData({
        slug: '',
        shopName: '',
        place: '',
        contactNumber: '',
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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl mb-2">
            Create Your Digital Menu
          </h1>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {/* Progress Indicator (Visual only for now) */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-sm font-medium text-gray-600">
                {session?.user ? `Logged in as ${session.user.name || session.user.email}` : 'Guest'}
              </span>
            </div>
            <div className="text-sm text-gray-400">Step 1 of 1</div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Shop Details Section */}
            <section>
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Store className="text-indigo-600" size={24} />
                Shop Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Shop Name */}
                <div className="col-span-2 md:col-span-1">
                  <label htmlFor="shopName" className="block text-sm font-medium text-gray-700 mb-1">
                    Shop Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="shopName"
                      name="shopName"
                      value={formData.shopName}
                      onChange={handleChange}
                      className={`block w-full px-4 py-3 rounded-lg border ${
                        errors.shopName ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-indigo-500 focus:border-indigo-500'
                      } transition-colors bg-gray-50 focus:bg-white`}
                      placeholder="e.g. Joe's Coffee Shop"
                      disabled={isSubmitting}
                    />
                    {errors.shopName && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-red-500 text-sm">!</span>
                      </div>
                    )}
                  </div>
                  {errors.shopName && <p className="mt-1 text-sm text-red-600">{errors.shopName}</p>}
                </div>

                {/* Slug */}
                <div className="col-span-2 md:col-span-1">
                  <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                    Shop URL Slug <span className="text-red-500">*</span>
                  </label>
                  <div className="relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LinkIcon className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="slug"
                      name="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-4 py-3 rounded-lg border ${
                        errors.slug ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-indigo-500 focus:border-indigo-500'
                      } transition-colors bg-gray-50 focus:bg-white`}
                      placeholder="joes-coffee"
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.slug ? (
                    <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
                  ) : (
                    <p className="mt-1 text-xs text-gray-500">scanmenu.com/<strong>{formData.slug || 'your-slug'}</strong></p>
                  )}
                </div>

                {/* Place */}
                <div className="col-span-2 md:col-span-1">
                  <label htmlFor="place" className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="place"
                      name="place"
                      value={formData.place}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-gray-50 focus:bg-white"
                      placeholder="e.g. Malappuram"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Contact Number */}
                <div className="col-span-2 md:col-span-1">
                  <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      id="contactNumber"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-gray-50 focus:bg-white"
                      placeholder="e.g. +91 9876543210"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>
            </section>

            <div className="border-t border-gray-100"></div>

            {/* Template Selection Section */}
            <section>
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <LayoutTemplate className="text-indigo-600" size={24} />
                Choose a Template
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {TEMPLATES.map((template) => {
                  const Icon = template.icon;
                  const isSelected = formData.template === template.id;
                  
                  return (
                    <div 
                      key={template.id}
                      className={`relative group rounded-xl border-2 transition-all duration-300 cursor-pointer overflow-hidden ${
                        isSelected 
                          ? 'border-indigo-600 bg-indigo-50 shadow-lg scale-105 ring-1 ring-indigo-600' 
                          : 'border-gray-200 hover:border-indigo-300 hover:shadow-md bg-white'
                      }`}
                      onClick={() => handleTemplateSelect(template.id as MenuTemplateType)}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3 bg-indigo-600 text-white p-1 rounded-full shadow-sm z-10">
                          <Check size={14} strokeWidth={3} />
                        </div>
                      )}
                      
                      <div className="p-6 flex flex-col h-full">
                        <div className={`w-12 h-12 rounded-lg ${template.color} flex items-center justify-center mb-4`}>
                          <Icon size={24} />
                        </div>
                        
                        <h4 className={`font-bold text-lg mb-2 ${isSelected ? 'text-indigo-900' : 'text-gray-900'}`}>
                          {template.name}
                        </h4>
                        
                        <p className="text-sm text-gray-500 mb-6 flex-grow">
                          {template.description}
                        </p>
                        
                        <div className="flex items-center justify-between mt-auto">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            isSelected ? 'bg-indigo-200 text-indigo-800' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {isSelected ? 'Selected' : 'Select'}
                          </span>
                          
                          <a 
                            href={template.previewUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1 hover:underline z-20"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Eye size={14} />
                            Preview
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Error & Success Messages */}
            {errors.general && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                <div className="text-red-500 mt-0.5">!</div>
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            {successMessage && (
              <div className="p-4 bg-green-50 border border-green-100 rounded-xl flex items-start gap-3">
                <div className="text-green-500 mt-0.5"><Check size={16} /></div>
                <p className="text-sm text-green-600 font-medium">{successMessage}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 px-6 rounded-xl font-bold text-white text-lg shadow-lg transition-all transform hover:-translate-y-1 ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed shadow-none transform-none'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-indigo-200'
                } flex items-center justify-center gap-2`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creating Your Menu...
                  </>
                ) : (
                  <>
                    Create Menu <ArrowRight size={20} />
                  </>
                )}
              </button>
              <p className="text-center text-xs text-gray-400 mt-4">
                By creating a menu, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
