import Header from '../components/Header';
import Footer from '../components/Footer';

function Sell() {
    return (
        <>
            <Header />
            <main className="container">
                <section className="popular-house">
                    <h1 className="popular-title">Продать технику</h1>
                    <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <h2 className="card-title">Оставьте заявку на продажу</h2>
                        <p className="card-text">
                            Заполните форму, и мы свяжемся с вами для оценки вашей техники
                        </p>
                        <form className="email-form" style={{ flexDirection: 'column', width: '100%' }}>
                            <input
                                type="text"
                                placeholder="Название техники"
                                style={{ width: '100%', marginBottom: '10px' }}
                            />
                            <input
                                type="text"
                                placeholder="Модель"
                                style={{ width: '100%', marginBottom: '10px' }}
                            />
                            <input
                                type="text"
                                placeholder="Состояние"
                                style={{ width: '100%', marginBottom: '10px' }}
                            />
                            <input
                                type="email"
                                placeholder="Ваша почта"
                                style={{ width: '100%', marginBottom: '10px' }}
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

export default Sell;
