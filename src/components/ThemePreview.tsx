"use client";

import { ShoppingCart, Plus } from "lucide-react";

export interface ThemeConfig {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  font: 'Sans Serif' | 'Serif' | 'Monospace';
}

interface ThemePreviewProps {
  themeConfig: ThemeConfig;
  template: string;
  shopName: string;
  shopLogo?: string;
}

const DEFAULT_THEME: ThemeConfig = {
  primaryColor: '#4f46e5',
  backgroundColor: '#ffffff',
  textColor: '#000000',
  font: 'Sans Serif',
};

// Template-specific styling configurations
const getTemplateStyles = (template: string, config: ThemeConfig) => {
  const baseStyles = {
    cardRadius: 'rounded-lg',
    buttonRadius: 'rounded-full',
    headerStyle: 'border-b',
    cardShadow: '',
    pillStyle: 'rounded-full',
  };

  switch (template) {
    case 'PRO':
      return {
        ...baseStyles,
        cardRadius: 'rounded-2xl',
        cardShadow: 'shadow-lg',
        headerStyle: 'border-b backdrop-blur-sm',
      };
    case 'CAFE':
      return {
        ...baseStyles,
        cardRadius: 'rounded-xl',
        buttonRadius: 'rounded-lg',
        pillStyle: 'rounded-lg',
      };
    case 'E_COM':
      return {
        ...baseStyles,
        cardRadius: 'rounded-md',
        buttonRadius: 'rounded-md',
        pillStyle: 'rounded-md',
      };
    case 'MAX':
      return {
        ...baseStyles,
        cardRadius: 'rounded-3xl',
        cardShadow: 'shadow-xl',
        buttonRadius: 'rounded-2xl',
      };
    case 'ECOMAPP':
      return {
        ...baseStyles,
        cardRadius: 'rounded-3xl',
        cardShadow: 'shadow-md',
        buttonRadius: 'rounded-full',
        headerStyle: 'rounded-b-[2.5rem]',
        pillStyle: 'rounded-full',
      };
    case 'NORMAL':
    default:
      return baseStyles;
  }
};

export default function ThemePreview({
  themeConfig,
  template,
  shopName,
  shopLogo,
}: ThemePreviewProps) {
  const config = {
    primaryColor: themeConfig?.primaryColor || DEFAULT_THEME.primaryColor,
    backgroundColor: themeConfig?.backgroundColor || DEFAULT_THEME.backgroundColor,
    textColor: themeConfig?.textColor || DEFAULT_THEME.textColor,
    font: themeConfig?.font || DEFAULT_THEME.font,
  };

  const templateStyles = getTemplateStyles(template, config);

  const fontClass = config.font === 'Serif' 
    ? 'font-serif' 
    : config.font === 'Monospace' 
      ? 'font-mono' 
      : 'font-sans';

  return (
    <div
      className={`w-full ${templateStyles.cardRadius} overflow-hidden border border-gray-200 ${templateStyles.cardShadow} ${fontClass}`}
      style={{
        '--primary': config.primaryColor,
        '--background': config.backgroundColor,
        '--text': config.textColor,
        backgroundColor: config.backgroundColor,
        color: config.textColor,
      } as React.CSSProperties}
      data-template={template}
    >
      {/* Mini Header */}
      <div 
        className={`px-3 py-2 flex items-center justify-between ${templateStyles.headerStyle}`}
        style={{ borderColor: `${config.textColor}20` }}
      >
        <div className="flex items-center gap-2">
          {shopLogo ? (
            <img 
              src={shopLogo} 
              alt={shopName} 
              className="w-5 h-5 rounded-full object-cover"
            />
          ) : (
            <div 
              className="w-5 h-5 rounded-full"
              style={{ backgroundColor: config.primaryColor }}
            />
          )}
          <span className="text-xs font-semibold truncate max-w-[80px]">
            {shopName || 'Shop Name'}
          </span>
        </div>
        <div 
          className={`p-1 ${templateStyles.buttonRadius}`}
          style={{ backgroundColor: `${config.primaryColor}20` }}
        >
          <ShoppingCart size={12} style={{ color: config.primaryColor }} />
        </div>
      </div>

      {/* Mini Product Card */}
      <div className="p-3">
        <div className={`${templateStyles.cardRadius} overflow-hidden`} style={{ backgroundColor: `${config.textColor}10` }}>
          {/* Product Image Placeholder */}
          <div 
            className="h-16 flex items-center justify-center"
            style={{ backgroundColor: `${config.textColor}05` }}
          >
            <div 
              className={`w-8 h-8 ${templateStyles.cardRadius}`}
              style={{ backgroundColor: `${config.textColor}15` }}
            />
          </div>
          
          {/* Product Info */}
          <div className="p-2">
            <div 
              className="text-[10px] font-medium truncate mb-1"
              style={{ color: config.textColor }}
            >
              Sample Product
            </div>
            <div className="flex items-center justify-between">
              <span 
                className="text-xs font-bold"
                style={{ color: config.textColor }}
              >
                ₹299
              </span>
              <button
                className={`p-1 ${templateStyles.buttonRadius} transition-colors`}
                style={{ 
                  backgroundColor: config.primaryColor,
                  color: '#ffffff'
                }}
              >
                <Plus size={10} />
              </button>
            </div>
          </div>
        </div>

        {/* Mini Category Pills */}
        <div className="flex gap-1 mt-2">
          <span 
            className={`px-2 py-0.5 ${templateStyles.pillStyle} text-[8px] font-medium`}
            style={{ 
              backgroundColor: config.primaryColor,
              color: '#ffffff'
            }}
          >
            All
          </span>
          <span 
            className={`px-2 py-0.5 ${templateStyles.pillStyle} text-[8px]`}
            style={{ 
              backgroundColor: `${config.textColor}10`,
              color: config.textColor
            }}
          >
            Category
          </span>
        </div>
      </div>

      {/* Mini Footer */}
      <div 
        className="px-3 py-1.5 text-center border-t"
        style={{ 
          borderColor: `${config.textColor}20`,
          backgroundColor: `${config.textColor}05`
        }}
      >
        <span className="text-[8px] opacity-60">Preview</span>
      </div>
    </div>
  );
}
