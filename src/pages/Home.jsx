import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsAPI, cartAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FeatureCard from './FeatureCard';
import InfoSection from '../components/InfoSection';
import ConferenceSection from './ConferenceSection';
import HouseCard from '../components/HouseCard';

function Home() {
    const navigate = useNavigate();
    const { isAuthenticated, loadCartCount } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cartLoading, setCartLoading] = useState({});

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const data = await productsAPI.getAll();
            setProducts(data.products || []);
        } catch (error) {
            console.error('Ошибка загрузки товаров:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = (productId, isRental = false) => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: isRental ? '/rent' : '/' } });
            return;
        }

        if (isRental) {
            window.location.href = '/rent';
            return;
        }

        setCartLoading(prev => ({ ...prev, [productId]: true }));
        cartAPI.addToCart(productId, 1)
            .then(() => {
                loadCartCount();
                alert('Товар добавлен в корзину!');
            })
            .catch((error) => {
                alert('Ошибка: ' + error.message);
            })
            .finally(() => {
                setCartLoading(prev => ({ ...prev, [productId]: false }));
            });
    };

    const features = [
        {
            icon: '/icons/service_11897525.png',
            title: 'Арендовать технику',
            text: 'Арендуй оборудование по низким ценам',
            buttonText: 'Арендовать',
            buttonClass: 'button-rent',
            onClick: () => navigate('/rent')
        },
        {
            icon: '/icons/website_4412392.png',
            title: 'Информация',
            text: 'Получи информацию о технике, которая тебя интересует',
            buttonText: 'Получить информацию',
            buttonClass: 'button-info',
            onClick: () => alert('Информация о технике будет доступна скоро!')
        },
        {
            icon: '/icons/ticket_10228562.png',
            title: 'Купить технику',
            text: 'Выбери технику своей мечты',
            buttonText: 'Купить технику',
            buttonClass: 'button-buy',
            onClick: () => navigate('/')
        }
    ];

    const formatSpecs = (product) => {
        const specs = [];
        
        if (product.specs) {
            try {
                const parsedSpecs = typeof product.specs === 'string' 
                    ? JSON.parse(product.specs) 
                    : product.specs;
                
                if (parsedSpecs) {
                    const specEntries = Object.entries(parsedSpecs).slice(0, 2);
                    specEntries.forEach(([key, value]) => {
                        if (value) {
                            const label = key === 'ram' ? 'ОЗУ' :
                                         key === 'storage' ? 'Память' :
                                         key === 'display' ? 'Экран' :
                                         key === 'processor' ? 'Процессор' :
                                         key === 'camera' ? 'Камера' :
                                         key === 'battery' ? 'Батарея' :
                                         key === 'graphics' ? 'Видеокарта' :
                                         key === 'resolution' ? 'Разрешение' :
                                         key === 'refreshRate' ? 'Частота' :
                                         key === 'panelType' ? 'Матрица' :
                                         key === 'megapixels' ? 'МП' :
                                         key === 'sensor' ? 'Матрица' :
                                         key === 'driver' ? 'Динамики' :
                                         key === 'type' ? 'Тип' :
                                         key;
                            specs.push(`${label}: ${value}`);
                        }
                    });
                }
            } catch (e) {}
        }
        
        if (specs.length === 0) {
            return ['Характеристика 1', 'Характеристика 2'];
        }
        
        return specs;
    };

    return (
        <>
            <Header />
            <main>
                <InfoSection />
                <ConferenceSection />

                <section className="card-container container">
                    <div className="card-content">
                        {features.map((feature, index) => (
                            <FeatureCard
                                key={index}
                                icon={feature.icon}
                                title={feature.title}
                                text={feature.text}
                                buttonText={feature.buttonText}
                                buttonClass={feature.buttonClass}
                                onClick={feature.onClick}
                            />
                        ))}
                    </div>
                </section>

                <section className="popular-house container">
                    <h2 className="popular-title">Популярная техника</h2>
                    
                    {loading && (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-muted)' }}>
                            Загрузка товаров...
                        </div>
                    )}
                    
                    {!loading && products.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-muted)' }}>
                            Товаров пока нет. Зайдите в админ-панель чтобы добавить первые товары!
                        </div>
                    )}
                    
                    {!loading && products.length > 0 && (
                        <div className="house-content">
                            {products.map((product) => {
                                const isRental = product.status === 'rent';
                                return (
                                    <HouseCard
                                        key={product.id}
                                        image={product.image ?
                                            (product.image.startsWith('/') ? `http://localhost:5000${product.image}` : product.image)
                                            : '/images/stylish-smartphone-dark-close-up_406939-2884.jpg'}
                                        title={product.name}
                                        price={`${product.price}$`}
                                        status={isRental ? 'Аренда' : product.status === 'new' ? 'Новое' : 'Б/У'}
                                        specs={formatSpecs(product)}
                                        onAddToCart={() => handleAddToCart(product.id, isRental)}
                                        isRentalButton={isRental}
                                    />
                                );
                            })}
                        </div>
                    )}
                </section>

                <Footer />
            </main>
        </>
    );
}

export default Home;
