import { useNavigate } from 'react-router-dom';
import { Check, X, Crown, Zap, Bell, Palette, Shield, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Everything you need to find where to watch.',
    featured: false,
    features: [
      { text: 'Search any movie or TV show', included: true },
      { text: 'See streaming availability', included: true },
      { text: 'Watchlist (up to 50 titles)', included: true },
      { text: 'Country / region selector', included: true },
      { text: 'Ad-supported experience', included: true },
      { text: 'Platform change alerts', included: false },
      { text: 'Custom watchlist alerts', included: false },
      { text: 'Ad-free experience', included: false },
      { text: 'Priority support', included: false },
    ],
    cta: 'Current Plan',
    ctaStyle: 'btn-secondary',
  },
  {
    name: 'Pro',
    price: '$4.99',
    period: '/month',
    description: 'For serious watchers who never want to miss a thing.',
    featured: true,
    features: [
      { text: 'Everything in Free', included: true },
      { text: 'Unlimited watchlist', included: true },
      { text: 'Platform change alerts', included: true },
      { text: 'Custom watchlist alerts', included: true },
      { text: 'Ad-free experience', included: true },
      { text: 'Advanced filters & sorting', included: true },
      { text: 'Export watchlist data', included: true },
      { text: 'Priority support', included: true },
      { text: 'Early access to new features', included: true },
    ],
    cta: 'Upgrade to Pro',
    ctaStyle: 'btn-primary',
  },
];

const FEATURES_DETAIL = [
  {
    icon: <Bell size={24} />,
    title: 'Smart Alerts',
    description: 'Get notified when titles join or leave your favorite platforms.',
  },
  {
    icon: <Palette size={24} />,
    title: 'Ad-Free',
    description: 'Enjoy a clean, distraction-free browsing experience.',
  },
  {
    icon: <BarChart3 size={24} />,
    title: 'Analytics',
    description: 'Track your watching habits and discover patterns.',
  },
  {
    icon: <Shield size={24} />,
    title: 'Priority Support',
    description: 'Get help faster with dedicated Pro support.',
  },
];

export default function Premium() {
  const navigate = useNavigate();

  return (
    <div className="page-content">
      <div className="container">
        {/* Hero */}
        <motion.div
          className="premium-hero"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            color: 'var(--aurora-purple)',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: 'var(--space-lg)',
          }}>
            <Crown size={16} /> Premium
          </div>
          <h1>
            Upgrade to <span>Aura Pro</span>
          </h1>
          <p>Never miss where to watch. Get alerts, go ad-free, and unlock the full Aura experience.</p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="pricing-grid">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              className={`pricing-card ${plan.featured ? 'featured' : ''}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.5 }}
            >
              <div className="pricing-name">{plan.name}</div>
              <div className="pricing-price">
                {plan.price}
                <span> {plan.period}</span>
              </div>
              <div className="pricing-desc">{plan.description}</div>

              <ul className="pricing-features">
                {plan.features.map((feature, fi) => (
                  <li key={fi} className={feature.included ? '' : 'disabled'}>
                    {feature.included ? (
                      <Check size={16} />
                    ) : (
                      <X size={16} />
                    )}
                    {feature.text}
                  </li>
                ))}
              </ul>

              <button
                className={`btn ${plan.ctaStyle}`}
                style={{ width: '100%' }}
                onClick={() => {
                  if (plan.featured) {
                    // Stripe checkout would go here
                    alert('Stripe checkout coming soon! This is a demo.');
                  }
                }}
              >
                {plan.featured && <Zap size={16} />}
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Feature Details */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ padding: 'var(--space-2xl) 0' }}
        >
          <h2 style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
            Why go <span style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Pro</span>?
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 'var(--space-xl)',
          }}>
            {FEATURES_DETAIL.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                style={{
                  padding: 'var(--space-xl)',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  textAlign: 'center',
                }}
              >
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(139, 92, 246, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--aurora-purple)',
                  margin: '0 auto var(--space-md)',
                }}>
                  {feature.icon}
                </div>
                <h4 style={{ marginBottom: 'var(--space-xs)' }}>{feature.title}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ-like CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{
            textAlign: 'center',
            padding: 'var(--space-2xl)',
            borderRadius: 'var(--radius-xl)',
            background: 'linear-gradient(160deg, rgba(139, 92, 246, 0.08) 0%, rgba(6, 182, 212, 0.05) 100%)',
            border: '1px solid var(--border-subtle)',
            marginBottom: 'var(--space-2xl)',
          }}
        >
          <h3 style={{ marginBottom: 'var(--space-sm)' }}>Still have questions?</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>
            Try Aura free first. You can always upgrade later.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => navigate('/search')}>
              Start Exploring
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/auth')}>
              Create Account
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
