import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Account = lazy(() => import('./pages/Account'));
const Contact = lazy(() => import('./pages/Contact'));
const About = lazy(() => import('./pages/About'));
const SizeGuide = lazy(() => import('./pages/SizeGuide'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));

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
const AdminMediaLibrary = lazy(() => import('./pages/admin/MediaLibrary'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));
const AdminContentManager = lazy(() => import('./pages/admin/ContentManager'));
const AdminDocuments = lazy(() => import('./pages/admin/Documents'));
const DocumentForm = lazy(() => import('./pages/admin/DocumentForm'));
const DocumentView = lazy(() => import('./pages/admin/DocumentView'));
const DocumentPrint = lazy(() => import('./pages/admin/DocumentPrint'));

const adminShell = (element) => (
  <ProtectedRoute adminOnly>
    <AdminLayout>{element}</AdminLayout>
  </ProtectedRoute>
);

const editorShell = (element) => (
  <ProtectedRoute editorOrAdmin>
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
          <Route path="/" element={withSuspense(<Home />)} />
          <Route path="/shop" element={withSuspense(<Shop />)} />
          <Route path="/product/:slug" element={withSuspense(<ProductDetail />)} />
          <Route path="/cart" element={withSuspense(<Cart />)} />
          <Route path="/checkout" element={withSuspense(<Checkout />)} />
          <Route path="/login" element={withSuspense(<Login />)} />
          <Route path="/register" element={withSuspense(<Register />)} />
          <Route path="/account" element={withSuspense(<Account />)} />
          <Route path="/account/orders" element={withSuspense(<Account />)} />
          <Route path="/contact" element={withSuspense(<Contact />)} />
          <Route path="/about" element={withSuspense(<About />)} />
          <Route path="/size-guide" element={withSuspense(<SizeGuide />)} />
          <Route path="/order-success" element={withSuspense(<OrderSuccess />)} />
          <Route path="/blog" element={withSuspense(<Blog />)} />
          <Route path="/blog/:slug" element={withSuspense(<BlogPost />)} />

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
          <Route path="/admin/media" element={editorShell(withSuspense(<AdminMediaLibrary />))} />
          <Route path="/admin/content" element={editorShell(withSuspense(<AdminContentManager />))} />
          <Route path="/admin/settings" element={adminShell(withSuspense(<AdminSettings />))} />
          <Route path="/admin/documents" element={adminShell(withSuspense(<AdminDocuments />))} />
          <Route path="/admin/documents/new" element={adminShell(withSuspense(<DocumentForm />))} />
          <Route path="/admin/documents/:id/edit" element={adminShell(withSuspense(<DocumentForm />))} />
          <Route path="/admin/documents/:id" element={adminShell(withSuspense(<DocumentView />))} />
          <Route
            path="/admin/documents/:id/print"
            element={
              <ProtectedRoute adminOnly>
                {withSuspense(<DocumentPrint />)}
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}