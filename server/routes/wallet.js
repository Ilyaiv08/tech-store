import express from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/wallet/balance - Получить баланс пользователя
router.get('/balance', authenticateToken, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, balance: true }
        });
        
        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }
        
        res.json({ balance: user.balance });
    } catch (error) {
        console.error('Get balance error:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// POST /api/wallet/deposit - Пополнить баланс
router.post('/deposit', 
    authenticateToken,
    body('amount')
        .notEmpty().withMessage('Сумма обязательна')
        .isFloat({ min: 1 }).withMessage('Сумма должна быть больше 0'),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { amount } = req.body;
            const userId = req.user.id;

            // Получаем текущий баланс
            const user = await prisma.user.findUnique({
                where: { id: userId }
            });
            
            const balanceBefore = user.balance;
            const newBalance = balanceBefore + parseFloat(amount);

            // Обновляем баланс и создаём транзакцию в одной транзакции
            const result = await prisma.$transaction(async (tx) => {
                await tx.user.update({
                    where: { id: userId },
                    data: { balance: newBalance }
                });

                const transaction = await tx.transaction.create({
                    data: {
                        userId,
                        type: 'deposit',
                        amount: parseFloat(amount),
                        balanceBefore,
                        balanceAfter: newBalance,
                        description: 'Пополнение баланса'
                    }
                });

                return { newBalance, transaction };
            });

            res.json({
                message: 'Баланс успешно пополнен',
                balance: result.newBalance,
                transaction: result.transaction
            });
        } catch (error) {
            console.error('Deposit error:', error);
            res.status(500).json({ error: 'Ошибка сервера при пополнении баланса' });
        }
    }
);

// GET /api/wallet/transactions - История транзакций
router.get('/transactions', authenticateToken, async (req, res) => {
    try {
        const transactions = await prisma.transaction.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        res.json({ transactions });
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

export default router;
