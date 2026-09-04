# Tech Store - Инструкция по запуску

## Требования

- Node.js 16+
- PostgreSQL 12+

## Быстрый старт

### 1. Установка PostgreSQL

**Windows:**
1. Скачайте с https://www.postgresql.org/download/windows/
2. Установите, запомните пароль пользователя `postgres`
3. Откройте pgAdmin или SQL Shell и выполните:
   ```sql
   CREATE DATABASE techstore;
   ```

**Или используйте Docker:**
```bash
docker run --name techstore-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=techstore -p 5432:5432 -d postgres:15
```

### 2. Установка зависимостей

```bash
# Фронтенд
npm install

# Бэкенд
cd server
npm install
```

### 3. Настройка .env

Откройте `server/.env` и настройте:

```env
# PostgreSQL Database URL
# Замените postgres на ваш пароль
DATABASE_URL="postgresql://postgres:ваш пароль@localhost:5432/techstore?ваше название"

# Порт сервера
PORT=5000

# JWT настройки
JWT_SECRET=ваш секрет ключ
JWT_EXPIRES_IN=7d

# Администратор
ADMIN_EMAIL=admin@techstore.com
ADMIN_PASSWORD=admin123
ADMIN_NAME=Admin
```

### 4. Применение миграций

```bash
cd server
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Создание администратора

```bash
npm run create-admin
```

### 6. Запуск сервера (бэкенд)

```bash
npm run server
```

Сервер запустится на `http://localhost:5000`

### 7. Запуск фронтенда (в другом терминале)

```bash
npm run dev
```

Фронтенд откроется на `http://localhost:5173`

---

## Функционал

### Для пользователей:

✅ Регистрация и вход  
✅ Просмотр товаров  
✅ Корзина  
✅ Баланс (пополнение, история)  
✅ Покупка товаров  
✅ История заказов  

### Для администраторов:

✅ Добавление товаров  
✅ Редактирование товаров  
✅ Удаление товаров  
✅ Статистика  

---

## Как купить товар

1. **Регистрация** → `/register`
2. **Пополнение баланса** → `/wallet`
3. **Добавить товары в корзину** → кнопка "В корзину"
4. **Оформить заказ** → `/cart` → "Оформить заказ"
5. **История заказов** → `/orders`

---

## База данных (PostgreSQL)

### Таблицы:

**users** - пользователи
- id, name, email, password, role, balance, createdAt

**products** - товары
- id, name, price, description, status, image, category, brand, specs

**cart** - корзина
- id, userId, productId, quantity

**orders** - заказы
- id, userId, totalAmount, status, createdAt

**order_items** - элементы заказа
- id, orderId, productId, productName, productPrice, quantity, subtotal

**transactions** - транзакции
- id, userId, type, amount, balanceBefore, balanceAfter

---

## API Endpoints

### Аутентификация
| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | `/api/auth/register` | Регистрация |
| POST | `/api/auth/login` | Вход |
| GET | `/api/auth/me` | Пользователь |

### Товары
| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/products` | Все товары |
| POST | `/api/products` | Создать (админ) |
| PUT | `/api/products/:id` | Обновить (админ) |
| DELETE | `/api/products/:id` | Удалить (админ) |

### Кошелёк
| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/wallet/balance` | Баланс |
| POST | `/api/wallet/deposit` | Пополнить |
| GET | `/api/wallet/transactions` | История |

### Корзина
| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/cart` | Корзина |
| POST | `/api/cart` | Добавить |
| PUT | `/api/cart/:id` | Обновить |
| DELETE | `/api/cart/:id` | Удалить |

### Заказы
| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | `/api/orders/checkout` | Купить |
| GET | `/api/orders` | История |
| GET | `/api/orders/:id` | Детали |

---

## Команды

### Фронтенд
```bash
npm run dev          # Запуск
npm run build        # Сборка
npm run preview      # Предпросмотр
```

### Бэкенд
```bash
npm run server       # Запуск
npm run server:dev   # С авто-перезагрузкой
npm run create-admin # Создание админа
```

### Prisma
```bash
npx prisma migrate dev    # Миграция
npx prisma generate       # Генерация клиента
npx prisma studio         # GUI для БД
```

---

## Технологии

**Фронтенд:** React 19, React Router DOM, Vite

**Бэкенд:** Node.js + Express, PostgreSQL, Prisma ORM, JWT, bcrypt, multer
