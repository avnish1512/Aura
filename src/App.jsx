import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import BottomNavbar from './components/BottomNavbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import SearchPage from './pages/Search';
import Details from './pages/Details';
import Watchlist from './pages/Watchlist';
import Browse from './pages/Browse';
import Auth from './pages/Auth';
import Premium from './pages/Premium';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        style={{ flex: 1 }}
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/details/:type/:id" element={<Details />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/premium" element={<Premium />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function AppShell() {
  const location = useLocation();
  const showBottomNavbar = location.pathname !== '/';
  const shellClass = [
    'app-shell',
    location.pathname === '/' ? 'home-route' : '',
    location.pathname.startsWith('/details/') ? 'details-route' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={shellClass}>
      <Navbar />
      <AnimatedRoutes />
      {showBottomNavbar && <BottomNavbar />}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppShell />
      </AppProvider>
    </BrowserRouter>
  );
}
