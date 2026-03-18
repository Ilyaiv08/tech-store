import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

function Rent() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [rentProducts, setRentProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [daysCount, setDaysCount] = useState(1);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        loadRentProducts();
    }, []);

    const loadRentProducts = async () => {
        try {
            setLoading(true);
            const data = await productsAPI.getAll();
            const rentItems = (data.products || []).filter(p => p.status === 'rent');
            setRentProducts(rentItems);
        } catch (error) {
            console.error('Ошибка загрузки товаров:', error);
        } finally {
            setLoading(false);
        }
    };

    const openRentModal = (product) => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: '/rent' } });
            return;
        }
        setSelectedProduct(product);
        setDaysCount(1);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedProduct(null);
    };

    const formatSpecs = (product) => {
        const specs = [];
        if (product.specs) {
            try {
                const parsedSpecs = typeof product.specs === 'string' 
                    ? JSON.parse(product.specs) : product.specs;
                if (parsedSpecs) {
                    Object.entries(parsedSpecs).slice(0, 2).forEach(([key, value]) => {
                        if (value) {
                            const label = key === 'ram' ? 'ОЗУ' : key === 'storage' ? 'Память' :
                                         key === 'display' ? 'Экран' : key === 'processor' ? 'Процессор' :
                                         key === 'camera' ? 'Камера' : key === 'battery' ? 'Батарея' :
                                         key === 'graphics' ? 'Видеокарта' : key === 'resolution' ? 'Разрешение' :
                                         key === 'refreshRate' ? 'Частота' : key === 'panelType' ? 'Матрица' :
                                         key === 'megapixels' ? 'МП' : key === 'sensor' ? 'Матрица' :
                                         key === 'driver' ? 'Динамики' : key === 'type' ? 'Тип' : key;
                            specs.push(`${label}: ${value}`);
                        }
                    });
                }
            } catch (e) {}
        }
        return specs.length > 0 ? specs : ['Характеристика 1', 'Характеристика 2'];
    };

    return (
        <>
            <Header />
            <main className="container" style={{ padding: '40px 15px' }}>
                <section className="popular-house">
                    <h1 className="popular-title">🎯 Аренда техники</h1>
                    
                    {loading && (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-muted)' }}>
                            Загрузка товаров...
                        </div>
                    )}
                    
                    {!loading && rentProducts.length === 0 && (
                        <div style={{
                            textAlign: 'center',
                            padding: '60px 20px',
                            backgroundColor: 'var(--color-surface)',
                            borderRadius: 'var(--border-radius-lg)',
                            border: '1px solid var(--color-border)'
                        }}>
                            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎯</div>
                            <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>Товаров для аренды пока нет</h2>
                            <p style={{ color: 'var(--color-muted)', marginBottom: '20px' }}>
                                Администратор ещё не добавил товары для аренды
                            </p>
                        </div>
                    )}
                    
                    {!loading && rentProducts.length > 0 && (
                        <div className="house-content">
                            {rentProducts.map((product) => (
                                <div key={product.id}>
                                    <HouseCard
                                        image={product.image ? 
                                            (product.image.startsWith('/') ? `http://localhost:5000${product.image}` : product.image) 
                                            : '/images/stylish-smartphone-dark-close-up_406939-2884.jpg'}
                                        title={product.name}
                                        price={`${product.price}$/день`}
                                        status="В наличии"
                                        specs={formatSpecs(product)}
                                        onRentClick={() => openRentModal(product)}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Информация об аренде */}
                <section style={{
                    marginTop: '60px',
                    backgroundColor: 'var(--color-surface)',
                    borderRadius: 'var(--border-radius-lg)',
                    padding: '30px',
                    border: '1px solid var(--color-border)'
                }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '20px' }}>📋 Условия аренды</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                        <InfoCard icon="📄" title="Договор аренды" text="Оформление договора на весь срок использования" />
                        <InfoCard icon="💰" title="Залог 50%" text="Возвратный залог за оборудование" />
                        <InfoCard icon="📅" title="Срок аренды" text="От 1 дня до 3 месяцев" />
                        <InfoCard icon="🔄" title="Продление" text="Возможность продления аренды" />
                        <InfoCard icon="✅" title="Возврат залога" text="При своевременном возврате" />
                        <InfoCard icon="📞" title="Поддержка 24/7" text="Техническая поддержка" />
                    </div>
                </section>
            </main>
            <Footer />

            {/* Модальное окно аренды */}
            {showModal && selectedProduct && (
                <RentalModal
                    product={selectedProduct}
                    daysCount={daysCount}
                    setDaysCount={setDaysCount}
                    onClose={closeModal}
                />
            )}
        </>
    );
}

function HouseCard({ image, title, price, status, specs, onRentClick }) {
    return (
        <div className="card-house" style={{ paddingBottom: '70px', position: 'relative' }}>
            <img src={image} alt={title} className="card-house-images" />
            <h2 className="card-house-title">{title}</h2>
            <div className="house-price-status">
                <p className="house-price">{price}</p>
                <span className="house-status">{status}</span>
            </div>
            <div className="house-info">
                {specs.map((spec, index) => (<p key={index}>{spec}</p>))}
            </div>
            <button
                onClick={onRentClick}
                style={{
                    position: 'absolute',
                    bottom: '15px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '80%',
                    padding: '10px',
                    backgroundColor: 'var(--color-accent)',
                    color: 'var(--color-dark)',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '14px'
                }}
            >
                Арендовать
            </button>
        </div>
    );
}

function InfoCard({ icon, title, text }) {
    return (
        <div style={{
            backgroundColor: 'var(--color-bg)',
            padding: '20px',
            borderRadius: 'var(--border-radius)',
            textAlign: 'center'
        }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>{icon}</div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '10px' }}>{title}</h3>
            <p style={{ fontSize: '14px', color: 'var(--color-muted)' }}>{text}</p>
        </div>
    );
}

