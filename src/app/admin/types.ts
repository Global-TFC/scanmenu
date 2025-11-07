export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  active: boolean;
}

