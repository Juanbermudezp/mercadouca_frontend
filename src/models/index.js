/**
 * Model definitions (shape reference for the app)
 * These mirror the API DTOs from Swagger
 */

export const UserModel = {
  id: 0, username: '', email: '', firstName: '', lastName: '',
  phoneNumber: '', profilePicture: '', role: '', enabled: true,
  createdAt: '', sellerProfile: null,
};

export const ProductModel = {
  id: 0, title: '', description: '', price: 0, originalPrice: null,
  stock: 0, images: [], categoryId: 0, categoryName: '', sellerId: 0,
  sellerName: '', status: 'ACTIVE', featured: false, averageRating: 0,
  totalReviews: 0, totalSold: 0, viewCount: 0, sku: '', createdAt: '',
};

export const OrderModel = {
  id: 0, orderNumber: '', buyerId: 0, buyerName: '', items: [],
  status: '', subtotal: 0, discountAmount: 0, shippingCost: 0, total: 0,
  paymentMethod: '', paymentId: '', shippingProvider: '', trackingNumber: '',
  shippingAddress: '', shippingCity: '', shippingCountry: '', couponCode: '',
  notes: '', createdAt: '',
};

export const CartModel = { items: [], itemCount: 0, total: 0 };