function RentalModal({ product, daysCount, setDaysCount, onClose }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(() => {
        const date = new Date();
        date.setDate(date.getDate() + 1);
        return date.toISOString().split('T')[0];
    });

    // Обновляем daysCount при изменении дат
    useEffect(() => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        if (diffDays > 0) {
            setDaysCount(diffDays);
        }
    }, [startDate, endDate, setDaysCount]);

    const pricePerDay = parseFloat(product.price);
    const rentalCost = pricePerDay * daysCount;
    const deposit = rentalCost * 0.5;
    const total = rentalCost + deposit;

    const handleRent = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:5000/api/rentals', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    productId: product.id,
                    daysCount: parseInt(daysCount)
                })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            
            setSuccess('Аренда успешно оформлена!');
            setTimeout(() => {
                onClose();
                navigate('/profile');
            }, 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Минимальная дата - сегодня
    const today = new Date().toISOString().split('T')[0];
    
    // Максимальная дата - 90 дней от сегодня
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 90);
    const maxDateStr = maxDate.toISOString().split('T')[0];

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '550px' }}>
                <button className="modal-close" onClick={onClose}>&times;</button>
                <h2 className="modal-title">🎯 Аренда товара</h2>
                
                <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                    <img
                        src={product.image ? 
                            (product.image.startsWith('/') ? `http://localhost:5000${product.image}` : product.image) 
                            : '/images/stylish-smartphone-dark-close-up_406939-2884.jpg'}
                        alt={product.name}
                        style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                    <div>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '5px' }}>{product.name}</h3>
                        <p style={{ color: 'var(--color-accent)', fontWeight: '700' }}>{pricePerDay}$/день</p>
                    </div>
                </div>

                {error && (
                    <div style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid #ef4444',
                        borderRadius: '8px',
                        padding: '12px',
                        marginBottom: '16px',
                        color: '#ef4444'
                    }}>{error}</div>
                )}

                {success && (
                    <div style={{
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        border: '1px solid #22c55e',
                        borderRadius: '8px',
                        padding: '12px',
                        marginBottom: '16px',
                        color: '#22c55e'
                    }}>✓ {success}</div>
                )}

                {/* Календарь выбора дат */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600' }}>
                        📅 Выберите даты аренды:
                    </label>
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr', 
                        gap: '15px',
                        marginBottom: '10px'
                    }}>
                        <div>
                            <label style={{ 
                                display: 'block', 
                                fontSize: '13px', 
                                color: 'var(--color-muted)',
                                marginBottom: '5px'
                            }}>
                                📅 Начало аренды:
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                min={today}
                                max={maxDateStr}
                                onChange={(e) => {
                                    setStartDate(e.target.value);
                                    // Если новая start дата больше end, обновляем end
                                    if (new Date(e.target.value) > new Date(endDate)) {
                                        const newEnd = new Date(e.target.value);
                                        newEnd.setDate(newEnd.getDate() + 1);
                                        setEndDate(newEnd.toISOString().split('T')[0]);
                                    }
                                }}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    fontSize: '15px',
                                    border: '2px solid var(--color-border)',
                                    borderRadius: '8px',
                                    backgroundColor: 'var(--color-bg)',
                                    color: 'var(--color-white)',
                                    boxSizing: 'border-box',
                                    cursor: 'pointer'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ 
                                display: 'block', 
                                fontSize: '13px', 
                                color: 'var(--color-muted)',
                                marginBottom: '5px'
                            }}>
                                📅 Окончание аренды:
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                min={startDate}
                                max={maxDateStr}
                                onChange={(e) => setEndDate(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    fontSize: '15px',
                                    border: '2px solid var(--color-border)',
                                    borderRadius: '8px',
                                    backgroundColor: 'var(--color-bg)',
                                    color: 'var(--color-white)',
                                    boxSizing: 'border-box',
                                    cursor: 'pointer'
                                }}
                            />
                        </div>
                    </div>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px',
                        backgroundColor: 'var(--color-surface-alt)',
                        borderRadius: '8px'
                    }}>
                        <span style={{ color: 'var(--color-muted)', fontSize: '14px' }}>
                            ⏱️ Срок аренды:
                        </span>
                        <span style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-accent)' }}>
                            {daysCount} дн.
                        </span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '8px' }}>
                        Максимальный срок аренды: 90 дней
                    </p>
                </div>

                <div style={{
                    backgroundColor: 'var(--color-bg)',
                    padding: '15px',
                    borderRadius: '8px',
                    marginBottom: '20px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ color: 'var(--color-muted)' }}>Стоимость аренды:</span>
                        <span style={{ fontWeight: '600' }}>{rentalCost.toFixed(2)}$</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ color: 'var(--color-muted)' }}>Залог (50%):</span>
                        <span style={{ fontWeight: '600' }}>{deposit.toFixed(2)}$</span>
                    </div>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        paddingTop: '8px',
                        borderTop: '2px solid var(--color-border)',
                        fontSize: '18px',
                        fontWeight: '700'
                    }}>
                        <span>Итого:</span>
                        <span style={{ color: 'var(--color-accent)' }}>{total.toFixed(2)}$</span>
                    </div>
                </div>

                <button
                    onClick={handleRent}
                    disabled={loading}
                    className="button-reg"
                    style={{ width: '100%', opacity: loading ? 0.5 : 1 }}
                >
                    {loading ? 'Оформление...' : 'Оформить аренду'}
                </button>
            </div>
        </div>
    );
}

export default Rent;
