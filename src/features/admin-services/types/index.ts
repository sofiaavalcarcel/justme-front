export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  category: string; // The parent group or key
  isActive: boolean;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceCategoryDto {
  name: string;
  description?: string;
  category: string;
  isActive: boolean;
}
