import { useEffect } from 'react';
import Lenis from 'lenis';
import { createBrowserRouter, RouterProvider, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ToastContainer from './components/common/ToastContainer';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Dashboard from './pages/Dashboard';
import NewTrip from './pages/NewTrip';
import TripDetail from './pages/TripDetail';
import ItineraryPage from './pages/Itinerary';
import HotelsPage from './pages/Hotels';
import BudgetPage from './pages/Budget';
import WeatherPage from './pages/Weather';
import PackingListPage from './pages/PackingList';
import ChatPage from './pages/Chat';
import SharedItinerary from './pages/SharedItinerary';
import About from './pages/About';
import NotFound from './pages/NotFound';

import ChatbotWidget from './components/chat/ChatbotWidget';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function RootLayout() {
  const initialize = useAuthStore(s => s.initialize);
  const isInitialized = useAuthStore(s => s.isInitialized);

  useEffect(() => {
    if (!isInitialized) initialize();
  }, [isInitialized, initialize]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] text-[#f5f0eb] selection:bg-[#c4a35a]/30 selection:text-white relative">
      <ScrollToTop />
      {/* Cinematic Overlays */}
      <div className="fixed inset-0 z-[9999] pointer-events-none opacity-[0.03] bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')]" />
      <div className="fixed inset-0 z-[9998] pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.4)_100%)]" />
      
      <div className="relative z-10 flex flex-col flex-1">
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
      {location.pathname === '/' && <ChatbotWidget />}
      <ToastContainer />
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Landing /> },
      { path: 'login', element: <Login /> },
      { path: 'signup', element: <Signup /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'new-trip', element: <NewTrip /> },
      {
        path: 'trip/:tripId',
        element: <TripDetail />,
        children: [
          { index: true, element: <ItineraryPage /> },
          { path: 'hotels', element: <HotelsPage /> },
          { path: 'budget', element: <BudgetPage /> },
          { path: 'weather', element: <WeatherPage /> },
          { path: 'packing', element: <PackingListPage /> },
          { path: 'chat', element: <ChatPage /> },
        ],
      },
      { path: 'share/:shareToken', element: <SharedItinerary /> },
      { path: 'about', element: <About /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

export default function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  return <RouterProvider router={router} />;
}
