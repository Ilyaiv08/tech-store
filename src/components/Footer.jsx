import { useState } from 'react';

function Footer() {
    const [email, setEmail] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        alert(`Спасибо! Заявка отправлена на почту: ${email}`);
        setEmail('');
    };

    return (
        <section className="footer container">
            <div className="footer-form">
                <h1>Оставьте заявку, указав свою почту</h1>
                <form onSubmit={handleSubmit} className="email-form">
                    <input
                        type="email"
                        placeholder="Введите вашу почту"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <button type="submit">Отправить</button>
                </form>
            </div>
        </section>
    );
}

export default Footer;
