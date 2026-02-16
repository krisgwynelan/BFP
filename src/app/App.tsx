import { BrowserRouter, Routes, Route } from 'react-router';
import { Toaster } from 'sonner';

// User Pages
import { HomePage } from '../user/pages/HomePage';
import { AboutPage } from '../user/pages/AboutPage';
import { OfficersPage } from '../user/pages/OfficersPage';
import { ContactPage } from '../user/pages/ContactPage';

// Admin Pages
import { AdminLogin } from '../admin/pages/AdminLogin';
import { AdminDashboard } from '../admin/pages/AdminDashboard';

// User Components
import { Header } from '../user/components/Header';
import { Footer } from '../user/components/Footer';

function UserLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        {/* User/Public Routes */}
        <Route
          path="/"
          element={
            <UserLayout>
              <HomePage />
            </UserLayout>
          }
        />
        <Route
          path="/about"
          element={
            <UserLayout>
              <AboutPage />
            </UserLayout>
          }
        />
        <Route
          path="/officers"
          element={
            <UserLayout>
              <OfficersPage />
            </UserLayout>
          }
        />
        <Route
          path="/contact"
          element={
            <UserLayout>
              <ContactPage />
            </UserLayout>
          }
        />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}