import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { productsAPI } from '../api/client';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Категории товаров
const CATEGORIES = [
    { value: 'smartphones', label: '📱 Смартфоны', icon: '📱' },
    { value: 'laptops', label: '💻 Ноутбуки', icon: '💻' },
    { value: 'monitors', label: '🖥️ Мониторы', icon: '🖥️' },
    { value: 'cameras', label: '📷 Фотоаппараты', icon: '📷' },
    { value: 'audio', label: '🎧 Аудио', icon: '🎧' },
    { value: 'other', label: '📦 Другое', icon: '📦' }
];

// Предустановленные значения для характеристик
const SPEC_OPTIONS = {
    smartphones: {
        display: [
            '5.4" OLED', '6.1" OLED', '6.7" OLED', '6.8" OLED',
            '6.1" LCD', '6.7" LCD', '6.5" AMOLED', '6.4" AMOLED'
        ],
        processor: [
            'Apple A17 Pro', 'Apple A16 Bionic', 'Apple A15 Bionic',
            'Snapdragon 8 Gen 3', 'Snapdragon 8 Gen 2', 'Snapdragon 7+ Gen 2',
            'MediaTek Dimensity 9200', 'MediaTek Dimensity 8200',
            'Google Tensor G3', 'Google Tensor G2'
        ],
        ram: [
            '4 ГБ', '6 ГБ', '8 ГБ', '12 ГБ', '16 ГБ', '18 ГБ', '24 ГБ'
        ],
        storage: [
            '64 ГБ', '128 ГБ', '256 ГБ', '512 ГБ', '1 ТБ', '2 ТБ'
        ],
        camera: [
            '12 МП', '48 МП', '50 МП', '64 МП', '108 МП', '200 МП',
            'Двойная 12+12 МП', 'Тройная 50+12+10 МП'
        ],
        battery: [
            '3000 мАч', '3500 мАч', '4000 мАч', '4500 мАч', 
            '5000 мАч', '5500 мАч', '6000 мАч'
        ]
    },
    laptops: {
        display: [
            '13.3" Full HD', '13.3" Retina', '14" Full HD', '14" 2.8K OLED',
            '15.6" Full HD', '15.6" 2K', '15.6" 4K', '16" Retina',
            '17.3" Full HD', '17.3" 4K'
        ],
        processor: [
            'Intel Core i3-12100', 'Intel Core i5-12400', 'Intel Core i5-13400',
            'Intel Core i7-12700', 'Intel Core i7-13700', 'Intel Core i9-13900',
            'AMD Ryzen 5 5600H', 'AMD Ryzen 7 5800H', 'AMD Ryzen 7 7735HS',
            'AMD Ryzen 9 6900HX', 'AMD Ryzen 9 7940HS',
            'Apple M1', 'Apple M2', 'Apple M2 Pro', 'Apple M3', 'Apple M3 Max'
        ],
        ram: [
            '8 ГБ', '16 ГБ', '24 ГБ', '32 ГБ', '64 ГБ'
        ],
        storage: [
            '256 ГБ SSD', '512 ГБ SSD', '1 ТБ SSD', '2 ТБ SSD', '4 ТБ SSD'
        ],
        graphics: [
            'Intel UHD Graphics', 'Intel Iris Xe',
            'NVIDIA GeForce RTX 3050', 'NVIDIA GeForce RTX 3060',
            'NVIDIA GeForce RTX 4050', 'NVIDIA GeForce RTX 4060',
            'NVIDIA GeForce RTX 4070', 'NVIDIA GeForce RTX 4080',
            'NVIDIA GeForce RTX 4090',
            'AMD Radeon RX 6600M', 'AMD Radeon RX 6800M',
            'Apple M1 GPU', 'Apple M2 GPU', 'Apple M3 GPU'
        ],
        battery: [
            'до 6 часов', 'до 8 часов', 'до 10 часов', 
            'до 12 часов', 'до 15 часов', 'до 18 часов', 'до 22 часов'
        ]
    },
    monitors: {
        display: [
            '24"', '25"', '27"', '29"', '32"', '34" Ultrawide', '38" Ultrawide'
        ],
        resolution: [
            '1920x1080 (Full HD)', '2560x1080 (UW-Full HD)',
            '2560x1440 (2K/QHD)', '3440x1440 (UW-QHD)',
            '3840x2160 (4K/UHD)', '7680x4320 (8K)'
        ],
        refreshRate: [
            '60 Гц', '75 Гц', '100 Гц', '120 Гц', '144 Гц', 
            '165 Гц', '175 Гц', '240 Гц', '280 Гц', '360 Гц'
        ],
        panelType: [
            'TN', 'IPS', 'VA', 'OLED', 'Mini-LED', 'Nano IPS'
        ],
        responseTime: [
            '1 мс', '2 мс', '3 мс', '4 мс', '5 мс', '8 мс'
        ]
    },
    cameras: {
        sensor: [
            'APS-C (23.5x15.6 мм)', 'Полный кадр (35.9x24 мм)',
            'Micro Four Thirds', '1" (13.2x8.8 мм)',
            'Средний формат (43.8x32.9 мм)'
        ],
        megapixels: [
            '16 МП', '20 МП', '24.2 МП', '26.2 МП', '30.4 МП',
            '33 МП', '42.4 МП', '45.7 МП', '50.6 МП', '61 МП'
        ],
        iso: [
            'ISO 100-12800', 'ISO 100-25600', 'ISO 100-51200',
            'ISO 100-102400', 'ISO 50-204800'
        ],
        video: [
            'Full HD 30fps', 'Full HD 60fps', 'Full HD 120fps',
            '4K 24fps', '4K 30fps', '4K 60fps', '4K 120fps',
            '6K 30fps', '8K 24fps', '8K 30fps'
        ],
        mount: [
            'Canon EF', 'Canon EF-M', 'Canon RF',
            'Nikon F', 'Nikon Z',
            'Sony E', 'Sony A',
            'Fujifilm X', 'Fujifilm G',
            'Micro Four Thirds', 'Leica L', 'Sigma L'
        ]
    },
    audio: {
        type: [
            'Вкладыши', 'Полноразмерные', 'Накладные', 'Внутриканальные',
            'Студийные', 'Игровые (гарнитура)'
        ],
        connection: [
            'Проводные (3.5 мм)', 'Проводные (6.35 мм)',
            'Беспроводные (Bluetooth 5.0)', 'Беспроводные (Bluetooth 5.2)',
            'Беспроводные (Bluetooth 5.3)', 'USB-C', 'USB-A',
            'Комбинированные'
        ],
        driver: [
            '6 мм', '10 мм', '12 мм', '20 мм', '30 мм', 
            '40 мм', '50 мм', '53 мм'
        ],
        frequency: [
            '10 Гц - 20 кГц', '15 Гц - 22 кГц', '20 Гц - 20 кГц',
            '20 Гц - 22 кГц', '20 Гц - 40 кГц', '5 Гц - 40 кГц'
        ],
        battery: [
            '4 часа', '5 часов', '6 часов', '8 часов', 
            '10 часов', '15 часов', '20 часов', '30 часов', 
            '40 часов', '50 часов', '60 часов'
        ]
    },
    other: {
        feature1: [
            'Стандартная характеристика', 'Расширенная версия', 'Pro версия',
            'Lite версия', 'Max версия', 'Ultra версия'
        ],
        feature2: [
            'Базовая комплектация', 'Расширенная комплектация',
            'Премиум комплектация', 'Стандарт'
        ],
        feature3: [
            'Черный', 'Белый', 'Серебристый', 'Серый',
            'Синий', 'Красный', 'Зеленый', 'Розовый',
            'Золотой', 'Фиолетовый'
        ]
    }
};

