import { Outlet } from 'react-router-dom';
import Topbar from './Topbar';
import Sidebar from './Sidebar';

export default function AppLayout() {
  return (
    <div className="app">
      <Topbar />
      <Sidebar />
      <main className="main" style={{ gridColumn: 2, gridRow: 2, overflow: 'hidden', position: 'relative' }}>
        <div className="screen-d active page-enter" style={{ position: 'absolute', inset: 0, overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
