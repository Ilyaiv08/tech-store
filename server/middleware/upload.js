import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Создание директории для загрузок
const uploadsDir = path.join(__dirname, '../uploads');
if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
}

// Настройка хранилища
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Генерируем уникальное имя файла
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `product-${uniqueSuffix}${ext}`);
    }
});

// Фильтр для проверки типа файла - более лояльный
const fileFilter = (req, file, cb) => {
    // Разрешаем все изображения по расширению
    const allowedExtensions = ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.avif', '.JPEG', '.JPG', '.PNG', '.GIF', '.WEBP', '.AVIF'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Разрешены только изображения (JPEG, PNG, GIF, WebP, AVIF)'));
    }
};

// Настройка multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // Максимум 5MB
    },
    fileFilter: fileFilter
});

export default upload;
