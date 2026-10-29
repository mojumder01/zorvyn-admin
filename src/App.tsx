import { Toaster } from './components/ui/Toast';
import { useSignedIn } from './lib/auth';
import { matchPath, usePath } from './lib/router';
import { CustomerDetail } from './pages/CustomerDetail';
import { Customers } from './pages/Customers';
import { Dashboard } from './pages/Dashboard';
import { Inventory } from './pages/Inventory';
import { Login } from './pages/Login';
import { NotFound } from './pages/NotFound';
import { OrderDetail } from './pages/OrderDetail';
import { Orders } from './pages/Orders';
import { Products } from './pages/Products';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';

function Page() {
  const path = usePath();
  let params: Record<string, string> | null;
  if (path === '/') return <Dashboard />;
  if (path === '/orders') return <Orders />;
  if ((params = matchPath('/orders/:id', path))) return <OrderDetail id={params.id} />;
  if (path === '/products') return <Products />;
  if (path === '/inventory') return <Inventory />;
  if (path === '/customers') return <Customers />;
  if ((params = matchPath('/customers/:id', path))) return <CustomerDetail id={params.id} />;
  if (path === '/reports') return <Reports />;
  if (path === '/settings') return <Settings />;
  return <NotFound />;
}

export function App() {
  const signedIn = useSignedIn();
  return (
    <>
      {signedIn ? <Page /> : <Login />}
      <Toaster />
    </>
  );
}
