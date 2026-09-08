import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Account from './pages/Account';
import Contact from './pages/Contact';
import About from './pages/About';
import SizeGuide from './pages/SizeGuide';
import OrderSuccess from './pages/OrderSuccess';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';

const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminProducts = lazy(() => import('./pages/admin/Products'));
const ProductForm = lazy(() => import('./pages/admin/ProductForm'));
const AdminOrders = lazy(() => import('./pages/admin/Orders'));
const AdminBlog = lazy(() => import('./pages/admin/BlogList'));
const BlogForm = lazy(() => import('./pages/admin/BlogForm'));
const AdminCategories = lazy(() => import('./pages/admin/Categories'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const AdminSubscribers = lazy(() => import('./pages/admin/Subscribers'));
const AdminContacts = lazy(() => import('./pages/admin/Contacts'));
const AdminBanners = lazy(() => import('./pages/admin/Banners'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));

const adminShell = (element) => (
  <ProtectedRoute adminOnly>
    <AdminLayout>{element}</AdminLayout>
  </ProtectedRoute>
);

const withSuspense = (node) => (
  <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" /></div>}>
    {node}
  </Suspense>
);

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:bg-secondary focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:m-4">
        Skip to main content
      </a>
      <Header />
      <CartDrawer />
      <Toaster position="top-center" toastOptions={{ duration: 3000, style: { borderRadius: '12px', padding: '16px', fontFamily: 'Inter, sans-serif' } }} />
      <main id="main-content" className="flex-1" role="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/account" element={<Account />} />
          <Route path="/account/orders" element={<Account />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/size-guide" element={<SizeGuide />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />

          <Route path="/admin" element={adminShell(withSuspense(<AdminDashboard />))} />
          <Route path="/admin/products" element={adminShell(withSuspense(<AdminProducts />))} />
          <Route path="/admin/products/new" element={adminShell(withSuspense(<ProductForm />))} />
          <Route path="/admin/products/:id/edit" element={adminShell(withSuspense(<ProductForm />))} />
          <Route path="/admin/categories" element={adminShell(withSuspense(<AdminCategories />))} />
          <Route path="/admin/orders" element={adminShell(withSuspense(<AdminOrders />))} />
          <Route path="/admin/blog" element={adminShell(withSuspense(<AdminBlog />))} />
          <Route path="/admin/blog/new" element={adminShell(withSuspense(<BlogForm />))} />
          <Route path="/admin/blog/:id/edit" element={adminShell(withSuspense(<BlogForm />))} />
          <Route path="/admin/subscribers" element={adminShell(withSuspense(<AdminSubscribers />))} />
          <Route path="/admin/contacts" element={adminShell(withSuspense(<AdminContacts />))} />
          <Route path="/admin/users" element={adminShell(withSuspense(<AdminUsers />))} />
          <Route path="/admin/banners" element={adminShell(withSuspense(<AdminBanners />))} />
          <Route path="/admin/settings" element={adminShell(withSuspense(<AdminSettings />))} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}