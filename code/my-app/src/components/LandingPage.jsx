import React from 'react';

// Simple image component with fallback
function ImageWithFallback({ src, alt, style }) {
  const [imgSrc, setImgSrc] = React.useState(src);
  return (
    <img
      src={imgSrc}
      alt={alt}
      style={style}
      onError={() =>
        setImgSrc(
          'https://via.placeholder.com/600x400?text=Image+Not+Found'
        )
      }
    />
  );
}

// Feature card component
function FeatureCard({ icon, title, description }) {
  return (
    <div
      style={{
        background: '#e6f4ea',
        borderRadius: '12px',
        padding: '16px',
        border: '1px solid #c6e0c6',
        textAlign: 'center',
        transition: '0.3s',
      }}
    >
      <div
        style={{
          background: '#fff',
          width: '64px',
          height: '64px',
          margin: '0 auto 12px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        {icon}
      </div>
      <h4 style={{ color: '#1a7f37', marginBottom: '8px' }}>{title}</h4>
      <p style={{ fontSize: '14px', color: '#555' }}>{description}</p>
    </div>
  );
}

// Landing Page
function LandingPage() {
  const handleNavigate = (page) => {
    alert(`Navigate to ${page}`);
  };

  return (
    <div style={{ fontFamily: 'sans-serif', background: '#f6fff5' }}>
      
      {/* Header */}
      <header
        style={{
          background: '#fff',
          borderBottom: '1px solid #c6e0c6',
          padding: '16px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <h1 style={{ color: '#1a7f37', margin: 0 }}>NagroMS</h1>
        <nav
          style={{
            display: 'flex',
            gap: '24px',
            alignItems: 'center',
          }}
        >
          <button
            onClick={() =>
              window.scrollTo(
                0,
                document.getElementById('features').offsetTop
              )
            }
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#1a7f37',
            }}
          >
            Features
          </button>

          <button
            onClick={() =>
              window.scrollTo(
                0,
                document.getElementById('about').offsetTop
              )
            }
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#1a7f37',
            }}
          >
            About
          </button>

          <button
            onClick={() =>
              window.scrollTo(
                0,
                document.getElementById('contact').offsetTop
              )
            }
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#1a7f37',
            }}
          >
            Contact
          </button>

          <button
            onClick={() => handleNavigate('login')}
            style={{
              padding: '8px 16px',
              color: '#1a7f37',
              border: '1px solid #1a7f37',
              borderRadius: '8px',
              background: 'white',
              cursor: 'pointer',
            }}
          >
            Login
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '64px 32px',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontSize: '48px',
            color: '#1a7f37',
            marginBottom: '24px',
          }}
        >
          Empowering Sri Lankan Farmers with Technology
        </h2>

        <p
          style={{
            fontSize: '20px',
            color: '#555',
            marginBottom: '32px',
            lineHeight: '1.6',
          }}
        >
          Connect farmers, customers, and agricultural experts through our
          modern platform. Access equipment, get weather alerts, and sell
          your produce directly to customers.
        </p>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <button
            style={{
              padding: '12px 32px',
              background: '#1a7f37',
              color: 'white',
              borderRadius: '8px',
              cursor: 'pointer',
              border: 'none',
            }}
          >
            Get Started
          </button>

          <button
            style={{
              padding: '12px 32px',
              background: 'white',
              color: '#1a7f37',
              border: '1px solid #1a7f37',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Login
          </button>
        </div>

        <div style={{ marginTop: '48px' }}>
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1760549255949-767d18981890?auto=format&fit=crop&w=1000&q=80"
            alt="Farmer working"
            style={{
              width: '100%',
              height: 'auto',
              borderRadius: '16px',
              maxHeight: '400px',
              objectFit: 'cover',
            }}
          />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ padding: '64px 32px' }}>
        <h3
          style={{
            color: '#1a7f37',
            textAlign: 'center',
            fontSize: '32px',
            marginBottom: '24px',
          }}
        >
          Platform Features
        </h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit,minmax(220px,1fr))',
            gap: '24px',
          }}
        >
          <FeatureCard
            icon="🌱"
            title="Direct Farm Sales"
            description="Farmers can sell produce directly to customers with secure payment processing"
          />
          <FeatureCard
            icon="🚜"
            title="Equipment Rental"
            description="Access modern farming equipment when you need it"
          />
          <FeatureCard
            icon="👨‍🌾"
            title="Expert Guidance"
            description="Connect with agricultural experts for advice"
          />
          <FeatureCard
            icon="📱"
            title="Weather Alerts"
            description="Get real-time weather updates and alerts"
          />
        </div>
      </section>

      {/* Visual Section */}
      <section style={{ padding: '64px 32px', background: '#ffffff' }}>
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
          }}
        >
          {[
            {
              src: 'https://images.unsplash.com/photo-1741515044901-58696421d24a?auto=format&fit=crop&w=800&q=80',
              text: 'Fresh Local Produce',
            },
            {
              src: 'https://images.unsplash.com/photo-1763416160482-c77fadd32d3f?auto=format&fit=crop&w=800&q=80',
              text: 'Modern Equipment',
            },
            {
              src: 'https://images.unsplash.com/photo-1768602182173-154eeedeed05?auto=format&fit=crop&w=800&q=80',
              text: 'Smart Technology',
            },
          ].map((item, index) => (
            <div
              key={index}
              style={{
                position: 'relative',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow:
                  '0 4px 12px rgba(0,0,0,0.1)',
              }}
            >
              <ImageWithFallback
                src={item.src}
                alt={item.text}
                style={{
                  width: '100%',
                  height: '250px',
                  objectFit: 'cover',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  width: '100%',
                  padding: '16px',
                  background:
                    'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
                  color: 'white',
                  fontWeight: 'bold',
                }}
              >
                {item.text}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section
        id="about"
        style={{ padding: '64px 32px', textAlign: 'center' }}
      >
        <h3 style={{ color: '#1a7f37', fontSize: '32px' }}>
          About NagroMS
        </h3>
        <p style={{ color: '#555', maxWidth: '700px', margin: '16px auto' }}>
          NagroMS connects farmers, customers, and experts through
          modern agricultural technology.
        </p>
      </section>

      {/* Contact */}
      <section
        id="contact"
        style={{ padding: '64px 32px', textAlign: 'center' }}
      >
        <h3 style={{ color: '#1a7f37', fontSize: '32px' }}>
          Contact Us
        </h3>
        <p style={{ color: '#555' }}>
          Email: info@nagroms.lk <br />
          Phone: +94 11 234 5678 <br />
          Colombo, Sri Lanka
        </p>
      </section>

      {/* Footer */}
      <footer
        style={{
          background: '#1a7f37',
          color: 'white',
          padding: '48px 32px',
          textAlign: 'center',
        }}
      >
        <h4>© 2026 NagroMS. All rights reserved.</h4>
      </footer>
    </div>
  );
}

export default LandingPage;