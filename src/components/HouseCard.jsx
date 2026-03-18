function HouseCard({ image, title, price, status, specs, onAddToCart, isRentalButton }) {
    const buttonText = isRentalButton ? 'Аренда' : 'В корзину';

    return (
        <div className="card-house" style={{ paddingBottom: onAddToCart ? '70px' : '20px', position: 'relative' }}>
            <img src={image} alt={title} className="card-house-images" />
            <h2 className="card-house-title">{title}</h2>
            <div className="house-price-status">
                <p className="house-price">{price}</p>
                <span className="house-status">{status}</span>
            </div>
            <div className="house-info">
                {specs.map((spec, index) => (
                    <p key={index}>{spec}</p>
                ))}
            </div>
            {onAddToCart && (
                <button
                    type="button"
                    onClick={onAddToCart}
                    style={{
                        position: 'absolute',
                        bottom: '15px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '80%',
                        padding: '10px',
                        backgroundColor: isRentalButton ? '#3b82f6' : 'var(--color-accent)',
                        color: 'var(--color-dark)',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        fontSize: '14px'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = isRentalButton ? '#2563eb' : 'var(--color-accent-hover)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = isRentalButton ? '#3b82f6' : 'var(--color-accent)'}
                >
                    {buttonText}
                </button>
            )}
        </div>
    );
}

export default HouseCard;
