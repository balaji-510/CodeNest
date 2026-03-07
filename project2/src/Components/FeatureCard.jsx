import "../styles1/FeatureCard.css";

function FeatureCard({ img, title, description }) {
  return (
    <div className="featurecard scroll-reveal">
      <div className="featurecard-img">
        <img src={img} alt={title} className="feature-img" />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

export default FeatureCard;
