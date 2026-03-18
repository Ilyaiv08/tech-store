import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import './styles/main.css';
import Home from './pages/Home';
import Sell from './pages/Sell';
import Rent from './pages/Rent';
import Consultation from './pages/Consultation';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminPanel from './pages/AdminPanel';
import Wallet from './pages/Wallet';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Profile from './pages/Profile';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/sell" element={<Sell />} />
                    <Route path="/rent" element={<Rent />} />
                    <Route path="/consultation" element={<Consultation />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/admin" element={<AdminPanel />} />
                    <Route path="/wallet" element={<Wallet />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/profile" element={<Profile />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
