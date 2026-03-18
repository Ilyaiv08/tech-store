import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import prisma from '../db/index.js';

// Загрузка переменных окружения
dotenv.config();

async function createAdmin() {
    // Инициализация БД
    await prisma.$connect();

    // Получение данных из .env
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME || 'Admin';

    // Проверка наличия данных
    if (!adminEmail || !adminPassword) {
        console.error('❌ Ошибка: Не указаны ADMIN_EMAIL или ADMIN_PASSWORD в файле .env');
        console.error('');
        console.error('📝 Заполните файл server/.env:');
        console.error('   ADMIN_EMAIL=admin@techstore.com');
        console.error('   ADMIN_PASSWORD=ваш_пароль');
        console.error('   ADMIN_NAME=ИмяАдмина (необязательно)');
        await prisma.$disconnect();
        process.exit(1);
    }

    try {
        // Проверка существования админа
        const existingAdmin = await prisma.user.findFirst({
            where: { 
                email: adminEmail,
                role: 'admin'
            }
        });
        
        if (existingAdmin) {
            console.log('⚠️ Администратор с таким email уже существует!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log(`👤 ID: ${existingAdmin.id}`);
            console.log(`📧 Email: ${existingAdmin.email}`);
            console.log(`👤 Имя: ${existingAdmin.name}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('');
            console.log('💡 Если вы забыли пароль, создайте нового админа с другим email');
            await prisma.$disconnect();
            return;
        }

        // Хэширование пароля
        console.log('⏳ Создание администратора...');
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

        // Создание админа
        const admin = await prisma.user.create({
            data: {
                name: adminName,
                email: adminEmail,
                password: hashedPassword,
                role: 'admin'
            }
        });

        console.log('');
        console.log('✅ Администратор успешно создан!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`🆔 ID: ${admin.id}`);
        console.log(`👤 Имя: ${adminName}`);
        console.log(`📧 Email: ${adminEmail}`);
        console.log(`🔑 Роль: admin`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('');
        console.log('🚀 Теперь вы можете войти в админ-панель:');
        console.log('   1. Откройте http://localhost:5173');
        console.log('   2. Нажмите "Вход"');
        console.log(`   3. Email: ${adminEmail}`);
        console.log('   4. Пароль: (ваш пароль из .env)');
        console.log('');

        await prisma.$disconnect();

    } catch (error) {
        console.error('');
        console.error('❌ Ошибка при создании админа:', error.message);
        console.error('');
        console.error('📋 Детали ошибки:');
        console.error(error.stack);
        await prisma.$disconnect();
        process.exit(1);
    }
}

// Запуск функции
createAdmin();
