const API_BASE_URL = 'http://localhost:5000/api';

// Получение токена из localStorage
const getToken = () => localStorage.getItem('token');

// Основной метод для запросов
async function request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = getToken();
    const isFormData = options.isFormData || false;

    const headers = {
        ...options.headers,
    };

    // Для FormData НЕ устанавливаем Content-Type - браузер сделает это сам
    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }

    // Добавляем токен авторизации если есть
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers,
    };

    try {
        const response = await fetch(url, config);
        
        // Пробуем получить текст ошибки для отладки
        const text = await response.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            data = { error: text || 'Unknown error' };
        }

        if (!response.ok) {
            console.error('API Error details:', {
                status: response.status,
                statusText: response.statusText,
                data: data
            });
            throw new Error(data.error || data.message || `Ошибка ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error('API Error:', error.message);
        throw error;
    }
}

// Аутентификация
export const authAPI = {
    register: async (name, email, password) => {
        return request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password }),
        });
    },

    login: async (email, password) => {
        return request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    },

    getMe: async () => {
        return request('/auth/me');
    },

    setToken: (token) => {
        localStorage.setItem('token', token);
    },

    removeToken: () => {
        localStorage.removeItem('token');
    },

    isAuthenticated: () => {
        return !!getToken();
    },
};

// Товары
export const productsAPI = {
    getAll: async () => {
        return request('/products');
    },

    getById: async (id) => {
        return request(`/products/${id}`);
    },

    create: async (data, isFormData = false) => {
        return request('/products', {
            method: 'POST',
            body: data,
            isFormData: isFormData,
        });
    },

    update: async (id, data, isFormData = false) => {
        return request(`/products/${id}`, {
            method: 'PUT',
            body: data,
            isFormData: isFormData,
        });
    },

    delete: async (id) => {
        return request(`/products/${id}`, {
            method: 'DELETE',
        });
    },
};

// Кошелёк (баланс, транзакции)
export const walletAPI = {
    getBalance: async () => {
        return request('/wallet/balance');
    },

    deposit: async (amount) => {
        return request('/wallet/deposit', {
            method: 'POST',
            body: JSON.stringify({ amount }),
        });
    },

    getTransactions: async () => {
        return request('/wallet/transactions');
    },
};

// Корзина
export const cartAPI = {
    getCart: async () => {
        return request('/cart');
    },

    addToCart: async (product_id, quantity = 1) => {
        return request('/cart', {
            method: 'POST',
            body: JSON.stringify({ product_id, quantity }),
        });
    },

    updateQuantity: async (product_id, quantity) => {
        return request(`/cart/${product_id}`, {
            method: 'PUT',
            body: JSON.stringify({ quantity }),
        });
    },

    removeFromCart: async (product_id) => {
        return request(`/cart/${product_id}`, {
            method: 'DELETE',
        });
    },

    clearCart: async () => {
        return request('/cart', {
            method: 'DELETE',
        });
    },
};

// Заказы
export const ordersAPI = {
    checkout: async () => {
        return request('/orders/checkout', {
            method: 'POST',
        });
    },

    getOrders: async () => {
        return request('/orders');
    },

    getOrderById: async (id) => {
        return request(`/orders/${id}`);
    },
};

export default { 
    authAPI, 
    productsAPI, 
    walletAPI, 
    cartAPI, 
    ordersAPI 
};
