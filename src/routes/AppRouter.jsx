import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ProtectedRoute, PublicRoute } from './ProtectedRoute';
import AppLayout from '../layouts/AppLayout';
import { Spinner } from '../components/common/UI';

// Auth
const LoginPage    = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));

// Tienda (pública / any authenticated)
const ShopPage          = lazy(() => import('../pages/shop/ShopPage'));
const ProductDetailPage = lazy(() => import('../pages/shop/ProductDetailPage'));

// Compra — accesible para BUYER y SELLER
const CartPage      = lazy(() => import('../pages/cart/CartPage'));
const CheckoutPage  = lazy(() => import('../pages/cart/CheckoutPage'));
const OrdersPage    = lazy(() => import('../pages/orders/OrdersPage'));
const OrderDetailPage = lazy(() => import('../pages/orders/OrderDetailPage'));
const WishlistPage  = lazy(() => import('../pages/buyer/WishlistPage'));
const AddressesPage = lazy(() => import('../pages/buyer/AddressesPage'));
const DisputesPage  = lazy(() => import('../pages/buyer/DisputesPage'));

// Rutas compartidas (cualquier usuario autenticado)
const ChatPage          = lazy(() => import('../pages/chat/ChatPage'));
const ProfilePage       = lazy(() => import('../pages/profile/ProfilePage'));
const NotificationsPage = lazy(() => import('../pages/buyer/NotificationsPage'));

// Vendedor
const SellerDashboardPage = lazy(() => import('../pages/seller/SellerDashboardPage'));
const SellerProductsPage  = lazy(() => import('../pages/seller/SellerProductsPage'));
const SellerOrdersPage    = lazy(() => import('../pages/seller/SellerOrdersPage'));
const SellerCouponsPage   = lazy(() => import('../pages/seller/SellerCouponsPage'));
const SellerDisputesPage  = lazy(() => import('../pages/seller/SellerDisputesPage'));

// Admin
const AdminDashboardPage    = lazy(() => import('../pages/admin/DashboardPage'));
const AdminOrdersPage       = lazy(() => import('../pages/admin/AdminOrdersPage'));
const AdminUserMgmtPage     = lazy(() => import('../pages/admin/AdminUserManagementPage'));
const AdminProductsPage     = lazy(() => import('../pages/admin/AdminProductsPage'));
const AdminDisputesPage     = lazy(() => import('../pages/admin/AdminDisputesPage'));
const AdminCategoriesPage   = lazy(() => import('../pages/admin/AdminCategoriesPage'));
const AdminSellersPage      = lazy(() => import('../pages/admin/AdminSellersPage'));

const Loading = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
    <Spinner size={36} />
  </div>
);

export default function AppRouter() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* Rutas públicas */}
        <Route element={<PublicRoute />}>
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<AppLayout />}>

          {/* Cualquier usuario autenticado */}
          <Route element={<ProtectedRoute />}>
            <Route path="/shop"          element={<ShopPage />} />
            <Route path="/products/:id"  element={<ProductDetailPage />} />
            <Route path="/chat"          element={<ChatPage />} />
            <Route path="/profile"       element={<ProfilePage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Route>

          {/* Rutas de compra: BUYER y SELLER (SELLER puede comprar) */}
          <Route element={<ProtectedRoute roles={['BUYER']} />}>
            <Route path="/cart"       element={<CartPage />} />
            <Route path="/checkout"   element={<CheckoutPage />} />
            <Route path="/orders"     element={<OrdersPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
            <Route path="/wishlist"   element={<WishlistPage />} />
            <Route path="/addresses"  element={<AddressesPage />} />
            <Route path="/disputes"   element={<DisputesPage />} />
          </Route>

          {/* Rutas de vendedor */}
          <Route element={<ProtectedRoute roles={['SELLER']} />}>
            <Route path="/seller/dashboard" element={<SellerDashboardPage />} />
            <Route path="/seller/products"  element={<SellerProductsPage />} />
            <Route path="/seller/orders"    element={<SellerOrdersPage />} />
            <Route path="/seller/coupons"   element={<SellerCouponsPage />} />
            <Route path="/seller/disputes"  element={<SellerDisputesPage />} />
          </Route>

          {/* Admin */}
          <Route element={<ProtectedRoute roles={['ADMIN']} />}>
            <Route path="/admin/dashboard"  element={<AdminDashboardPage />} />
            <Route path="/admin/orders"     element={<AdminOrdersPage />} />
            <Route path="/admin/users"      element={<AdminUserMgmtPage />} />
            <Route path="/admin/products"   element={<AdminProductsPage />} />
            <Route path="/admin/disputes"   element={<AdminDisputesPage />} />
            <Route path="/admin/categories" element={<AdminCategoriesPage />} />
            <Route path="/admin/sellers"    element={<AdminSellersPage />} />
          </Route>

        </Route>

        <Route path="/"  element={<Navigate to="/shop" replace />} />
        <Route path="*"  element={<Navigate to="/shop" replace />} />
      </Routes>
    </Suspense>
  );
}