function AdminPanel() {
    const navigate = useNavigate();
    const { user, isAdmin, logout } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        status: 'new',
        category: 'smartphones',
        brand: '',
        specs: {},
    });
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imageFile, setImageFile] = useState(null);

    // Проверка прав администратора
    useEffect(() => {
        if (!user) {
            navigate('/login', { state: { from: '/admin' } });
            return;
        }
        if (!isAdmin) {
            navigate('/', { replace: true });
            return;
        }
        loadProducts();
    }, [user, isAdmin, navigate]);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const data = await productsAPI.getAll();
            setProducts(data.products || []);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditingProduct(null);
        setFormData({
            name: '',
            price: '',
            description: '',
            status: 'new',
            category: 'smartphones',
            brand: '',
            specs: {},
        });
        setFormErrors({});
        setImageFile(null);
        setPreviewImage(null);
        setShowModal(true);
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            price: product.price,
            description: product.description || '',
            status: product.status,
            category: product.category || 'other',
            brand: product.brand || '',
            specs: product.specs ? (typeof product.specs === 'string' ? JSON.parse(product.specs) : product.specs) : {},
        });
        setPreviewImage(product.image);
        setImageFile(null);
        setFormErrors({});
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingProduct(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (formErrors[name]) {
            setFormErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleSpecChange = (specKey, value) => {
        setFormData((prev) => ({
            ...prev,
            specs: {
                ...prev.specs,
                [specKey]: value
            }
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Проверка расширения файла - более надёжная
            const allowedExtensions = ['jpeg', 'jpg', 'png', 'gif', 'webp', 'avif'];
            const fileNameParts = file.name.split('.');
            const fileExtension = fileNameParts.length > 1 
                ? fileNameParts.pop().toLowerCase() 
                : '';
            
            console.log('File info:', {
                name: file.name,
                extension: fileExtension,
                type: file.type,
                size: file.size
            });

            if (!allowedExtensions.includes(fileExtension)) {
                setFormErrors((prev) => ({ 
                    ...prev, 
                    image: `Разрешены только изображения (JPEG, PNG, GIF, WebP, AVIF). Ваш файл: ${fileExtension || 'без расширения'}` 
                }));
                return;
            }

            // Проверка размера (5MB)
            if (file.size > 5 * 1024 * 1024) {
                setFormErrors((prev) => ({ ...prev, image: 'Размер файла не более 5MB' }));
                return;
            }
            setImageFile(file);
            setFormErrors((prev) => ({ ...prev, image: '' }));

            // Предпросмотр
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.name.trim()) errors.name = 'Название обязательно';
        if (!formData.price.trim()) errors.price = 'Цена обязательна';
        if (!/^\d+(\.\d{1,2})?$/.test(formData.price)) errors.price = 'Некорректная цена';
        if (!formData.brand.trim()) errors.brand = 'Бренд обязателен';
        if (formData.description && formData.description.length > 2000) {
            errors.description = 'Описание не более 2000 символов';
        }
        if (!editingProduct && !imageFile) {
            errors.image = 'Загрузите изображение товара';
        }
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setIsSubmitting(true);
        try {
            // Создаём FormData для отправки с файлом
            const submitData = new FormData();
            submitData.append('name', formData.name);
            submitData.append('price', formData.price);
            submitData.append('description', formData.description);
            submitData.append('status', formData.status);
            submitData.append('category', formData.category);
            submitData.append('brand', formData.brand);
            submitData.append('specs', JSON.stringify(formData.specs));
            
            if (imageFile) {
                submitData.append('image', imageFile);
            }

            if (editingProduct) {
                await productsAPI.update(editingProduct.id, submitData, true);
            } else {
                await productsAPI.create(submitData, true);
            }
            await loadProducts();
            closeModal();
        } catch (err) {
            setFormErrors({ submit: err.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Вы уверены, что хотите удалить этот товар?')) return;

        try {
            await productsAPI.delete(id);
            await loadProducts();
        } catch (err) {
            alert('Ошибка при удалении: ' + err.message);
        }
    };

    const getStatusLabel = (status) => {
        const labels = { new: 'Новое', used: 'Б/У', rent: 'Аренда' };
        return labels[status] || status;
    };

    const getCategoryLabel = (category) => {
        const cat = CATEGORIES.find(c => c.value === category);
        return cat ? cat.label : category;
    };

    const getSpecTemplate = () => {
        return SPEC_OPTIONS[formData.category] || SPEC_OPTIONS.other;
    };

    if (!user || !isAdmin) return null;

    return (
        <>
            <Header />
            <main style={{ minHeight: 'calc(100vh - 200px)', padding: '40px 0' }}>
                <div className="container">
                    {/* Заголовок */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '30px',
                        flexWrap: 'wrap',
                        gap: '20px'
                    }}>
                        <div>
                            <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
                                Админ-панель
                            </h1>
                            <p style={{ color: 'var(--color-muted)' }}>
                                Добро пожаловать, {user.name}!
                            </p>
                        </div>
                        <button
                            onClick={openCreateModal}
                            className="button-buy"
                            style={{ width: 'auto', minWidth: '200px' }}
                        >
                            + Добавить товар
                        </button>
                    </div>

                    {/* Статистика */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '20px',
                        marginBottom: '30px'
                    }}>
                        <div style={{
                            backgroundColor: 'var(--color-surface)',
                            padding: '20px',
                            borderRadius: 'var(--border-radius-lg)',
                            border: '1px solid var(--color-border)'
                        }}>
                            <p style={{ color: 'var(--color-muted)', marginBottom: '8px' }}>Всего товаров</p>
                            <p style={{ fontSize: '32px', fontWeight: '700', color: 'var(--color-accent)' }}>
                                {products.length}
                            </p>
                        </div>
                        <div style={{
                            backgroundColor: 'var(--color-surface)',
                            padding: '20px',
                            borderRadius: 'var(--border-radius-lg)',
                            border: '1px solid var(--color-border)'
                        }}>
                            <p style={{ color: 'var(--color-muted)', marginBottom: '8px' }}>Новых</p>
                            <p style={{ fontSize: '32px', fontWeight: '700', color: '#10b981' }}>
                                {products.filter(p => p.status === 'new').length}
                            </p>
                        </div>
                        <div style={{
                            backgroundColor: 'var(--color-surface)',
                            padding: '20px',
                            borderRadius: 'var(--border-radius-lg)',
                            border: '1px solid var(--color-border)'
                        }}>
                            <p style={{ color: 'var(--color-muted)', marginBottom: '8px' }}>Б/У</p>
                            <p style={{ fontSize: '32px', fontWeight: '700', color: '#f59e0b' }}>
                                {products.filter(p => p.status === 'used').length}
                            </p>
                        </div>
                    </div>

                    {/* Таблица товаров */}
                    <div style={{
                        backgroundColor: 'var(--color-surface)',
                        borderRadius: 'var(--border-radius-lg)',
                        border: '1px solid var(--color-border)',
                        overflow: 'hidden'
                    }}>
                        <div style={{ padding: '20px', borderBottom: '1px solid var(--color-border)' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: '600' }}>Товары</h2>
                        </div>

                        {loading && (
                            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-muted)' }}>
                                Загрузка...
                            </div>
                        )}

                        {error && (
                            <div style={{ padding: '20px', color: '#ef4444' }}>
                                Ошибка: {error}
                            </div>
                        )}

                        {!loading && !error && products.length === 0 && (
                            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-muted)' }}>
                                Товаров пока нет. Добавьте первый товар!
                            </div>
                        )}

                        {!loading && !error && products.length > 0 && (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: 'var(--color-surface-alt)' }}>
                                            <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>
                                                Изображение
                                            </th>
                                            <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>
                                                Название
                                            </th>
                                            <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>
                                                Категория
                                            </th>
                                            <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>
                                                Цена
                                            </th>
                                            <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>
                                                Статус
                                            </th>
                                            <th style={{ padding: '15px', textAlign: 'right', borderBottom: '1px solid var(--color-border)' }}>
                                                Действия
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map((product) => (
                                            <tr
                                                key={product.id}
                                                style={{ borderBottom: '1px solid var(--color-border)' }}
                                            >
                                                <td style={{ padding: '15px' }}>
                                                    {product.image ? (
                                                        <img
                                                            src={product.image.startsWith('/') ? `http://localhost:5000${product.image}` : product.image}
                                                            alt={product.name}
                                                            style={{
                                                                width: '60px',
                                                                height: '60px',
                                                                objectFit: 'cover',
                                                                borderRadius: '8px'
                                                            }}
                                                        />
                                                    ) : (
                                                        <div style={{
                                                            width: '60px',
                                                            height: '60px',
                                                            backgroundColor: 'var(--color-surface-alt)',
                                                            borderRadius: '8px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}>
                                                            Нет фото
                                                        </div>
                                                    )}
                                                </td>
                                                <td style={{ padding: '15px' }}>
                                                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>{product.name}</div>
                                                    {product.brand && (
                                                        <div style={{ fontSize: '13px', color: 'var(--color-muted)' }}>
                                                            {product.brand}
                                                        </div>
                                                    )}
                                                </td>
                                                <td style={{ padding: '15px' }}>
                                                    <span style={{
                                                        padding: '4px 10px',
                                                        borderRadius: '6px',
                                                        fontSize: '12px',
                                                        backgroundColor: 'var(--color-surface-alt)',
                                                        color: 'var(--color-white)'
                                                    }}>
                                                        {getCategoryLabel(product.category)}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '15px', fontWeight: '600', color: 'var(--color-accent)' }}>
                                                    {product.price}$
                                                </td>
                                                <td style={{ padding: '15px' }}>
                                                    <span style={{
                                                        padding: '4px 12px',
                                                        borderRadius: '6px',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        backgroundColor: product.status === 'new' ? '#10b981' :
                                                            product.status === 'used' ? '#f59e0b' : '#3b82f6',
                                                        color: product.status === 'new' ? '#fff' : '#000'
                                                    }}>
                                                        {getStatusLabel(product.status)}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '15px', textAlign: 'right' }}>
                                                    <button
                                                        onClick={() => openEditModal(product)}
                                                        style={{
                                                            padding: '8px 16px',
                                                            marginRight: '8px',
                                                            backgroundColor: 'var(--color-accent)',
                                                            color: 'var(--color-dark)',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                            fontWeight: '600',
                                                            fontSize: '13px'
                                                        }}
                                                    >
                                                        Редактировать
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(product.id)}
                                                        style={{
                                                            padding: '8px 16px',
                                                            backgroundColor: '#ef4444',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                            fontWeight: '600',
                                                            fontSize: '13px'
                                                        }}
                                                    >
                                                        Удалить
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Модальное окно создания/редактирования */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <button className="modal-close" onClick={closeModal}>&times;</button>
                        <h2 className="modal-title">
                            {editingProduct ? 'Редактировать товар' : 'Новый товар'}
                        </h2>

                        {formErrors.submit && (
                            <div style={{
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid #ef4444',
                                borderRadius: '8px',
                                padding: '12px',
                                marginBottom: '16px',
                                color: '#ef4444'
                            }}>
                                {formErrors.submit}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="modal-form">
                            {/* Загрузка изображения */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600' }}>
                                    📷 Изображение товара
                                </label>
                                <div style={{
                                    border: `2px dashed ${formErrors.image ? '#ef4444' : 'var(--color-border)'}`,
                                    borderRadius: 'var(--border-radius)',
                                    padding: '20px',
                                    textAlign: 'center',
                                    backgroundColor: 'var(--color-bg)',
                                    cursor: 'pointer',
                                    transition: 'border-color 0.2s'
                                }}
                                    onClick={() => document.getElementById('image-input').click()}
                                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-accent)'}
                                    onMouseLeave={(e) => e.currentTarget.style.borderColor = formErrors.image ? '#ef4444' : 'var(--color-border)'}
                                >
                                    {previewImage ? (
                                        <div>
                                            <img
                                                src={previewImage}
                                                alt="Предпросмотр"
                                                style={{
                                                    maxWidth: '200px',
                                                    maxHeight: '200px',
                                                    objectFit: 'cover',
                                                    borderRadius: 'var(--border-radius)',
                                                    margin: '0 auto 10px'
                                                }}
                                            />
                                            <p style={{ color: 'var(--color-muted)', fontSize: '14px' }}>
                                                Нажмите, чтобы заменить
                                            </p>
                                        </div>
                                    ) : (
                                        <div>
                                            <div style={{ fontSize: '48px', marginBottom: '10px' }}>📷</div>
                                            <p style={{ color: 'var(--color-white)', marginBottom: '5px' }}>
                                                Нажмите для выбора изображения
                                            </p>
                                            <p style={{ color: 'var(--color-muted)', fontSize: '13px' }}>
                                                PNG, JPG, GIF, WebP до 5MB
                                            </p>
                                        </div>
                                    )}
                                    <input
                                        id="image-input"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        style={{ display: 'none' }}
                                        disabled={isSubmitting}
                                    />
                                </div>
                                {formErrors.image && (
                                    <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 4px' }}>{formErrors.image}</p>
                                )}
                            </div>

                            {/* Название и Бренд */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Название товара"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        disabled={isSubmitting}
                                    />
                                    {formErrors.name && (
                                        <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 4px' }}>{formErrors.name}</p>
                                    )}
                                </div>

                                <div>
                                    <input
                                        type="text"
                                        name="brand"
                                        placeholder="Бренд (Apple, Samsung, etc.)"
                                        value={formData.brand}
                                        onChange={handleInputChange}
                                        disabled={isSubmitting}
                                    />
                                    {formErrors.brand && (
                                        <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 4px' }}>{formErrors.brand}</p>
                                    )}
                                </div>
                            </div>

                            {/* Категория, Цена, Статус */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                                <div>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        disabled={isSubmitting}
                                        style={{
                                            padding: '14px 18px',
                                            fontSize: '1em',
                                            border: '2px solid var(--color-border)',
                                            borderRadius: 'var(--border-radius)',
                                            backgroundColor: 'var(--color-bg)',
                                            color: 'var(--color-white)',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {CATEGORIES.map(cat => (
                                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <input
                                        type="text"
                                        name="price"
                                        placeholder="Цена ($)"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        disabled={isSubmitting}
                                    />
                                    {formErrors.price && (
                                        <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 4px' }}>{formErrors.price}</p>
                                    )}
                                </div>

                                <div>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        disabled={isSubmitting}
                                        style={{
                                            padding: '14px 18px',
                                            fontSize: '1em',
                                            border: '2px solid var(--color-border)',
                                            borderRadius: 'var(--border-radius)',
                                            backgroundColor: 'var(--color-bg)',
                                            color: 'var(--color-white)',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <option value="new">Новое</option>
                                        <option value="used">Б/У</option>
                                        <option value="rent">Аренда</option>
                                    </select>
                                </div>
                            </div>

                            {/* Характеристики по категории с выпадающими списками */}
                            <div style={{
                                backgroundColor: 'var(--color-surface-alt)',
                                padding: '20px',
                                borderRadius: 'var(--border-radius)',
                                marginBottom: '15px'
                            }}>
                                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px', color: 'var(--color-white)' }}>
                                    📋 Характеристики ({getCategoryLabel(formData.category)})
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    {Object.entries(getSpecTemplate()).map(([specKey, options]) => (
                                        <div key={specKey}>
                                            <label style={{
                                                display: 'block',
                                                fontSize: '12px',
                                                color: 'var(--color-muted)',
                                                marginBottom: '5px',
                                                textTransform: 'capitalize'
                                            }}>
                                                {specKey === 'ram' ? 'ОЗУ' :
                                                 specKey === 'storage' ? 'Память' :
                                                 specKey === 'display' ? 'Экран' :
                                                 specKey === 'processor' ? 'Процессор' :
                                                 specKey === 'camera' ? 'Камера' :
                                                 specKey === 'battery' ? 'Батарея' :
                                                 specKey === 'graphics' ? 'Видеокарта' :
                                                 specKey === 'resolution' ? 'Разрешение' :
                                                 specKey === 'refreshRate' ? 'Частота обновления' :
                                                 specKey === 'panelType' ? 'Тип матрицы' :
                                                 specKey === 'responseTime' ? 'Время отклика' :
                                                 specKey === 'sensor' ? 'Матрица' :
                                                 specKey === 'megapixels' ? 'Мегапиксели' :
                                                 specKey === 'iso' ? 'ISO' :
                                                 specKey === 'video' ? 'Видео' :
                                                 specKey === 'mount' ? 'Байонет' :
                                                 specKey === 'type' ? 'Тип' :
                                                 specKey === 'connection' ? 'Подключение' :
                                                 specKey === 'driver' ? 'Динамики' :
                                                 specKey === 'frequency' ? 'Частотный диапазон' :
                                                 specKey}
                                            </label>
                                            <select
                                                value={formData.specs[specKey] || ''}
                                                onChange={(e) => handleSpecChange(specKey, e.target.value)}
                                                disabled={isSubmitting}
                                                style={{
                                                    padding: '10px 14px',
                                                    fontSize: '0.9em',
                                                    border: '2px solid var(--color-border)',
                                                    borderRadius: 'var(--border-radius)',
                                                    backgroundColor: 'var(--color-bg)',
                                                    color: 'var(--color-white)',
                                                    width: '100%',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <option value="">— Выберите —</option>
                                                {options.map((option) => (
                                                    <option key={option} value={option}>
                                                        {option}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Описание */}
                            <div>
                                <textarea
                                    name="description"
                                    placeholder="Описание товара (необязательно)"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    disabled={isSubmitting}
                                    rows={3}
                                />
                                {formErrors.description && (
                                    <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 4px' }}>{formErrors.description}</p>
                                )}
                            </div>

                            <button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Сохранение...' : (editingProduct ? 'Сохранить' : 'Создать')}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <Footer />
        </>
    );
}

export default AdminPanel;
