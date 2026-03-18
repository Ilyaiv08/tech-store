import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../api/client';
import Header from '../components/Header';
import Footer from '../components/Footer';

function Orders() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);

    useEffect(() => {
        if (user) {
            loadOrders();
        }
    }, [user]);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const data = await ordersAPI.getOrders();
            setOrders(data.orders || []);
        } catch (error) {
            console.error('Failed to load orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleOrder = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    if (!user) {
        return (
            <>
                <Header />
                <main style={{ minHeight: 'calc(100vh - 200px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="modal-content" style={{ margin: '40px auto', textAlign: 'center' }}>
                        <h2 className="modal-title">История заказов</h2>
                        <p style={{ color: 'var(--color-muted)', marginBottom: '20px' }}>
                            Для просмотра истории необходимо войти
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
                        📦 История покупок
                    </h1>

                    {loading && (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-muted)' }}>
                            Загрузка...
                        </div>
                    )}

                    {!loading && orders.length === 0 && (
                        <div style={{
                            textAlign: 'center',
                            padding: '60px 20px',
                            backgroundColor: 'var(--color-surface)',
                            borderRadius: 'var(--border-radius-lg)',
                            border: '1px solid var(--color-border)'
                        }}>
                            <div style={{ fontSize: '64px', marginBottom: '20px' }}>📦</div>
                            <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>Покупок пока нет</h2>
                            <p style={{ color: 'var(--color-muted)', marginBottom: '20px' }}>
                                Совершите первую покупку в нашем магазине
                            </p>
                            <button onClick={() => navigate('/')} className="button-reg">
                                Перейти в каталог
                            </button>
                        </div>
                    )}

                    {!loading && orders.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {orders.map((order) => (
                                <div
                                    key={order.id}
                                    style={{
                                        backgroundColor: 'var(--color-surface)',
                                        borderRadius: 'var(--border-radius-lg)',
                                        border: '1px solid var(--color-border)',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {/* Заголовок заказа */}
                                    <div
                                        onClick={() => toggleOrder(order.id)}
                                        style={{
                                            padding: '20px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            cursor: 'pointer',
                                            backgroundColor: expandedOrder === order.id ? 'var(--color-surface-alt)' : 'transparent'
                                        }}
                                    >
                                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                            <div>
                                                <p style={{ fontSize: '12px', color: 'var(--color-muted)', marginBottom: '5px' }}>
                                                    Заказ #{order.id}
                                                </p>
                                                <p style={{ fontSize: '14px', color: 'var(--color-muted)' }}>
                                                    {new Date(order.created_at).toLocaleString('ru-RU')}
                                                </p>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                            <div style={{ textAlign: 'right' }}>
                                                <p style={{ fontSize: '12px', color: 'var(--color-muted)' }}>Сумма</p>
                                                <p style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-accent)' }}>
                                                    ${(order.totalAmount || order.total_amount || 0).toFixed(2)}
                                                </p>
                                            </div>
                                            <div style={{
                                                padding: '6px 12px',
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                backgroundColor: '#22c55e',
                                                color: '#fff'
                                            }}>
                                                {order.status === 'completed' ? '✓ Выполнен' : order.status}
                                            </div>
                                            <span style={{ fontSize: '20px', color: 'var(--color-muted)' }}>
                                                {expandedOrder === order.id ? '▼' : '▶'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Детали заказа */}
                                    {expandedOrder === order.id && (
                                        <div style={{
                                            padding: '20px',
                                            borderTop: '1px solid var(--color-border)'
                                        }}>
                                            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px' }}>
                                                Товары в заказе:
                                            </h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                {order.items.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        style={{
                                                            display: 'flex',
                                                            gap: '15px',
                                                            alignItems: 'center',
                                                            padding: '12px',
                                                            backgroundColor: 'var(--color-bg)',
                                                            borderRadius: '8px'
                                                        }}
                                                    >
                                                        <img
                                                            src={item.image ? 
                                                                (item.image.startsWith('/') ? `http://localhost:5000${item.image}` : item.image) 
                                                                : '/images/stylish-smartphone-dark-close-up_406939-2884.jpg'}
                                                            alt={item.product_name}
                                                            style={{
                                                                width: '60px',
                                                                height: '60px',
                                                                objectFit: 'cover',
                                                                borderRadius: '8px'
                                                            }}
                                                        />
                                                        <div style={{ flex: 1 }}>
                                                            <p style={{ fontWeight: '600', marginBottom: '5px' }}>
                                                                {item.product_name}
                                                            </p>
                                                            <p style={{ fontSize: '13px', color: 'var(--color-muted)' }}>
                                                                ${(item.productPrice || item.product_price || 0).toFixed(2)} × {item.quantity} шт.
                                                            </p>
                                                        </div>
                                                        <p style={{ fontWeight: '700', color: 'var(--color-accent)' }}>
                                                            ${(item.subtotal || 0).toFixed(2)}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>

                                            <div style={{
                                                marginTop: '20px',
                                                paddingTop: '15px',
                                                borderTop: '2px solid var(--color-border)',
                                                display: 'flex',
                                                justifyContent: 'flex-end'
                                            }}>
                                                <div style={{ textAlign: 'right' }}>
                                                    <p style={{ fontSize: '14px', color: 'var(--color-muted)', marginBottom: '5px' }}>
                                                        Итого оплачено:
                                                    </p>
                                                    <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--color-accent)' }}>
                                                        ${(order.totalAmount || order.total_amount || 0).toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}

export default Orders;
