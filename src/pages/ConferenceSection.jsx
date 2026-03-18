function ConferenceSection() {
    return (
        <section className="conf container">
            <div className="conf-info">
                <div className="conf-image">
                    <img
                        src="/images/125cbf43-414b-4d07-802a-e6a205871c3e.jpg"
                        alt="Конференция"
                        className="conf-images"
                    />
                </div>
                <div className="conf-text">
                    <h2 className="conf-title">
                        Бесперебойное соединение продавцов, покупателей и арендаторов техники
                    </h2>
                    <p>
                        Мы создаём бесперебойное соединение продавцов, покупателей и арендаторов техники,
                        обеспечивая плавное и эффективное взаимодействие на каждом этапе сделки. Наши решения
                        помогают быстро находить клиентов, а покупателям и продавцам — легко обмениваться
                        информацией и совершать сделки. Благодаря современным технологиям и поддержке, вы
                        сможете заключать выгодные соглашения быстрее и проще.
                    </p>
                    <button className="conf-button">Записаться на конференцию</button>
                </div>
            </div>
        </section>
    );
}

export default ConferenceSection;
