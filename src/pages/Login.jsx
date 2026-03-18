import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const from = location.state?.from || '/';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = 'Email обязателен';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Некорректный email';
        }

        if (!formData.password) {
            newErrors.password = 'Пароль обязателен';
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validate();

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);
        try {
            await login(formData.email, formData.password);
            navigate(from, { replace: true });
        } catch (error) {
            setErrors({ submit: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Header />
            <main style={{ minHeight: 'calc(100vh - 200px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="modal-content" style={{ margin: '40px auto' }}>
                    <h2 className="modal-title">Вход</h2>

                    {errors.submit && (
                        <div style={{
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid #ef4444',
                            borderRadius: '8px',
                            padding: '12px',
                            marginBottom: '16px',
                            color: '#ef4444'
                        }}>
                            {errors.submit}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="modal-form">
                        <div>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={isLoading}
                            />
                            {errors.email && (
                                <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 4px' }}>{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <input
                                type="password"
                                name="password"
                                placeholder="Пароль"
                                value={formData.password}
                                onChange={handleChange}
                                disabled={isLoading}
                            />
                            {errors.password && (
                                <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 4px' }}>{errors.password}</p>
                            )}
                        </div>

                        <button type="submit" disabled={isLoading}>
                            {isLoading ? 'Вход...' : 'Войти'}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--color-muted)' }}>
                        Нет аккаунта?{' '}
                        <Link to="/register" style={{ color: 'var(--color-accent)' }}>Зарегистрироваться</Link>
                    </p>
                </div>
            </main>
            <Footer />
        </>
    );
}

export default Login;
