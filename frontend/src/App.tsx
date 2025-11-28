import { BrowserRouter, Route, Routes } from 'react-router';
import HomePage from './pages/HomePage';
import SignUpPage from './pages/SignUpPage';
import SignInPage from './pages/SignInPage';
import DashBoardPage from './pages/admin/dashboard/DashBoardPage';
import { Toaster } from 'sonner';

function App() {
  return (
    <>
      <Toaster richColors />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/admin" element={<DashBoardPage />} />
          <Route path="/" element={<HomePage />} />

          {/* Protected routes */}
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;