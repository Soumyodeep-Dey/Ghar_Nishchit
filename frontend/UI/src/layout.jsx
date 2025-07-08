// Layout.jsx
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import { Outlet } from 'react-router-dom';
import { ThemeProvider } from './components/contexts/theme';

function Layout() {
  return (
    <ThemeProvider>
      <Header />
      <Outlet />
      <Footer />
    </ThemeProvider>
  );
}

export default Layout;
