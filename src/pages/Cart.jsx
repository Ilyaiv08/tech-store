import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cartAPI, ordersAPI } from '../api/client';
import Header from '../components/Header';
import Footer from '../components/Footer';

function Cart() {
    const navigate = useNavigate();
    const { user, balance, loadBalance, updateCartCount } = useAuth();
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        if (user) {
            loadCart();
        }
    }, [user]);

    const loadCart = async () => {
        try {
            setLoading(true);
            const data = await cartAPI.getCart();
            setItems(data.items || []);
            setTotal(data.total || 0);
            updateCartCount(data.count || 0);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateQuantity = async (productId, newQuantity) => {
        if (newQuantity < 1) return;

        try {
            const data = await cartAPI.updateQuantity(productId, newQuantity);
            setItems(data.items);
            setTotal(data.total);
            updateCartCount(data.count);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleRemove = async (productId) => {
        try {
            const data = await cartAPI.removeFromCart(productId);
            setItems(data.items);
            setTotal(data.total);
            updateCartCount(data.count);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleCheckout = async () => {
        if (total > balance) {
            setError(`Недостаточно средств. Нужно $${total.toFixed(2)}, у вас $${balance.toFixed(2)}`);
            return;
        }

        setCheckoutLoading(true);
        setError(null);

        try {
            const data = await ordersAPI.checkout();
            setSuccess(`Заказ успешно оформлен! Сумма: $${total.toFixed(2)}`);
            setItems([]);
            setTotal(0);
            updateCartCount(0);
            loadBalance();
            
            setTimeout(() => {
                navigate('/orders');
            }, 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setCheckoutLoading(false);
        }
    };

    if (!user) {
        return (
            <>
                <Header />
                <main style={{ minHeight: 'calc(100vh - 200px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="modal-content" style={{ margin: '40px auto', textAlign: 'center' }}>
                        <h2 className="modal-title">Корзина</h2>
                        <p style={{ color: 'var(--color-muted)', marginBottom: '20px' }}>
                            Для просмотра корзины необходимо войти
                        </p>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <button onClick={() => navigate('/login')} className="button-login">Войти</button>
                            <button onClick={() => navigate('/register')} className="button-reg">Регистрация</button>
                        </div>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <main style={{ minHeight: 'calc(100vh - 200px)', padding: '40px 0' }}>
                <div className="container">
                    <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '30px' }}>
                        🛒 Корзина
                    </h1>

                    {error && (
                        <div style={{
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid #ef4444',
                            borderRadius: '8px',
                            padding: '12px',
                            marginBottom: '16px',
                            color: '#ef4444'
                        }}>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div style={{
                            backgroundColor: 'rgba(34, 197, 94, 0.1)',
                            border: '1px solid #22c55e',
                            borderRadius: '8px',
                            padding: '12px',
                            marginBottom: '16px',
                            color: '#22c55e'
                        }}>
                            ✓ {success}
                        </div>
                    )}

                    {loading && (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-muted)' }}>
                            Загрузка...
                        </div>
                    )}

                    {!loading && items.length === 0 && (
                        <div style={{
                            textAlign: 'center',
                            padding: '60px 20px',
                            backgroundColor: 'var(--color-surface)',
                            borderRadius: 'var(--border-radius-lg)',
                            border: '1px solid var(--color-border)'
                        }}>
                            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🛒</div>
                            <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>Корзина пуста</h2>
                            <p style={{ color: 'var(--color-muted)', marginBottom: '20px' }}>
                                Добавьте товары из каталога
                            </p>
                            <button onClick={() => navigate('/')} className="button-reg">
                                Перейти в каталог
                            </button>
                        </div>
                    )}

                    {!loading && items.length > 0 && (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 350px',
                            gap: '20px'
                        }}>
                            {/* Список товаров */}
                            <div style={{
                                backgroundColor: 'var(--color-surface)',
                                borderRadius: 'var(--border-radius-lg)',
                                border: '1px solid var(--color-border)',
                                overflow: 'hidden'
                            }}>
                                <div style={{ padding: '20px', borderBottom: '1px solid var(--color-border)' }}>
                                    <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Товары ({items.length})</h2>
                                </div>

                                <div>
                                    {items.map((item) => (
                                        <div
                                            key={item.productId || item.product_id || item.id}
                                            style={{
                                                display: 'flex',
                                                gap: '15px',
                                                padding: '15px 20px',
                                                borderBottom: '1px solid var(--color-border)',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <img
                                                src={item.image ? 
                                                    (item.image.startsWith('/') ? `http://localhost:5000${item.image}` : item.image) 
                                                    : '/images/stylish-smartphone-dark-close-up_406939-2884.jpg'}
                                                alt={item.name}
                                                style={{
                                                    width: '80px',
                                                    height: '80px',
                                                    objectFit: 'cover',
                                                    borderRadius: '8px'
                                                }}
                                            />
                                            
                                            <div style={{ flex: 1 }}>
                                                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '5px' }}>
                                                    {item.name}
                                                </h3>
                                                <p style={{ fontSize: '14px', color: 'var(--color-accent)', fontWeight: '600' }}>
                                                    ${parseFloat(item.price).toFixed(2)}
                                                </p>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <button
                                                    onClick={() => handleUpdateQuantity(item.productId || item.product_id, item.quantity - 1)}
                                                    style={{
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '6px',
                                                        border: '1px solid var(--color-border)',
                                                        backgroundColor: 'var(--color-bg)',
                                                        color: 'var(--color-white)',
                                                        cursor: 'pointer',
                                                        fontSize: '18px'
                                                    }}
                                                >
                                                    −
                                                </button>
                                                <span style={{
                                                    fontSize: '16px',
                                                    fontWeight: '600',
                                                    minWidth: '30px',
                                                    textAlign: 'center'
                                                }}>
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => handleUpdateQuantity(item.productId || item.product_id, item.quantity + 1)}
                                                    style={{
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '6px',
                                                        border: '1px solid var(--color-border)',
                                                        backgroundColor: 'var(--color-bg)',
                                                        color: 'var(--color-white)',
                                                        cursor: 'pointer',
                                                        fontSize: '18px'
                                                    }}
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <div style={{ textAlign: 'right', minWidth: '100px' }}>
                                                <p style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-white)' }}>
                                                    ${item.subtotal.toFixed(2)}
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => handleRemove(item.productId || item.product_id)}
                                                style={{
                                                    padding: '8px 12px',
                                                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                                    color: '#ef4444',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontWeight: '600',
                                                    fontSize: '13px'
                                                }}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Итого */}
                            <div style={{
                                backgroundColor: 'var(--color-surface)',
                                borderRadius: 'var(--border-radius-lg)',
                                border: '1px solid var(--color-border)',
                                padding: '20px',
                                height: 'fit-content'
                            }}>
                                <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                                    Итого
                                </h2>

                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    marginBottom: '10px',
                                    paddingBottom: '10px',
                                    borderBottom: '1px solid var(--color-border)'
                                }}>
                                    <span style={{ color: 'var(--color-muted)' }}>Товары ({items.length})</span>
                                    <span style={{ fontWeight: '600' }}>${total.toFixed(2)}</span>
                                </div>

                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    marginBottom: '20px',
                                    fontSize: '18px',
                                    fontWeight: '700'
                                }}>
                                    <span>К оплате:</span>
                                    <span style={{ color: 'var(--color-accent)' }}>${total.toFixed(2)}</span>
                                </div>

                                <div style={{
                                    backgroundColor: 'var(--color-bg)',
                                    padding: '15px',
                                    borderRadius: '8px',
                                    marginBottom: '20px'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                        <span style={{ color: 'var(--color-muted)', fontSize: '14px' }}>Ваш баланс:</span>
                                        <span style={{ fontWeight: '600' }}>${balance?.toFixed(2) || '0.00'}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--color-muted)', fontSize: '14px' }}>После покупки:</span>
                                        <span style={{ 
                                            fontWeight: '600', 
                                            color: (balance - total) < 0 ? '#ef4444' : 'var(--color-white)'
                                        }}>
                                            ${(balance - total).toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    disabled={checkoutLoading || total > balance}
                                    className="button-reg"
                                    style={{ 
                                        width: '100%', 
                                        opacity: checkoutLoading || total > balance ? 0.5 : 1,
                                        cursor: checkoutLoading || total > balance ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {checkoutLoading ? 'Обработка...' : total > balance ? 'Недостаточно средств' : 'Оформить заказ'}
                                </button>

                                {total > balance && (
                                    <button
                                        onClick={() => navigate('/wallet')}
                                        className="button-login"
                                        style={{ width: '100%', marginTop: '10px' }}
                                    >
                                        Пополнить баланс
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}

export default Cart;
