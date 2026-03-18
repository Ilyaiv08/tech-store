import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Экспорт для использования в роутах
export default prisma;

// Инициализация БД
export async function initDb() {
    try {
        // Проверка подключения
        await prisma.$connect();
        console.log('✅ PostgreSQL подключён');
        
        // Проверка существования таблиц
        await prisma.user.findFirst();
        console.log('✅ База данных инициализирована');
        
    } catch (error) {
        console.error('❌ Ошибка подключения к PostgreSQL:', error.message);
        console.error('');
        console.error('📝 Убедитесь что:');
        console.error('   1. PostgreSQL установлен и запущен');
        console.error('   2. Создана база данных: CREATE DATABASE techstore;');
        console.error('   3. DATABASE_URL в .env настроен правильно');
        console.error('   4. Применены миграции: npx prisma migrate dev --name init');
        console.error('   5. Сгенерирован клиент: npx prisma generate');
    }
}

// Закрытие соединения при выгрузке
process.on('beforeExit', async () => {
    await prisma.$disconnect();
});
