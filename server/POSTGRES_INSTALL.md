# Инструкция по установке PostgreSQL

## 1. Установка PostgreSQL

### Windows:
1. Скачайте PostgreSQL с официального сайта: https://www.postgresql.org/download/windows/
2. Запустите установщик
3. Выберите компоненты: PostgreSQL Server, pgAdmin, Command Line Tools
4. Укажите пароль для пользователя `postgres` (запомните его!)
5. Порт: 5432
6. Локаль: Russian, Russia (или Default)

### После установки:
Откройте pgAdmin или PowerShell и выполните:

```sql
CREATE DATABASE techstore;
```

## 2. Настройка DATABASE_URL

Откройте файл `server/.env` и измените `DATABASE_URL`:

```env
DATABASE_URL="postgresql://postgres:ВАШ_ПАРОЛЬ@localhost:5432/techstore?schema=public"
```

Замените `ВАШ_ПАРОЛЬ` на пароль который вы задали при установке.

## 3. Применение миграций

```bash
cd server
npx prisma migrate dev --name init
npx prisma generate
```

## 4. Создание админа

```bash
npm run create-admin
```

## 5. Запуск проекта

```bash
# Терминал 1 - Бэкенд
npm run server

# Терминал 2 - Фронтенд
npm run dev
```
