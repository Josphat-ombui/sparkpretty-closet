import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
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
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import ProductForm from './pages/admin/ProductForm';
import AdminOrders from './pages/admin/Orders';
import AdminBlog from './pages/admin/BlogList';
import BlogForm from './pages/admin/BlogForm';

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
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/products/new" element={<ProductForm />} />
          <Route path="/admin/products/:id/edit" element={<ProductForm />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/blog" element={<AdminBlog />} />
          <Route path="/admin/blog/new" element={<BlogForm />} />
          <Route path="/admin/blog/:id/edit" element={<BlogForm />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
