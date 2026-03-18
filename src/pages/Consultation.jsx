import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

function Consultation() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        topic: '',
        message: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        alert(`Спасибо, ${formData.name}! Ваша заявка на консультацию отправлена.`);
        setFormData({ name: '', email: '', phone: '', topic: '', message: '' });
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <>
            <Header />
            <main className="container">
                <section className="popular-house">
                    <h1 className="popular-title">Онлайн консультация</h1>
                    <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <h2 className="card-title">Запишитесь на бесплатную консультацию</h2>
                        <p className="card-text">
                            Наши эксперты помогут вам с выбором техники или ответят на все вопросы
                        </p>
                        <form onSubmit={handleSubmit} className="modal-form" style={{ width: '100%' }}>
                            <input
                                type="text"
                                name="name"
                                placeholder="Ваше имя"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                            <input
                                type="email"
                                name="email"
                                placeholder="Ваша почта"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                            <input
                                type="tel"
                                name="phone"
                                placeholder="Ваш телефон"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                            <select
                                name="topic"
                                value={formData.topic}
                                onChange={handleChange}
                                style={{
                                    padding: '14px 18px',
                                    fontSize: '1em',
                                    border: '2px solid var(--color-border)',
                                    borderRadius: 'var(--border-radius)',
                                    backgroundColor: 'var(--color-bg)',
                                    color: 'var(--color-white)',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="">Выберите тему консультации</option>
                                <option value="sell">Продажа техники</option>
                                <option value="rent">Аренда техники</option>
                                <option value="buy">Покупка техники</option>
                                <option value="other">Другое</option>
                            </select>
                            <textarea
                                name="message"
                                placeholder="Опишите ваш вопрос"
                                value={formData.message}
                                onChange={handleChange}
                                style={{ minHeight: '120px', resize: 'vertical' }}
                            />
                            <button type="submit" className="button-buy" style={{ width: '100%' }}>
                                Отправить заявку
                            </button>
                        </form>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}

export default Consultation;
