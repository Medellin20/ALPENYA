export * from './database';

export interface PropertyFilters {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  propertyType?: string;
  furnished?: 'yes' | 'no' | 'any';
  sort?: 'price_asc' | 'price_desc' | 'recent' | 'surface';
  page?: number;
}

export interface ActionResult<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
  fieldErrors?: Record<string, string[]>;
}

export interface DashboardStats {
  totalProperties: number;
  availableProperties: number;
  reservedProperties: number;
  rentedProperties: number;
  viewingRequestsTotal: number;
  viewingsToday: number;
  reservationsPending: number;
}
