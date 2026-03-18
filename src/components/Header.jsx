import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Header() {
    const navigate = useNavigate();
    const { user, balance, cartCount, isAuthenticated, isAdmin, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="header">
            <Link to="/" className="header-logo">
                <img src="/icons/logo.svg" alt="TechStore" width="40" height="40" />
            </Link>
            <nav className="header-menu">
                <ul className="header-menu-list">
                    <li className="header-menu-item">
                        <Link to="/sell" className="header-menu-link">Продать</Link>
                    </li>
                    <li className="header-menu-item">
                        <Link to="/rent" className="header-menu-link">Арендовать</Link>
                    </li>
                    <li className="header-menu-item">
                        <Link to="/consultation" className="header-menu-link">Онлайн консультация</Link>
                    </li>
                    {isAuthenticated && (
                        <>
                            <li className="header-menu-item">
                                <Link to="/cart" className="header-menu-link" style={{ position: 'relative' }}>
                                    🛒 Корзина
                                    {cartCount > 0 && (
                                        <span style={{
                                            position: 'absolute',
                                            top: '-8px',
                                            right: '-12px',
                                            backgroundColor: 'var(--color-accent)',
                                            color: 'var(--color-dark)',
                                            fontSize: '10px',
                                            fontWeight: '700',
                                            padding: '2px 5px',
                                            borderRadius: '10px',
                                            minWidth: '18px',
                                            textAlign: 'center'
                                        }}>
                                            {cartCount}
                                        </span>
                                    )}
                                </Link>
                            </li>
                            <li className="header-menu-item">
                                <Link to="/wallet" className="header-menu-link">
                                    💰 ${balance?.toFixed(2) || '0.00'}
                                </Link>
                            </li>
                        </>
                    )}
                    {isAdmin && (
                        <li className="header-menu-item">
                            <Link to="/admin" className="header-menu-link" style={{ color: 'var(--color-accent)' }}>
                                👑 Админка
                            </Link>
                        </li>
                    )}
                </ul>
            </nav>
            <div className="header-action">
                {isAuthenticated ? (
                    <>
                        <Link to="/profile" style={{
                            color: user.role === 'admin' ? 'var(--color-accent)' : 'var(--color-white)',
                            fontSize: '0.9em',
                            marginRight: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            textDecoration: 'none'
                        }}>
                            {user.role === 'admin' && (
                                <span style={{ fontSize: '16px' }}>👑</span>
                            )}
                            <span style={{ fontSize: '16px' }}>👤</span>
                            {user.name}
                        </Link>
                        <button onClick={handleLogout} className="button-login">
                            Выйти
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="button-login">
                            Вход
                        </Link>
                        <Link to="/register" className="button-reg">
                            Регистрация
                        </Link>
                    </>
                )}
            </div>
        </header>
    );
}

export default Header;
