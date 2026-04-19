import {
  BrowserRouter,
  Navigate,
  NavLink,
  Outlet,
  Route,
  Routes,
} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { BookingsListPage } from './pages/BookingsListPage';
import { CreateBookingPage } from './pages/CreateBookingPage';

function AppLayout() {
  return (
    <div className="relative min-h-screen bg-linear-to-br from-slate-100 via-white to-indigo-50/60">
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.35]"
        aria-hidden
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.18),transparent)]" />
      </div>

      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 shadow-sm shadow-slate-900/5 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <NavLink
            to="/bookings"
            className="group flex items-center gap-2.5 text-lg font-semibold tracking-tight text-slate-900 transition hover:text-indigo-700"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white shadow-md shadow-indigo-500/25">
              H
            </span>
            <span className="bg-linear-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent group-hover:from-indigo-800 group-hover:to-violet-700">
              hospitality-platform
            </span>
          </NavLink>
          <nav
            className="flex w-full gap-1 rounded-2xl bg-slate-100/80 p-1 sm:w-auto"
            aria-label="Main"
          >
            <NavLink
              to="/bookings"
              className={({ isActive }) =>
                `flex-1 rounded-xl px-4 py-2.5 text-center text-sm font-medium transition sm:flex-none ${isActive ? 'bg-white text-indigo-700 shadow-sm shadow-slate-900/5 ring-1 ring-slate-200/80' : 'text-slate-600 hover:text-slate-900'}`
              }
              end
            >
              Bookings
            </NavLink>
            <NavLink
              to="/bookings/new"
              className={({ isActive }) =>
                `flex-1 rounded-xl px-4 py-2.5 text-center text-sm font-medium transition sm:flex-none ${isActive ? 'bg-white text-indigo-700 shadow-sm shadow-slate-900/5 ring-1 ring-slate-200/80' : 'text-slate-600 hover:text-slate-900'}`
              }
            >
              New booking
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          className:
            '!rounded-xl !border !border-slate-200/80 !bg-white/95 !text-slate-800 !shadow-lg !shadow-slate-900/10',
          success: {
            duration: 4000,
            className:
              '!rounded-xl !border !border-emerald-200/90 !bg-emerald-50/95 !text-emerald-950 !shadow-lg !shadow-emerald-900/10',
          },
          error: {
            duration: 5500,
            className:
              '!max-w-[min(100vw-2rem,24rem)] !rounded-xl !border !border-rose-200/90 !bg-rose-50/95 !py-3 !text-sm !leading-snug !text-rose-950 !shadow-lg !shadow-rose-900/10',
          },
        }}
      />
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/bookings" replace />} />
          <Route path="/bookings" element={<BookingsListPage />} />
          <Route path="/bookings/new" element={<CreateBookingPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
