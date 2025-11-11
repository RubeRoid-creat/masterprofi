// Order types

export type OrderStatus = 'new' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  client: {
    id: string;
    name: string;
    phone: string;
    avatar?: string;
  };
  appliance: {
    type: string;
    brand?: string;
    model?: string;
    issue?: string;
  };
  location: {
    address: string;
    city: string;
    latitude: number;
    longitude: number;
    distance?: number; // in kilometers
  };
  price: {
    amount: number;
    currency: string;
  };
  status: OrderStatus;
  createdAt: string;
  scheduledAt?: string;
  assignedTo?: string;
  completedAt?: string;
  notes?: string;
  priority?: 'low' | 'medium' | 'high';
  isNew?: boolean;
}

export interface OrderFilters {
  status?: OrderStatus[];
  minPrice?: number;
  maxPrice?: number;
  maxDistance?: number;
  applianceTypes?: string[];
  sortBy?: 'distance' | 'price' | 'date';
  sortOrder?: 'asc' | 'desc';
}

export interface OrderFeedState {
  activeTab: OrderStatus;
  orders: Order[];
  filteredOrders: Order[];
  searchQuery: string;
  filters: OrderFilters;
  showMap: boolean;
  isRefreshing: boolean;
  lastSyncTime?: string;
  newOrdersCount: number;
}









