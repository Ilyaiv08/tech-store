function FeatureCard({ icon, title, text, buttonText, buttonClass, onClick }) {
    return (
        <div className="card">
            <img src={icon} alt="Иконка" className="card-icon" />
            <h2 className="card-title">{title}</h2>
            <p className="card-text">{text}</p>
            <button className={buttonClass} onClick={onClick}>{buttonText}</button>
        </div>
    );
}

export default FeatureCard;
