
import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import Home from './components/Home';
import ProductCatalog from './components/ProductCatalog';
import ProductDetails from './components/ProductDetails';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import OrderHistory from './components/OrderHistory';

const API_URL = process.env.REACT_APP_API_URL;

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [selected, setSelected] = useState(null);
  const [view, setView] = useState('home');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchCart();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const res = await axios.get(`${API_URL}/products`);
    setProducts(res.data);
    setLoading(false);
  };

  const fetchCart = async () => {
    // For demo, cart is local state only
    setCart(JSON.parse(localStorage.getItem('cart') || '[]'));
  };

  const saveCart = (cart) => {
    setCart(cart);
    localStorage.setItem('cart', JSON.stringify(cart));
  };

  const addToCart = (id) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    const existing = cart.find(item => item.id === id);
    let newCart;
    if (existing) {
      newCart = cart.map(item => item.id === id ? { ...item, qty: item.qty + 1 } : item);
    } else {
      newCart = [...cart, { ...product, qty: 1 }];
    }
    saveCart(newCart);
  };

  const removeFromCart = (id) => {
    const newCart = cart.filter(item => item.id !== id);
    saveCart(newCart);
  };

  const updateQty = (id, qty) => {
    if (qty < 1) return;
    const newCart = cart.map(item => item.id === id ? { ...item, qty } : item);
    saveCart(newCart);
  };

  const placeOrder = () => {
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    setOrders([...orders, { items: cart, total }]);
    saveCart([]);
    setView('orders');
  };

  // Navigation handlers
  const goHome = () => setView('home');
  const goCatalog = () => setView('catalog');
  const goCart = () => setView('cart');
  const goCheckout = () => setView('checkout');
  const goOrders = () => setView('orders');

  // Product details
  const showDetails = (id) => {
    setSelected(products.find(p => p.id === id));
    setView('details');
  };

  // Featured products for home
  const featured = products.slice(0, 2);

  return (
    <div className="perfume-store">
      <header>
        <h1 onClick={goHome} style={{cursor:'pointer'}}>Perfume Palace</h1>
        <nav>
          <button onClick={goHome}>Home</button>
          <button onClick={goCatalog}>Catalog</button>
          <button onClick={goCart}>Cart ({cart.reduce((sum, i) => sum + i.qty, 0)})</button>
          <button onClick={goOrders}>Orders</button>
        </nav>
      </header>
      <main>
        {loading && <p>Loading...</p>}
        {view === 'home' && <Home featured={featured} onProductClick={showDetails} />}
        {view === 'catalog' && <ProductCatalog products={products} onProductClick={showDetails} onAddToCart={addToCart} />}
        {view === 'details' && selected && <ProductDetails product={selected} onAddToCart={addToCart} onBack={goCatalog} />}
        {view === 'cart' && <Cart cart={cart} onRemove={removeFromCart} onCheckout={goCheckout} onBack={goCatalog} onUpdateQty={updateQty} />}
        {view === 'checkout' && <Checkout onBack={goCart} onPlaceOrder={placeOrder} />}
        {view === 'orders' && <OrderHistory orders={orders} onBack={goHome} />}
      </main>
    </div>
  );
}

export default App;
