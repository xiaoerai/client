import './index.scss'

interface HeroProps {
  title: string
  subtitle?: string
  imageUrl: string
}

export default function Hero({ title, subtitle, imageUrl }: HeroProps) {
  return (
    <div className="hero">
      <img className="hero-image" src={imageUrl} alt="hero" />
      <div className="hero-overlay" />
      <div className="hero-content">
        <span className="hero-welcome">WELCOME TO</span>
        <span className="hero-title">{title}</span>
        {subtitle && <span className="hero-subtitle">{subtitle}</span>}
      </div>
    </div>
  )
}
