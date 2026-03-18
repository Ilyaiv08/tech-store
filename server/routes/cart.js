import express from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/cart - Получить корзину пользователя
router.get('/', authenticateToken, async (req, res) => {
    try {
        const cartItems = await prisma.cart.findMany({
            where: { userId: req.user.id },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        image: true,
                        imageFilename: true,
                        status: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const items = cartItems.map(item => ({
            ...item,
            product_id: item.productId, // Добавляем product_id для frontend
            image: item.product.imageFilename ? `/uploads/${item.product.imageFilename}` : item.product.image,
            price: parseFloat(item.product.price),
            subtotal: parseFloat(item.product.price) * item.quantity
        }));

        const total = items.reduce((sum, item) => sum + item.subtotal, 0);

        res.json({ items, total, count: items.length });
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// POST /api/cart - Добавить товар в корзину
router.post('/', 
    authenticateToken,
    body('product_id').notEmpty().withMessage('ID товара обязателен'),
    body('quantity').optional().isInt({ min: 1 }).withMessage('Количество должно быть больше 0'),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { product_id, quantity = 1 } = req.body;
            const userId = req.user.id;

            const product = await prisma.product.findUnique({
                where: { id: parseInt(product_id) }
            });
            
            if (!product) {
                return res.status(404).json({ error: 'Товар не найден' });
            }

            // Проверяем есть ли уже в корзине
            const existing = await prisma.cart.findUnique({
                where: {
                    userId_productId: {
                        userId,
                        productId: parseInt(product_id)
                    }
                }
            });
            
            if (existing) {
                await prisma.cart.update({
                    where: { id: existing.id },
                    data: { quantity: existing.quantity + parseInt(quantity) }
                });
            } else {
                await prisma.cart.create({
                    data: {
                        userId,
                        productId: parseInt(product_id),
                        quantity: parseInt(quantity)
                    }
                });
            }

            // Получаем обновлённую корзину
            const cartItems = await prisma.cart.findMany({
                where: { userId },
                include: {
                    product: {
                        select: {
                            name: true,
                            price: true,
                            image: true,
                            imageFilename: true
                        }
                    }
                }
            });

            const items = cartItems.map(item => ({
                ...item,
                product_id: item.productId,
                image: item.product.imageFilename ? `/uploads/${item.product.imageFilename}` : item.product.image,
                price: parseFloat(item.product.price),
                subtotal: parseFloat(item.product.price) * item.quantity
            }));

            const total = items.reduce((sum, item) => sum + item.subtotal, 0);

            res.json({
                message: 'Товар добавлен в корзину',
                items,
                total,
                count: items.length
            });
        } catch (error) {
            console.error('Add to cart error:', error);
            res.status(500).json({ error: 'Ошибка сервера при добавлении в корзину' });
        }
    }
);

// PUT /api/cart/:product_id - Обновить количество товара
router.put('/:product_id',
    authenticateToken,
    body('quantity').isInt({ min: 1 }).withMessage('Количество должно быть больше 0'),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { quantity } = req.body;
            const { product_id } = req.params;
            const userId = req.user.id;

            console.log('Update cart:', { userId, product_id, quantity });

            if (!product_id) {
                return res.status(400).json({ error: 'product_id обязателен' });
            }

            await prisma.cart.update({
                where: {
                    userId_productId: {
                        userId,
                        productId: parseInt(product_id)
                    }
                },
                data: { quantity: parseInt(quantity) }
            });

            const cartItems = await prisma.cart.findMany({
                where: { userId },
                include: {
                    product: {
                        select: {
                            name: true,
                            price: true,
                            image: true,
                            imageFilename: true
                        }
                    }
                }
            });

            const items = cartItems.map(item => ({
                ...item,
                product_id: item.productId,
                image: item.product.imageFilename ? `/uploads/${item.product.imageFilename}` : item.product.image,
                price: parseFloat(item.product.price),
                subtotal: parseFloat(item.product.price) * item.quantity
            }));

            const total = items.reduce((sum, item) => sum + item.subtotal, 0);

            res.json({
                message: 'Корзина обновлена',
                items,
                total
            });
        } catch (error) {
            console.error('Update cart error:', error);
            res.status(500).json({ error: 'Ошибка сервера при обновлении корзины' });
        }
    }
);

// DELETE /api/cart/:product_id - Удалить товар из корзины
router.delete('/:product_id', authenticateToken, async (req, res) => {
    try {
        const { product_id } = req.params;
        const userId = req.user.id;

        await prisma.cart.deleteMany({
            where: {
                userId,
                productId: parseInt(product_id)
            }
        });

        const cartItems = await prisma.cart.findMany({
            where: { userId },
            include: {
                product: {
                    select: {
                        name: true,
                        price: true,
                        image: true,
                        imageFilename: true
                    }
                }
            }
        });

        const items = cartItems.map(item => ({
            ...item,
            product_id: item.productId,
            image: item.product.imageFilename ? `/uploads/${item.product.imageFilename}` : item.product.image,
            price: parseFloat(item.product.price),
            subtotal: parseFloat(item.product.price) * item.quantity
        }));

        const total = items.reduce((sum, item) => sum + item.subtotal, 0);

        res.json({
            message: 'Товар удалён из корзины',
            items,
            total
        });
    } catch (error) {
        console.error('Delete from cart error:', error);
        res.status(500).json({ error: 'Ошибка сервера при удалении из корзины' });
    }
});

// DELETE /api/cart - Очистить корзину
router.delete('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        
        await prisma.cart.deleteMany({
            where: { userId }
        });
        
        res.json({ message: 'Корзина очищена', items: [], total: 0 });
    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({ error: 'Ошибка сервера при очистке корзины' });
    }
});

export default router;
