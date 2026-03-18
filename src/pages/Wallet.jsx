import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { walletAPI } from '../api/client';
import Header from '../components/Header';
import Footer from '../components/Footer';

const PRESET_AMOUNTS = [100, 500, 1000, 5000, 10000];

function Wallet() {
    const navigate = useNavigate();
    const { user, balance, loadBalance } = useAuth();
    const [amount, setAmount] = useState('');
    const [customAmount, setCustomAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handlePresetClick = (presetAmount) => {
        setAmount(presetAmount.toString());
        setCustomAmount(presetAmount.toString()); // Устанавливаем значение в поле ввода
        setError(null);
        setSuccess(null);
    };

    const handleCustomAmountChange = (e) => {
        const value = e.target.value;
        setCustomAmount(value);
        setAmount(''); // Сбрасываем выбор пресета
        setError(null);
        setSuccess(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const depositAmount = parseFloat(amount || customAmount);

        if (!depositAmount || depositAmount < 1) {
            setError('Введите сумму от $1');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const data = await walletAPI.deposit(depositAmount);
            setSuccess(`Баланс успешно пополнен на $${depositAmount}`);
            loadBalance();
            setAmount('');
            setCustomAmount('');
        } catch (err) {
            setError(err.message || 'Ошибка при пополнении баланса');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <>
                <Header />
                <main style={{ minHeight: 'calc(100vh - 200px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="modal-content" style={{ margin: '40px auto', textAlign: 'center' }}>
                        <h2 className="modal-title">Доступ ограничен</h2>
                        <p style={{ color: 'var(--color-muted)', marginBottom: '20px' }}>
                            Для управления балансом необходимо войти в систему
                        </p>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <button onClick={() => navigate('/login')} className="button-login">
                                Войти
                            </button>
                            <button onClick={() => navigate('/register')} className="button-reg">
                                Регистрация
                            </button>
                        </div>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <main style={{ minHeight: 'calc(100vh - 200px)', padding: '40px 0' }}>
                <div className="container">
                    <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '30px', textAlign: 'center' }}>
                        💰 Мой кошелёк
                    </h1>

                    {/* Баланс */}
                    <div style={{
                        backgroundColor: 'var(--color-surface)',
                        borderRadius: 'var(--border-radius-lg)',
                        padding: '40px',
                        textAlign: 'center',
                        border: '1px solid var(--color-border)',
                        marginBottom: '30px',
                        maxWidth: '500px',
                        marginInline: 'auto'
                    }}>
                        <p style={{ color: 'var(--color-muted)', marginBottom: '10px' }}>Текущий баланс</p>
                        <p style={{ fontSize: '48px', fontWeight: '700', color: 'var(--color-accent)', margin: 0 }}>
                            ${balance?.toFixed(2) || '0.00'}
                        </p>
                    </div>

                    {/* Пополнение */}
                    <div style={{
                        backgroundColor: 'var(--color-surface)',
                        borderRadius: 'var(--border-radius-lg)',
                        padding: '30px',
                        border: '1px solid var(--color-border)',
                        maxWidth: '500px',
                        marginInline: 'auto'
                    }}>
                        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>
                            Пополнить баланс
                        </h2>

                        {error && (
                            <div style={{
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid #ef4444',
                                borderRadius: '8px',
                                padding: '12px',
                                marginBottom: '16px',
                                color: '#ef4444'
                            }}>
                                {error}
                            </div>
                        )}

                        {success && (
                            <div style={{
                                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                border: '1px solid #22c55e',
                                borderRadius: '8px',
                                padding: '12px',
                                marginBottom: '16px',
                                color: '#22c55e'
                            }}>
                                ✓ {success}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            {/* Предустановленные суммы */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
                                gap: '10px',
                                marginBottom: '20px'
                            }}>
                                {PRESET_AMOUNTS.map((preset) => (
                                    <button
                                        key={preset}
                                        type="button"
                                        onClick={() => handlePresetClick(preset)}
                                        style={{
                                            padding: '12px',
                                            backgroundColor: amount === preset.toString() 
                                                ? 'var(--color-accent)' 
                                                : 'var(--color-surface-alt)',
                                            color: amount === preset.toString() 
                                                ? 'var(--color-dark)' 
                                                : 'var(--color-white)',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontWeight: '600',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        ${preset}
                                    </button>
                                ))}
                            </div>

                            <div style={{ position: 'relative', marginBottom: '20px' }}>
                                <div style={{
                                    position: 'absolute',
                                    left: '15px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--color-muted)',
                                    fontSize: '18px'
                                }}>
                                    $
                                </div>
                                <input
                                    type="number"
                                    placeholder="Своя сумма"
                                    value={customAmount}
                                    onChange={handleCustomAmountChange}
                                    min="1"
                                    step="0.01"
                                    style={{
                                        width: '100%',
                                        padding: '14px 18px 14px 35px',
                                        fontSize: '16px',
                                        border: '2px solid var(--color-border)',
                                        borderRadius: 'var(--border-radius)',
                                        backgroundColor: 'var(--color-bg)',
                                        color: 'var(--color-white)',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading || (!amount && !customAmount)}
                                className="button-reg"
                                style={{ width: '100%', opacity: loading || (!amount && !customAmount) ? 0.5 : 1 }}
                            >
                                {loading ? 'Пополнение...' : 'Пополнить баланс'}
                            </button>
                        </form>
                    </div>

                    {/* История транзакций */}
                    <TransactionHistory />
                </div>
            </main>
            <Footer />
        </>
    );
}

// Компонент истории транзакций
function TransactionHistory() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTransactions();
    }, []);

    const loadTransactions = async () => {
        try {
            const data = await walletAPI.getTransactions();
            setTransactions(data.transactions || []);
        } catch (error) {
            console.error('Failed to load transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'deposit': return { text: 'Пополнение', color: '#22c55e' };
            case 'purchase': return { text: 'Покупка', color: '#f59e0b' };
            default: return { text: type, color: 'var(--color-muted)' };
        }
    };

    return (
        <div style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--border-radius-lg)',
            padding: '30px',
            border: '1px solid var(--color-border)',
            marginTop: '30px',
            maxWidth: '800px',
            marginInline: 'auto'
        }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>
                📋 История транзакций
            </h2>

            {loading && (
                <div style={{ textAlign: 'center', color: 'var(--color-muted)', padding: '20px' }}>
                    Загрузка...
                </div>
            )}

            {!loading && transactions.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--color-muted)', padding: '20px' }}>
                    Транзакций пока нет
                </div>
            )}

            {!loading && transactions.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {transactions.map((tx) => {
                        const typeInfo = getTypeLabel(tx.type);
                        const amount = parseFloat(tx.amount) || 0;
                        const balanceAfter = parseFloat(tx.balanceAfter || tx.balance_after) || 0;
                        
                        return (
                            <div
                                key={tx.id}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '15px',
                                    backgroundColor: 'var(--color-bg)',
                                    borderRadius: '8px',
                                    border: '1px solid var(--color-border)'
                                }}
                            >
                                <div>
                                    <p style={{
                                        fontWeight: '600',
                                        marginBottom: '5px',
                                        color: typeInfo.color
                                    }}>
                                        {typeInfo.text}
                                    </p>
                                    <p style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
                                        {new Date(tx.created_at).toLocaleString('ru-RU')}
                                    </p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{
                                        fontWeight: '700',
                                        color: tx.type === 'deposit' ? '#22c55e' : '#ef4444',
                                        marginBottom: '5px'
                                    }}>
                                        {tx.type === 'deposit' ? '+' : '-'}${Math.abs(amount).toFixed(2)}
                                    </p>
                                    <p style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
                                        Баланс: ${balanceAfter.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default Wallet;
