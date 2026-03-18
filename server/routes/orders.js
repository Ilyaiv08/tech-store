import express from 'express';
import prisma from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/orders/checkout - Оформление заказа (покупка)
router.post('/checkout', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        // Получаем корзину пользователя
        const cartItems = await prisma.cart.findMany({
            where: { userId },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        status: true
                    }
                }
            }
        });

        if (cartItems.length === 0) {
            return res.status(400).json({ error: 'Корзина пуста' });
        }

        // Считаем общую сумму
        const total = cartItems.reduce((sum, item) => {
            return sum + (parseFloat(item.product.price) * item.quantity);
        }, 0);

        // Получаем текущий баланс пользователя
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        
        if (user.balance < total) {
            return res.status(400).json({ 
                error: 'Недостаточно средств на балансе',
                balance: user.balance,
                total: total,
                needed: total - user.balance
            });
        }

        // Создаём заказ в транзакции
        const result = await prisma.$transaction(async (tx) => {
            // Списываем деньги
            const balanceBefore = user.balance;
            const newBalance = balanceBefore - total;
            
            await tx.user.update({
                where: { id: userId },
                data: { balance: newBalance }
            });

            // Записываем транзакцию
            const transaction = await tx.transaction.create({
                data: {
                    userId,
                    type: 'purchase',
                    amount: total,
                    balanceBefore,
                    balanceAfter: newBalance,
                    description: 'Покупка товаров'
                }
            });

            // Создаём заказ
            const order = await tx.order.create({
                data: {
                    userId,
                    totalAmount: total,
                    status: 'completed'
                }
            });

            // Добавляем элементы заказа
            for (const item of cartItems) {
                const subtotal = parseFloat(item.product.price) * item.quantity;
                await tx.orderItem.create({
                    data: {
                        orderId: order.id,
                        productId: item.productId,
                        productName: item.product.name,
                        productPrice: parseFloat(item.product.price),
                        quantity: item.quantity,
                        subtotal
                    }
                });
            }

            // Очищаем корзину
            await tx.cart.deleteMany({
                where: { userId }
            });

            return { order, newBalance, transaction };
        });

        // Получаем элементы заказа с изображениями
        const orderItems = await prisma.orderItem.findMany({
            where: { orderId: result.order.id },
            include: {
                product: {
                    select: {
                        image: true,
                        imageFilename: true
                    }
                }
            }
        });

        // Добавляем URL изображений
        const itemsWithImages = orderItems.map(item => ({
            ...item,
            image: item.product?.imageFilename ? `/uploads/${item.product.imageFilename}` : item.product?.image
        }));

        res.json({
            message: 'Заказ успешно оформлен',
            order: {
                ...result.order,
                items: itemsWithImages
            },
            balance: result.newBalance
        });

    } catch (error) {
        console.error('Checkout error:', error);
        res.status(500).json({ error: 'Ошибка сервера при оформлении заказа: ' + error.message });
    }
});

// GET /api/orders - История заказов пользователя
router.get('/', authenticateToken, async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        // Добавляем элементы к каждому заказу с изображениями
        const ordersWithItems = await Promise.all(
            orders.map(async (order) => {
                const orderItems = await prisma.orderItem.findMany({
                    where: { orderId: order.id },
                    include: {
                        product: {
                            select: {
                                image: true,
                                imageFilename: true
                            }
                        }
                    }
                });
                
                // Добавляем URL изображений
                const items = orderItems.map(item => ({
                    ...item,
                    image: item.product?.imageFilename ? `/uploads/${item.product.imageFilename}` : item.product?.image
                }));
                
                return {
                    ...order,
                    items
                };
            })
        );

        res.json({ orders: ordersWithItems });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// GET /api/orders/:id - Детали заказа
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const order = await prisma.order.findFirst({
            where: { 
                id: parseInt(req.params.id),
                userId: req.user.id 
            }
        });

        if (!order) {
            return res.status(404).json({ error: 'Заказ не найден' });
        }

        const items = await prisma.orderItem.findMany({
            where: { orderId: order.id }
        });

        res.json({
            order: {
                ...order,
                items
            }
        });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

export default router;
