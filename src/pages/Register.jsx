import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

function Register() {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Очищаем ошибку при вводе
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Имя обязательно';
        } else if (formData.name.length < 2) {
            newErrors.name = 'Имя должно быть не менее 2 символов';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email обязателен';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Некорректный email';
        }

        if (!formData.password) {
            newErrors.password = 'Пароль обязателен';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Пароль должен быть не менее 6 символов';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Пароли не совпадают';
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
            await register(formData.name, formData.email, formData.password);
            navigate('/');
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
                    <h2 className="modal-title">Регистрация</h2>

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
                                type="text"
                                name="name"
                                placeholder="Имя"
                                value={formData.name}
                                onChange={handleChange}
                                disabled={isLoading}
                            />
                            {errors.name && (
                                <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 4px' }}>{errors.name}</p>
                            )}
                        </div>

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

                        <div>
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Подтвердите пароль"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                disabled={isLoading}
                            />
                            {errors.confirmPassword && (
                                <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 4px' }}>{errors.confirmPassword}</p>
                            )}
                        </div>

                        <button type="submit" disabled={isLoading}>
                            {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--color-muted)' }}>
                        Уже есть аккаунт?{' '}
                        <Link to="/login" style={{ color: 'var(--color-accent)' }}>Войти</Link>
                    </p>
                </div>
            </main>
            <Footer />
        </>
    );
}

export default Register;
