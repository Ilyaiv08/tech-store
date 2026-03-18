import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

function Profile() {
    const navigate = useNavigate();
    const { user, isAuthenticated, balance, loadBalance } = useAuth();
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(null); // { type: 'return' | 'extend', rental }
    const [extendDays, setExtendDays] = useState(1);
    const [modalLoading, setModalLoading] = useState(false);
    const [modalError, setModalError] = useState(null);
    const [modalSuccess, setModalSuccess] = useState(null);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: '/profile' } });
            return;
        }
        loadRentals();
        loadBalance();
    }, [isAuthenticated]);

    const loadRentals = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5000/api/rentals', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            setRentals(data.rentals || []);
        } catch (error) {
            console.error('Failed to load rentals:', error);
        } finally {
            setLoading(false);
        }
    };

    const openReturnModal = (rental) => {
        setShowModal({ type: 'return', rental });
        setModalError(null);
        setModalSuccess(null);
    };

    const openExtendModal = (rental) => {
        setShowModal({ type: 'extend', rental });
        setExtendDays(1);
        setModalError(null);
        setModalSuccess(null);
    };

    const closeModal = () => {
        setShowModal(null);
        setModalLoading(false);
    };

    const handleReturn = async () => {
        setModalLoading(true);
        setModalError(null);
        try {
            const response = await fetch(`http://localhost:5000/api/rentals/${showModal.rental.id}/return`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            
            setModalSuccess(data.message);
            setTimeout(() => {
                closeModal();
                loadRentals();
                loadBalance();
            }, 2000);
        } catch (error) {
            setModalError(error.message);
            setModalLoading(false);
        }
    };

    const handleExtend = async () => {
        setModalLoading(true);
        setModalError(null);
        try {
            const response = await fetch(`http://localhost:5000/api/rentals/${showModal.rental.id}/extend`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ daysCount: parseInt(extendDays) })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            
            setModalSuccess(`Аренда продлена на ${extendDays} дн. (${data.extensionCost}$)`);
            setTimeout(() => {
                closeModal();
                loadRentals();
                loadBalance();
            }, 2000);
        } catch (error) {
            setModalError(error.message);
            setModalLoading(false);
        }
    };

    const getStatusBadge = (status, endDate) => {
        const now = new Date();
        const end = new Date(endDate);
        const isOverdue = now > end;

        const styles = {
            active: { bg: '#22c55e', color: '#fff' },
            completed: { bg: '#6b7280', color: '#fff' },
            overdue: { bg: '#ef4444', color: '#fff' },
            cancelled: { bg: '#6b7280', color: '#fff' }
        };

        const labels = {
            active: isOverdue ? '⚠️ Просрочено' : '✓ Активна',
            completed: '✓ Завершена',
            overdue: '⚠️ Просрочено',
            cancelled: '✕ Отменена'
        };

        const style = styles[status] || styles.active;
        return (
            <span style={{
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                backgroundColor: style.bg,
                color: style.color
            }}>
                {labels[status] || status}
            </span>
        );
    };

    if (!isAuthenticated) return null;

    return (
        <>
            <Header />
            <main style={{ minHeight: 'calc(100vh - 200px)', padding: '40px 0' }}>
                <div className="container">
                    {/* Профиль пользователя */}
                    <div style={{
                        backgroundColor: 'var(--color-surface)',
                        borderRadius: 'var(--border-radius-lg)',
                        padding: '30px',
                        border: '1px solid var(--color-border)',
                        marginBottom: '30px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                            <div>
                                <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '10px' }}>
                                    👤 {user?.name}
                                </h1>
                                <p style={{ color: 'var(--color-muted)', marginBottom: '5px' }}>{user?.email}</p>
                                <p style={{ fontSize: '14px', color: 'var(--color-muted)' }}>
                                    Роль: {user?.role === 'admin' ? '👑 Администратор' : '👤 Пользователь'}
                                </p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: '14px', color: 'var(--color-muted)', marginBottom: '5px' }}>Баланс</p>
                                <p style={{ fontSize: '32px', fontWeight: '700', color: 'var(--color-accent)' }}>
                                    ${balance?.toFixed(2) || '0.00'}
                                </p>
                                <button
                                    onClick={() => navigate('/wallet')}
                                    className="button-reg"
                                    style={{ marginTop: '10px' }}
                                >
                                    Пополнить
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Табы */}
                    <div style={{ marginBottom: '20px' }}>
                        <button
                            onClick={() => setActiveTab('rentals')}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: 'var(--color-accent)',
                                color: 'var(--color-dark)',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                marginRight: '10px'
                            }}
                        >
                            🎯 Мои аренды
                        </button>
                        <button
                            onClick={() => navigate('/orders')}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: 'var(--color-surface)',
                                color: 'var(--color-white)',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            📦 История покупок
                        </button>
                    </div>

                    {/* Аренды */}
                    {loading && (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-muted)' }}>
                            Загрузка...
                        </div>
                    )}

                    {!loading && rentals.length === 0 && (
                        <div style={{
                            textAlign: 'center',
                            padding: '60px 20px',
                            backgroundColor: 'var(--color-surface)',
                            borderRadius: 'var(--border-radius-lg)',
                            border: '1px solid var(--color-border)'
                        }}>
                            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎯</div>
                            <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>У вас нет активных аренд</h2>
                            <p style={{ color: 'var(--color-muted)', marginBottom: '20px' }}>
                                Арендуйте технику в нашем каталоге
                            </p>
                            <button onClick={() => navigate('/rent')} className="button-reg">
                                Перейти к аренде
                            </button>
                        </div>
                    )}

                    {!loading && rentals.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {rentals.map((rental) => (
                                <div
                                    key={rental.id}
                                    style={{
                                        backgroundColor: 'var(--color-surface)',
                                        borderRadius: 'var(--border-radius-lg)',
                                        border: '1px solid var(--color-border)',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <div style={{
                                        padding: '20px',
                                        display: 'flex',
                                        gap: '20px',
                                        alignItems: 'center',
                                        flexWrap: 'wrap'
                                    }}>
                                        <img
                                            src={rental.product?.image ? 
                                                (rental.product.image.startsWith('/') ? `http://localhost:5000${rental.product.image}` : rental.product.image) 
                                                : '/images/stylish-smartphone-dark-close-up_406939-2884.jpg'}
                                            alt={rental.product?.name}
                                            style={{
                                                width: '100px',
                                                height: '100px',
                                                objectFit: 'cover',
                                                borderRadius: '8px'
                                            }}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                                                {rental.product?.name}
                                            </h3>
                                            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '10px' }}>
                                                <span style={{ color: 'var(--color-muted)', fontSize: '14px' }}>
                                                    📅 {new Date(rental.startDate).toLocaleDateString('ru-RU')} — {new Date(rental.endDate).toLocaleDateString('ru-RU')}
                                                </span>
                                                <span style={{ color: 'var(--color-muted)', fontSize: '14px' }}>
                                                    ⏱️ {rental.daysCount} дн.
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                                                {getStatusBadge(rental.status, rental.endDate)}
                                                <span style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-accent)' }}>
                                                    {rental.pricePerDay}$/день
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right', minWidth: '150px' }}>
                                            <p style={{ fontSize: '12px', color: 'var(--color-muted)' }}>Оплачено</p>
                                            <p style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-white)' }}>
                                                {rental.totalPrice.toFixed(2)}$
                                            </p>
                                            <p style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
                                                Залог: {rental.deposit.toFixed(2)}$
                                            </p>
                                        </div>
                                    </div>

                                    {/* Действия */}
                                    {rental.status === 'active' && (
                                        <div style={{
                                            padding: '15px 20px',
                                            backgroundColor: 'var(--color-bg)',
                                            display: 'flex',
                                            gap: '10px',
                                            justifyContent: 'flex-end'
                                        }}>
                                            <button
                                                onClick={() => openExtendModal(rental)}
                                                style={{
                                                    padding: '8px 16px',
                                                    backgroundColor: '#3b82f6',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontWeight: '600'
                                                }}
                                            >
                                                🔄 Продлить
                                            </button>
                                            <button
                                                onClick={() => openReturnModal(rental)}
                                                style={{
                                                    padding: '8px 16px',
                                                    backgroundColor: '#22c55e',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontWeight: '600'
                                                }}
                                            >
                                                ✅ Вернуть
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <Footer />

            {/* Модальное окно подтверждения */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
                        <button className="modal-close" onClick={closeModal}>&times;</button>
                        
                        {showModal.type === 'return' && (
                            <>
                                <h2 className="modal-title">✅ Вернуть товар</h2>
                                <div style={{
                                    backgroundColor: 'var(--color-bg)',
                                    padding: '15px',
                                    borderRadius: '8px',
                                    marginBottom: '20px'
                                }}>
                                    <p style={{ fontSize: '16px', fontWeight: '600', marginBottom: '10px' }}>
                                        {showModal.rental.product?.name}
                                    </p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                        <span style={{ color: 'var(--color-muted)' }}>Срок аренды:</span>
                                        <span>{new Date(showModal.rental.startDate).toLocaleDateString('ru-RU')} — {new Date(showModal.rental.endDate).toLocaleDateString('ru-RU')}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--color-muted)' }}>Залог к возврату:</span>
                                        <span style={{ color: '#22c55e', fontWeight: '600' }}>{showModal.rental.deposit.toFixed(2)}$</span>
                                    </div>
                                </div>
                                <p style={{ color: 'var(--color-muted)', marginBottom: '20px', fontSize: '14px' }}>
                                    ⚠️ Залог будет возвращён только если товар возвращён вовремя
                                </p>
                                {modalError && (
                                    <div style={{
                                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                        border: '1px solid #ef4444',
                                        borderRadius: '8px',
                                        padding: '12px',
                                        marginBottom: '16px',
                                        color: '#ef4444'
                                    }}>{modalError}</div>
                                )}
                                {modalSuccess && (
                                    <div style={{
                                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                        border: '1px solid #22c55e',
                                        borderRadius: '8px',
                                        padding: '12px',
                                        marginBottom: '16px',
                                        color: '#22c55e'
                                    }}>✓ {modalSuccess}</div>
                                )}
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        onClick={closeModal}
                                        className="button-login"
                                        style={{ flex: 1 }}
                                        disabled={modalLoading}
                                    >
                                        Отмена
                                    </button>
                                    <button
                                        onClick={handleReturn}
                                        className="button-reg"
                                        style={{ flex: 1, backgroundColor: '#22c55e' }}
                                        disabled={modalLoading}
                                    >
                                        {modalLoading ? 'Обработка...' : 'Вернуть товар'}
                                    </button>
                                </div>
                            </>
                        )}

                        {showModal.type === 'extend' && (
                            <>
                                <h2 className="modal-title">🔄 Продлить аренду</h2>
                                <div style={{
                                    backgroundColor: 'var(--color-bg)',
                                    padding: '15px',
                                    borderRadius: '8px',
                                    marginBottom: '20px'
                                }}>
                                    <p style={{ fontSize: '16px', fontWeight: '600', marginBottom: '10px' }}>
                                        {showModal.rental.product?.name}
                                    </p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                        <span style={{ color: 'var(--color-muted)' }}>Текущий срок:</span>
                                        <span>{showModal.rental.daysCount} дн.</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--color-muted)' }}>Цена за день:</span>
                                        <span style={{ color: 'var(--color-accent)', fontWeight: '600' }}>{showModal.rental.pricePerDay}$</span>
                                    </div>
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                                        📅 На сколько дней продлить?
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="90"
                                        value={extendDays}
                                        onChange={(e) => setExtendDays(Math.max(1, Math.min(90, parseInt(e.target.value) || 1)))}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            fontSize: '16px',
                                            border: '2px solid var(--color-border)',
                                            borderRadius: '8px',
                                            backgroundColor: 'var(--color-bg)',
                                            color: 'var(--color-white)',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                    <div style={{
                                        marginTop: '10px',
                                        padding: '10px',
                                        backgroundColor: 'var(--color-surface-alt)',
                                        borderRadius: '8px',
                                        textAlign: 'center'
                                    }}>
                                        <span style={{ color: 'var(--color-muted)' }}>Стоимость продления: </span>
                                        <span style={{ color: 'var(--color-accent)', fontWeight: '700', fontSize: '18px' }}>
                                            {(showModal.rental.pricePerDay * extendDays).toFixed(2)}$
                                        </span>
                                    </div>
                                </div>
                                {modalError && (
                                    <div style={{
                                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                        border: '1px solid #ef4444',
                                        borderRadius: '8px',
                                        padding: '12px',
                                        marginBottom: '16px',
                                        color: '#ef4444'
                                    }}>{modalError}</div>
                                )}
                                {modalSuccess && (
                                    <div style={{
                                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                        border: '1px solid #22c55e',
                                        borderRadius: '8px',
                                        padding: '12px',
                                        marginBottom: '16px',
                                        color: '#22c55e'
                                    }}>✓ {modalSuccess}</div>
                                )}
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        onClick={closeModal}
                                        className="button-login"
                                        style={{ flex: 1 }}
                                        disabled={modalLoading}
                                    >
                                        Отмена
                                    </button>
                                    <button
                                        onClick={handleExtend}
                                        className="button-reg"
                                        style={{ flex: 1 }}
                                        disabled={modalLoading}
                                    >
                                        {modalLoading ? 'Обработка...' : 'Продлить'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

export default Profile;
