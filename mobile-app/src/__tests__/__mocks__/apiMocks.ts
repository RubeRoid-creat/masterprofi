/**
 * API Mocks for Testing
 */

import { Order, OrderStatus } from '../../types/order';

export const mockOrders: Order[] = [
  {
    id: 'order-1',
    client: {
      id: 'client-1',
      name: 'John Doe',
      phone: '+7 (999) 123-45-67',
      rating: 4.5,
    },
    appliance: {
      type: 'washing_machine',
      brand: 'Samsung',
      model: 'WW80T4040CE',
    },
    location: {
      address: 'Москва, ул. Ленина, д. 10',
      coordinates: {
        latitude: 55.7558,
        longitude: 37.6173,
      },
      distance: 2.5,
    },
    price: {
      amount: 3000,
      currency: 'RUB',
    },
    status: 'new',
    urgency: 'normal',
    createdAt: '2024-01-15T10:00:00Z',
    isNew: true,
  },
  {
    id: 'order-2',
    client: {
      id: 'client-2',
      name: 'Jane Smith',
      phone: '+7 (999) 234-56-78',
      rating: 4.8,
    },
    appliance: {
      type: 'refrigerator',
      brand: 'LG',
      model: 'GA-B429CLWL',
    },
    location: {
      address: 'Москва, ул. Пушкина, д. 20',
      coordinates: {
        latitude: 55.7520,
        longitude: 37.6156,
      },
      distance: 5.2,
    },
    price: {
      amount: 5000,
      currency: 'RUB',
    },
    status: 'assigned',
    urgency: 'high',
    createdAt: '2024-01-14T15:30:00Z',
    isNew: false,
  },
];

export const mockOrderDetails = {
  id: 'order-1',
  client: mockOrders[0].client,
  appliance: mockOrders[0].appliance,
  location: mockOrders[0].location,
  price: mockOrders[0].price,
  status: 'new' as OrderStatus,
  urgency: 'normal',
  createdAt: '2024-01-15T10:00:00Z',
  symptoms: 'Не включается',
  description: 'Стиральная машина не запускается, горит ошибка',
  photos: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg'],
  chatMessages: [],
  timeline: [
    {
      status: 'new',
      timestamp: '2024-01-15T10:00:00Z',
      description: 'Заказ создан',
    },
  ],
};

export const mockApiResponse = {
  orders: mockOrders,
  pagination: {
    page: 1,
    pageSize: 10,
    total: 2,
    totalPages: 1,
    hasMore: false,
  },
};

export const mockErrorResponse = {
  status: 500,
  data: {
    message: 'Internal server error',
    statusCode: 500,
  },
};

export const mockNetworkError = {
  status: 'FETCH_ERROR',
  error: 'Network request failed',
};








