import express from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/rentals - Мои аренды
router.get('/', authenticateToken, async (req, res) => {
    try {
        const rentals = await prisma.rental.findMany({
            where: { userId: req.user.id },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        image: true,
                        imageFilename: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const items = rentals.map(rental => ({
            ...rental,
            product: {
                ...rental.product,
                image: rental.product.imageFilename ? `/uploads/${rental.product.imageFilename}` : rental.product.image
            },
            pricePerDay: parseFloat(rental.product.price),
            totalPrice: rental.totalPrice,
            deposit: rental.deposit
        }));

        res.json({ rentals: items });
    } catch (error) {
        console.error('Get rentals error:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// POST /api/rentals - Оформить аренду
router.post('/',
    authenticateToken,
    body('productId').notEmpty().withMessage('ID товара обязателен'),
    body('daysCount').isInt({ min: 1 }).withMessage('Срок аренды должен быть от 1 дня'),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { productId, daysCount } = req.body;
            const userId = req.user.id;

            // Получаем товар
            const product = await prisma.product.findUnique({
                where: { id: parseInt(productId) }
            });

            if (!product) {
                return res.status(404).json({ error: 'Товар не найден' });
            }

            if (product.status !== 'rent') {
                return res.status(400).json({ error: 'Товар недоступен для аренды' });
            }

            // Рассчитываем стоимость
            const pricePerDay = parseFloat(product.price);
            const totalPrice = pricePerDay * daysCount;
            const deposit = totalPrice * 0.5; // Залог 50% от стоимости аренды

            // Проверяем баланс пользователя
            const user = await prisma.user.findUnique({
                where: { id: userId }
            });

            const totalRequired = totalPrice + deposit;
            if (user.balance < totalRequired) {
                return res.status(400).json({
                    error: 'Недостаточно средств на балансе',
                    balance: user.balance,
                    required: totalRequired,
                    breakdown: {
                        rentalCost: totalPrice,
                        deposit: deposit
                    }
                });
            }

            // Создаём аренду в транзакции
            const result = await prisma.$transaction(async (tx) => {
                // Списываем деньги
                const balanceBefore = user.balance;
                const newBalance = balanceBefore - totalRequired;

                await tx.user.update({
                    where: { id: userId },
                    data: { balance: newBalance }
                });

                // Записываем транзакцию
                await tx.transaction.create({
                    data: {
                        userId,
                        type: 'rental',
                        amount: totalRequired,
                        balanceBefore,
                        balanceAfter: newBalance,
                        description: `Аренда товара: ${product.name} (${daysCount} дн.)`
                    }
                });

                // Создаём аренду
                const endDate = new Date();
                endDate.setDate(endDate.getDate() + daysCount);

                const rental = await tx.rental.create({
                    data: {
                        userId,
                        productId: parseInt(productId),
                        daysCount,
                        totalPrice,
                        deposit,
                        endDate,
                        status: 'active'
                    },
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                price: true,
                                image: true,
                                imageFilename: true
                            }
                        }
                    }
                });

                return { rental, newBalance };
            });

            res.json({
                message: 'Аренда успешно оформлена',
                rental: {
                    ...result.rental,
                    product: {
                        ...result.rental.product,
                        image: result.rental.product.imageFilename ? `/uploads/${result.rental.product.imageFilename}` : result.rental.product.image
                    },
                    pricePerDay: parseFloat(product.price),
                    totalPrice: result.rental.totalPrice,
                    deposit: result.rental.deposit
                },
                balance: result.newBalance
            });

        } catch (error) {
            console.error('Create rental error:', error);
            res.status(500).json({ error: 'Ошибка сервера при оформлении аренды: ' + error.message });
        }
    }
);

// POST /api/rentals/:id/return - Вернуть товар
router.post('/:id/return', authenticateToken, async (req, res) => {
    try {
        const rentalId = parseInt(req.params.id);
        const userId = req.user.id;

        // Находим аренду
        const rental = await prisma.rental.findFirst({
            where: { id: rentalId, userId },
            include: {
                product: {
                    select: {
                        name: true
                    }
                }
            }
        });

        if (!rental) {
            return res.status(404).json({ error: 'Аренда не найдена' });
        }

        if (rental.status !== 'active') {
            return res.status(400).json({ error: 'Аренда уже завершена' });
        }

        // Проверяем просрочку
        const now = new Date();
        const isOverdue = now > rental.endDate;

        // Возвращаем залог если нет просрочки
        let depositRefund = 0;
        if (!isOverdue) {
            depositRefund = rental.deposit;
        }

        // Обновляем аренду в транзакции
        await prisma.$transaction(async (tx) => {
            // Обновляем статус аренды
            await tx.rental.update({
                where: { id: rentalId },
                data: {
                    status: isOverdue ? 'overdue' : 'completed',
                    depositReturned: !isOverdue
                }
            });

            // Возвращаем залог
            if (depositRefund > 0) {
                const user = await tx.user.findUnique({
                    where: { id: userId }
                });

                const balanceBefore = user.balance;
                const newBalance = balanceBefore + depositRefund;

                await tx.user.update({
                    where: { id: userId },
                    data: { balance: newBalance }
                });

                await tx.transaction.create({
                    data: {
                        userId,
                        type: 'deposit_refund',
                        amount: depositRefund,
                        balanceBefore,
                        balanceAfter: newBalance,
                        description: `Возврат залога: ${rental.product.name}`
                    }
                });
            }
        });

        res.json({
            message: isOverdue ? 'Товар возвращён с просрочкой. Залог не возвращён.' : 'Товар успешно возвращён. Залог возвращён на баланс.',
            depositRefund,
            isOverdue
        });

    } catch (error) {
        console.error('Return rental error:', error);
        res.status(500).json({ error: 'Ошибка сервера при возврате товара: ' + error.message });
    }
});

// POST /api/rentals/:id/extend - Продлить аренду
router.post('/:id/extend',
    authenticateToken,
    body('daysCount').isInt({ min: 1 }).withMessage('Срок продления должен быть от 1 дня'),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { daysCount } = req.body;
            const rentalId = parseInt(req.params.id);
            const userId = req.user.id;

            // Находим аренду
            const rental = await prisma.rental.findFirst({
                where: { id: rentalId, userId },
                include: {
                    product: true
                }
            });

            if (!rental) {
                return res.status(404).json({ error: 'Аренда не найдена' });
            }

            if (rental.status !== 'active') {
                return res.status(400).json({ error: 'Нельзя продлить завершённую аренду' });
            }

            // Рассчитываем стоимость продления
            const pricePerDay = parseFloat(rental.product.price);
            const extensionCost = pricePerDay * daysCount;

            // Проверяем баланс
            const user = await prisma.user.findUnique({
                where: { id: userId }
            });

            if (user.balance < extensionCost) {
                return res.status(400).json({
                    error: 'Недостаточно средств для продления',
                    balance: user.balance,
                    required: extensionCost
                });
            }

            // Продлеваем аренду в транзакции
            await prisma.$transaction(async (tx) => {
                // Списываем деньги
                const balanceBefore = user.balance;
                const newBalance = balanceBefore - extensionCost;

                await tx.user.update({
                    where: { id: userId },
                    data: { balance: newBalance }
                });

                await tx.transaction.create({
                    data: {
                        userId,
                        type: 'rental_extension',
                        amount: extensionCost,
                        balanceBefore,
                        balanceAfter: newBalance,
                        description: `Продление аренды: ${rental.product.name} (${daysCount} дн.)`
                    }
                });

                // Обновляем дату окончания
                const newEndDate = new Date(rental.endDate);
                newEndDate.setDate(newEndDate.getDate() + daysCount);

                await tx.rental.update({
                    where: { id: rentalId },
                    data: {
                        endDate: newEndDate,
                        daysCount: rental.daysCount + daysCount,
                        totalPrice: rental.totalPrice + extensionCost
                    }
                });
            });

            res.json({
                message: 'Аренда успешно продлена',
                extensionCost,
                newBalance: user.balance - extensionCost
            });

        } catch (error) {
            console.error('Extend rental error:', error);
            res.status(500).json({ error: 'Ошибка сервера при продлении аренды: ' + error.message });
        }
    }
);

export default router;
