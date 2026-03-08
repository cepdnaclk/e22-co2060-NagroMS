import React from 'react';
import imageFallback from './assets/images/imagefallback.jpg';

// Feature Card icons
import farmImg from './assets/images/farm.png';
import tractorImg from './assets/images/tractor.png';
import expertImg from './assets/images/expert.png';
import phoneImg from './assets/images/phone.png';

//Visual Section images 
import produceImg from './assets/images/produce.jpg';
import equipmentImg from './assets/images/equipment.jpg';
import technologyImg from './assets/images/technology.jpg';

import coverImg from './assets/images/cover.png';

function ImageWithFallback({ src, alt, style }) {
  const [imgSrc, setImgSrc] = React.useState(src);

  return (
    <img
      src={imgSrc}
      alt={alt}
      style={style}
      onError={() => setImgSrc(imageFallback)}
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
      {/* Directly show the image */}
      {icon && (
        <div style={{ marginBottom: '12px' }}>
          {icon}
        </div>
      )}
      
      <h2 style={{ color: '#1a7f37', marginBottom: '8px' }}>{title}</h2>
      <p style={{ fontSize: '16px', color: '#555' }}>{description}</p>
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
              fontSize: '16px',       // default font size
              padding: '8px 12px',
           
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
              fontSize: '16px',       // default font size
              padding: '8px 12px',
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
              fontSize: '16px',       // default font size
              padding: '8px 12px',
            }}
          >
            Contact
          </button>

          <button
            onClick={() => handleNavigate('login')}
            style={{
              padding: '12px 24px',
              color: '#1a7f37',
              border: '1px solid #1a7f37',
              borderRadius: '8px',
              background: 'white',
              cursor: 'pointer',
              fontSize: '16px',
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
            fontSize: '21px',
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
              fontSize: '16px',       // default font size
  
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
              fontSize: '16px',       // default font size
  
            }}
          >
            Login
          </button>
        </div>

        <div style={{ marginTop: '48px' }}>
          <ImageWithFallback
            src={coverImg }
            alt="Farmer working"
            style={{
              width: '100%',
              height: 'auto',
              borderRadius: '16px',
              maxHeight: '500px',
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
            icon={<img src={farmImg} alt="Farm" style={{ width: '250px', height: '150px' }} />}
            title="Direct Farm Sales"
            description="Farmers can sell produce directly to customers with secure payment processing"
          />
          <FeatureCard
            icon={<img src={tractorImg} alt="Tractor" style={{ width: '250px', height: '150px' }} />}
            title="Equipment Rental"
            description="Access modern farming equipment when you need it"
          />
          <FeatureCard
            icon={<img src={expertImg} alt="Expert" style={{ width: '250px', height: '150px' }} />}
            title="Expert Guidance"
            description="Connect with agricultural experts for advice"
          />
          <FeatureCard
            icon={<img src={phoneImg} alt="Phone" style={{ width: '250px', height: '150px' }} />}
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
              src: produceImg,
              text: 'Fresh Local Produce',
            },
            {
              src: equipmentImg,
              text: 'Modern Equipment',
            },
            {
              src: technologyImg,
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
                  fontSize : ' 24px',
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
        <p style={{ color: '#555', fontSize: '18px', lineHeight: '2' }}>
          📧 Email: nagroms16@gmail.com <br />
          📞 Phone: +94 11 234 5678 <br />
          📍 Kandy, Sri Lanka
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