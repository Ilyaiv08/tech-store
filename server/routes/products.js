import express from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../db/index.js';
import { authenticateToken, isAdmin, optionalAuth } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Функция для ручной валидации FormData
function validateFormData(req) {
    const errors = [];
    const { name, price, brand } = req.body;

    if (!name || (typeof name === 'string' && !name.trim())) {
        errors.push({ msg: 'Название обязательно', param: 'name' });
    } else if (name && name.length < 2) {
        errors.push({ msg: 'Название от 2 до 200 символов', param: 'name' });
    }

    if (!price || (typeof price === 'string' && !price.trim())) {
        errors.push({ msg: 'Цена обязательна', param: 'price' });
    } else if (price && !/^\d+(\.\d{1,2})?$/.test(price)) {
        errors.push({ msg: 'Цена должна быть числом', param: 'price' });
    }

    if (!brand || (typeof brand === 'string' && !brand.trim())) {
        errors.push({ msg: 'Бренд обязателен', param: 'brand' });
    }

    return errors;
}

// GET /api/products - Получить все товары
router.get('/', optionalAuth, async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            include: {
                createdBy: {
                    select: { name: true, role: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const productsWithImages = products.map(p => ({
            ...p,
            image: p.imageFilename ? `/uploads/${p.imageFilename}` : p.image
        }));

        res.json({ products: productsWithImages });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// GET /api/products/:id - Получить один товар
router.get('/:id', optionalAuth, async (req, res) => {
    try {
        const product = await prisma.product.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                createdBy: {
                    select: { name: true, role: true }
                }
            }
        });

        if (!product) {
            return res.status(404).json({ error: 'Товар не найден' });
        }

        if (product.imageFilename) {
            product.image = `/uploads/${product.imageFilename}`;
        }

        if (product.specs) {
            try {
                product.specs = JSON.parse(product.specs);
            } catch (e) {
                product.specs = [];
            }
        }

        res.json({ product });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// POST /api/products - Создать товар
router.post('/', authenticateToken, isAdmin, upload.single('image'), async (req, res) => {
    try {
        const validationErrors = validateFormData(req);
        
        if (validationErrors.length > 0) {
            if (req.file) {
                fs.unlink(req.file.path, () => {});
            }
            return res.status(400).json({ errors: validationErrors });
        }

        const { name, price, description, status, category, brand, specs } = req.body;
        const validStatuses = ['new', 'used', 'rent'];
        const finalStatus = (status && validStatuses.includes(status)) ? status : 'new';
        
        const imageFilename = req.file ? req.file.filename : null;
        const imageUrl = imageFilename ? `/uploads/${imageFilename}` : null;

        const product = await prisma.product.create({
            data: {
                name: name.trim(),
                price: price.trim(),
                description: description?.trim() || null,
                status: finalStatus,
                image: imageUrl,
                imageFilename,
                category: category || 'other',
                brand: brand?.trim() || null,
                specs: specs || null,
                createdById: req.user.id
            }
        });

        if (product.specs) {
            try {
                product.specs = JSON.parse(product.specs);
            } catch (e) {
                product.specs = [];
            }
        }
        product.image = imageUrl;

        res.status(201).json({
            message: 'Товар успешно создан',
            product
        });
    } catch (error) {
        console.error('Create product error:', error);
        if (req.file) {
            fs.unlink(req.file.path, () => {});
        }
        res.status(500).json({ error: 'Ошибка сервера при создании товара: ' + error.message });
    }
});

// PUT /api/products/:id - Обновить товар
router.put('/:id', authenticateToken, isAdmin, upload.single('image'), async (req, res) => {
    try {
        const validationErrors = validateFormData(req);
        
        if (validationErrors.length > 0) {
            if (req.file) {
                fs.unlink(req.file.path, () => {});
            }
            return res.status(400).json({ errors: validationErrors });
        }

        const { name, price, description, status, category, brand, specs } = req.body;
        const productId = parseInt(req.params.id);

        const existingProduct = await prisma.product.findUnique({
            where: { id: productId }
        });
        
        if (!existingProduct) {
            if (req.file) {
                fs.unlink(req.file.path, () => {});
            }
            return res.status(404).json({ error: 'Товар не найден' });
        }

        const validStatuses = ['new', 'used', 'rent'];
        const finalStatus = (status && validStatuses.includes(status)) ? status : existingProduct.status;

        let imageFilename = existingProduct.imageFilename;
        let imageUrl = existingProduct.image;

        if (req.file) {
            if (existingProduct.imageFilename) {
                const oldImagePath = path.join(__dirname, '../uploads', existingProduct.imageFilename);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            imageFilename = req.file.filename;
            imageUrl = `/uploads/${imageFilename}`;
        }

        const product = await prisma.product.update({
            where: { id: productId },
            data: {
                name: name.trim(),
                price: price.trim(),
                description: description?.trim() || null,
                status: finalStatus,
                image: imageUrl,
                imageFilename,
                category: category || 'other',
                brand: brand?.trim() || null,
                specs: specs || null
            }
        });

        if (product.specs) {
            try {
                product.specs = JSON.parse(product.specs);
            } catch (e) {
                product.specs = [];
            }
        }
        product.image = imageUrl;

        res.json({
            message: 'Товар успешно обновлён',
            product
        });
    } catch (error) {
        console.error('Update product error:', error);
        if (req.file) {
            fs.unlink(req.file.path, () => {});
        }
        res.status(500).json({ error: 'Ошибка сервера при обновлении товара: ' + error.message });
    }
});

// DELETE /api/products/:id - Удалить товар
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const productId = parseInt(req.params.id);

        const existingProduct = await prisma.product.findUnique({
            where: { id: productId }
        });
        
        if (!existingProduct) {
            return res.status(404).json({ error: 'Товар не найден' });
        }

        if (existingProduct.imageFilename) {
            const imagePath = path.join(__dirname, '../uploads', existingProduct.imageFilename);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await prisma.product.delete({
            where: { id: productId }
        });

        res.json({ message: 'Товар успешно удалён' });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ error: 'Ошибка сервера при удалении товара' });
    }
});

export default router;
