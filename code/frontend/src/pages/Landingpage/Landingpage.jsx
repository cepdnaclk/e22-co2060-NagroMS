import React from 'react';
import imageFallback from './assets/images/imagefallback.jpg';

import farmImg from './assets/images/farm.png';
import tractorImg from './assets/images/tractor.png';
import expertImg from './assets/images/expert.png';
import phoneImg from './assets/images/phone.png';

import produceImg from './assets/images/produce.jpg';
import equipmentImg from './assets/images/equipment.jpg';
import technologyImg from './assets/images/technology.jpg';

import coverImg from './assets/images/cover.png';

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────
   3D Feature Card  (big image on top)
───────────────────────────────────────────── */
function FeatureCard({ img, imgAlt, title, description }) {
  const [tilt, setTilt] = React.useState({ rx: 0, ry: 0 });
  const [hovered, setHovered] = React.useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    setTilt({
      rx: ((y - cy) / cy) * -10,
      ry: ((x - cx) / cx) * 10,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ rx: 0, ry: 0 });
    setHovered(false);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: hovered
          ? '1px solid rgba(34,197,94,0.55)'
          : '1px solid rgba(34,197,94,0.15)',
        borderRadius: 24,
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative',
        transformStyle: 'preserve-3d',
        transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateY(${hovered ? '-10px' : '0'})`,
        transition: hovered
          ? 'border-color 0.2s, box-shadow 0.2s'
          : 'transform 0.6s cubic-bezier(.23,1,.32,1), border-color 0.3s, box-shadow 0.3s',
        boxShadow: hovered
          ? '0 30px 60px rgba(0,0,0,0.5), 0 0 40px rgba(34,197,94,0.2)'
          : '0 8px 32px rgba(0,0,0,0.3)',
      }}
    >
      {/* big image */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 240,
          overflow: 'hidden',
          background: 'linear-gradient(135deg,rgba(5,46,22,0.95),rgba(3,20,10,0.98))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ImageWithFallback
          src={img}
          alt={imgAlt}
          style={{
            width: '88%',
            height: '88%',
            objectFit: 'contain',
            display: 'block',
            transform: hovered ? 'scale(1.08)' : 'scale(1)',
            transition: 'transform 0.5s cubic-bezier(.23,1,.32,1)',
            filter: hovered
              ? 'drop-shadow(0 0 18px rgba(34,197,94,0.45))'
              : 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 60,
            background: 'linear-gradient(to top,rgba(3,20,10,0.9),transparent)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(34,197,94,0.07)',
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.3s',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 1,
            background: 'rgba(34,197,94,0.18)',
          }}
        />
      </div>

      {/* text content */}
      <div style={{ padding: '22px 24px 26px' }}>
        <h3
          style={{
            color: 'white',
            fontSize: 18,
            fontWeight: 700,
            marginBottom: 10,
            letterSpacing: '-0.3px',
          }}
        >
          {title}
        </h3>
        <p
          style={{
            color: 'rgba(255,255,255,0.55)',
            fontSize: 14,
            lineHeight: 1.7,
            margin: 0,
          }}
        >
          {description}
        </p>
      </div>

      {/* corner arrow */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: 'rgba(0,0,0,0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: hovered ? '#4ade80' : 'rgba(255,255,255,0.6)',
          fontSize: 15,
          transition: 'transform 0.3s, color 0.3s',
          transform: hovered ? 'translate(3px,-3px)' : 'translate(0,0)',
        }}
      >
        ↗
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Floating Hero Card (mini dashboard cards)
───────────────────────────────────────────── */
function FloatingCard({ style, children }) {
  return (
    <div
      style={{
        position: 'absolute',
        background: 'rgba(255,255,255,0.07)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(34,197,94,0.25)',
        borderRadius: 20,
        padding: '18px 20px',
        color: 'white',
        boxShadow:
          '0 0 40px rgba(34,197,94,0.1), inset 0 1px 0 rgba(255,255,255,0.1)',
        zIndex: 2,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Gallery Card
───────────────────────────────────────────── */
function GalleryCard({ src, alt, label }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        borderRadius: 24,
        overflow: 'hidden',
        transform: hovered
          ? 'perspective(800px) rotateX(0deg) translateY(-8px)'
          : 'perspective(800px) rotateX(4deg)',
        transition: 'transform 0.5s cubic-bezier(.23,1,.32,1), box-shadow 0.4s',
        boxShadow: hovered
          ? '0 40px 80px rgba(0,0,0,0.5), 0 0 40px rgba(34,197,94,0.15)'
          : '0 20px 50px rgba(0,0,0,0.4)',
        cursor: 'pointer',
      }}
    >
      <ImageWithFallback
        src={src}
        alt={alt}
        style={{ width: '100%', height: 260, objectFit: 'cover', display: 'block' }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '40px 22px 22px',
          background: 'linear-gradient(to top,rgba(3,37,16,0.92),transparent)',
          color: 'white',
          fontWeight: 800,
          fontSize: 22,
          letterSpacing: '-0.5px',
        }}
      >
        {label}
      </div>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          border: hovered ? '2px solid rgba(34,197,94,0.4)' : '2px solid transparent',
          borderRadius: 24,
          transition: 'border-color 0.3s',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Landing Page
───────────────────────────────────────────── */
function LandingPage({ onNavigate }) {
  const nav = (page) => onNavigate && onNavigate(page);
  const scrollTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  const features = [
    {
      img: farmImg,
      imgAlt: 'Direct farm sales',
      title: 'Direct Farm Sales',
      description:
        'Sell produce directly to customers with secure payment processing and real-time order tracking.',
    },
    {
      img: tractorImg,
      imgAlt: 'Equipment rental',
      title: 'Equipment Rental',
      description:
        'Access modern farming equipment whenever you need it with flexible rental terms and delivery.',
    },
    {
      img: expertImg,
      imgAlt: 'Expert guidance',
      title: 'Expert Guidance',
      description:
        'Connect with certified agricultural experts for personalised farming advice and crop tips.',
    },
    {
      img: phoneImg,
      imgAlt: 'Weather alerts',
      title: 'Weather Alerts',
      description:
        'Get real-time weather updates, forecasts, and customised alerts for your specific region.',
    },
  ];

  const stats = [
    { num: '5,200+', label: 'Registered Farmers' },
    { num: '320+', label: 'Agricultural Experts' },
    { num: '18,000+', label: 'Produce Listings' },
    { num: '94%', label: 'Farmer Satisfaction' },
  ];

  const gallery = [
    { src: produceImg, alt: 'Fresh produce', label: 'Fresh Local Produce' },
    { src: equipmentImg, alt: 'Equipment', label: 'Modern Equipment' },
    { src: technologyImg, alt: 'Technology', label: 'Smart Technology' },
  ];

  /* ── styles ── */
  const S = {
    page: {
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      background: 'linear-gradient(160deg,#021a0c 0%,#032e14 45%,#043a18 75%,#021a0c 100%)',
      minHeight: '100vh',
      overflowX: 'hidden',
      position: 'relative',
    },
    orb: (w, h, top, left, right, bottom, color, delay) => ({
      position: 'absolute',
      width: w,
      height: h,
      top,
      left,
      right,
      bottom,
      borderRadius: '50%',
      background: `radial-gradient(circle, ${color}, transparent 70%)`,
      filter: 'blur(60px)',
      pointerEvents: 'none',
      animation: `nagPulse 7s ease-in-out ${delay} infinite`,
    }),
    gridBg: {
      position: 'absolute',
      inset: 0,
      backgroundImage:
        'linear-gradient(rgba(34,197,94,0.05) 1px,transparent 1px),' +
        'linear-gradient(90deg,rgba(34,197,94,0.05) 1px,transparent 1px)',
      backgroundSize: '44px 44px',
      pointerEvents: 'none',
    },
    header: {
      background: 'rgba(2,26,12,0.75)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(34,197,94,0.12)',
      padding: '16px 48px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    },
    logoMark: {
      width: 38,
      height: 38,
      borderRadius: 10,
      background: 'linear-gradient(135deg,#22c55e,#15803d)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 20,
      boxShadow: '0 0 20px rgba(34,197,94,0.45)',
      marginRight: 10,
    },
    logoText: {
      color: '#4ade80',
      fontSize: 22,
      fontWeight: 800,
      letterSpacing: 1,
      margin: 0,
    },
    navLink: (hov) => ({
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: hov ? '#4ade80' : 'rgba(255,255,255,0.65)',
      fontSize: 15,
      fontWeight: 500,
      transition: 'color 0.2s',
      padding: '6px 4px',
    }),
    btnPrimary: {
      padding: '11px 28px',
      background: 'linear-gradient(135deg,#22c55e,#15803d)',
      color: 'white',
      border: 'none',
      borderRadius: 28,
      cursor: 'pointer',
      fontSize: 15,
      fontWeight: 700,
      boxShadow: '0 0 24px rgba(34,197,94,0.4)',
      transition: 'transform 0.2s, box-shadow 0.2s',
    },
    sectionLabel: {
      textAlign: 'center',
      color: '#4ade80',
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: 3,
      textTransform: 'uppercase',
      marginBottom: 12,
    },
    sectionTitle: {
      textAlign: 'center',
      color: 'white',
      fontSize: 38,
      fontWeight: 800,
      marginBottom: 48,
      letterSpacing: '-0.5px',
    },
  };

  /* nav link hover state */
  const [hovLink, setHovLink] = React.useState(null);
  const [hovBtn, setHovBtn] = React.useState(false);

  return (
    <div style={S.page}>
      {/* keyframe injection */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&display=swap');
        @keyframes nagPulse {
          0%,100%{opacity:0.45;transform:scale(1)}
          50%{opacity:0.75;transform:scale(1.1)}
        }
        @keyframes nagFloat {
          0%,100%{transform:translateY(0px)}
          50%{transform:translateY(-14px)}
        }
        @keyframes nagFloatSlow {
          0%,100%{transform:translateY(0px) rotate(0deg)}
          50%{transform:translateY(-9px) rotate(2deg)}
        }
        @keyframes nagSlideUp {
          from{opacity:0;transform:translateY(32px)}
          to{opacity:1;transform:translateY(0)}
        }
        .nag-float  { animation: nagFloat 5s ease-in-out infinite; }
        .nag-floatS { animation: nagFloatSlow 7s ease-in-out infinite 1s; }
        .nag-floatM { animation: nagFloatSlow 6s ease-in-out infinite 0.5s; }
        .nag-floatL { animation: nagFloat 8s ease-in-out infinite 2s; }
        .nag-slide  { animation: nagSlideUp 0.8s ease forwards; }
        .nag-btn:hover { transform: translateY(-3px) scale(1.03) !important; box-shadow: 0 0 40px rgba(34,197,94,0.6) !important; }
        .nag-outline:hover { background: rgba(255,255,255,0.12) !important; border-color: rgba(255,255,255,0.4) !important; transform: translateY(-2px) !important; }
      `}</style>

      {/* background decorations */}
      <div style={S.gridBg} />
      <div style={S.orb(420, 420, -120, -120, undefined, undefined, 'rgba(34,197,94,0.22)', '0s')} />
      <div style={S.orb(300, 300, 180, undefined, 40, undefined, 'rgba(132,204,22,0.18)', '2s')} />
      <div style={S.orb(260, 260, undefined, 180, undefined, 80, 'rgba(21,128,61,0.28)', '1s')} />
      <div style={S.orb(200, 200, 320, undefined, undefined, undefined, 'rgba(74,222,128,0.12)', '3s')} />

      {/* ── HEADER ── */}
      <header style={S.header}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={S.logoMark}>🌿</div>
          <h1 style={S.logoText}>NagroMS</h1>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          {['features', 'about', 'contact'].map((id) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              onMouseEnter={() => setHovLink(id)}
              onMouseLeave={() => setHovLink(null)}
              style={S.navLink(hovLink === id)}
            >
              {id.charAt(0).toUpperCase() + id.slice(1)}
            </button>
          ))}
          <button
            className="nag-btn"
            onClick={() => nav('login')}
            style={S.btnPrimary}
          >
            Login
          </button>
        </nav>
      </header>

      {/* ── HERO ── */}
      <section
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '80px 48px',
          display: 'flex',
          alignItems: 'center',
          gap: 72,
          flexWrap: 'wrap',
          position: 'relative',
        }}
      >
        {/* left text */}
        <div className="nag-slide" style={{ flex: 1, minWidth: 340 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 18px',
              background: 'rgba(34,197,94,0.1)',
              border: '1px solid rgba(34,197,94,0.3)',
              borderRadius: 24,
              color: '#4ade80',
              fontSize: 13,
              fontWeight: 700,
              marginBottom: 28,
            }}
          >
            🌱 Smart Agriculture Platform
          </div>

          <h2
            style={{
              fontSize: 58,
              fontWeight: 900,
              lineHeight: 1.05,
              marginBottom: 22,
              color: 'white',
              letterSpacing: '-1.5px',
            }}
          >
            Empowering{' '}
            <span
              style={{
                background: 'linear-gradient(135deg,#4ade80,#86efac,#22c55e)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Sri Lankan
            </span>
            <br />
            Farmers with
            <br />
            Technology
          </h2>

          <p
            style={{
              fontSize: 18,
              color: 'rgba(255,255,255,0.6)',
              lineHeight: 1.75,
              marginBottom: 40,
              maxWidth: 520,
            }}
          >
            Connect farmers, customers, and agricultural experts through a
            modern digital platform. Sell produce, rent equipment, get expert
            advice, and receive weather alerts.
          </p>

          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
            <button
              className="nag-btn"
              onClick={() => nav('signup')}
              style={{
                padding: '15px 40px',
                background: 'linear-gradient(135deg,#22c55e,#15803d)',
                color: 'white',
                border: 'none',
                borderRadius: 32,
                cursor: 'pointer',
                fontSize: 17,
                fontWeight: 800,
                boxShadow: '0 0 32px rgba(34,197,94,0.4)',
                transition: 'transform 0.2s,box-shadow 0.2s',
              }}
            >
              Get Started
            </button>
            <button
              className="nag-outline"
              onClick={() => nav('login')}
              style={{
                padding: '15px 40px',
                background: 'rgba(255,255,255,0.06)',
                color: 'rgba(255,255,255,0.9)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 32,
                cursor: 'pointer',
                fontSize: 17,
                fontWeight: 700,
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s',
              }}
            >
              Login
            </button>
          </div>
        </div>

        {/* right floating dashboard */}
        <div style={{ flex: 1.1, minWidth: 360, position: 'relative', height: 440, overflow: 'visible' }}>
          {/* main dashboard card */}
          <FloatingCard
            className="nag-float"
            style={{
              width: 220,
              top: -10,
              right: -20,
              transform: 'perspective(900px) rotateY(-6deg) rotateX(4deg)',
              animation: 'nagFloat 5s ease-in-out infinite',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg,#22c55e,#15803d)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  boxShadow: '0 0 16px rgba(34,197,94,0.4)',
                }}
              >
                🌾
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>Farm Dashboard</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>Real-time overview</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
              {[
                { label: 'Revenue', val: 'Rs 84k', clr: '#4ade80' },
                { label: 'Orders', val: '128', clr: '#a3e635' },
              ].map((c) => (
                <div
                  key={c.label}
                  style={{
                    flex: 1,
                    background: 'rgba(34,197,94,0.1)',
                    borderRadius: 10,
                    padding: '10px 12px',
                  }}
                >
                  <div style={{ fontSize: 10, color: c.clr, marginBottom: 2 }}>{c.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'white' }}>{c.val}</div>
                </div>
              ))}
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
              <div
                style={{
                  width: '72%',
                  height: '100%',
                  background: 'linear-gradient(90deg,#22c55e,#86efac)',
                  borderRadius: 2,
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>Monthly target</span>
              <span style={{ fontSize: 10, color: '#4ade80', fontWeight: 700 }}>72%</span>
            </div>
          </FloatingCard>

          {/* weather card */}
          <FloatingCard
            style={{
              width: 126,
              top: 30,
              left: -16,
              animation: 'nagFloatSlow 7s ease-in-out 1s infinite',
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 6 }}>🌦️</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginBottom: 2 }}>Weather</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#4ade80' }}>28°C</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>Partly cloudy</div>
          </FloatingCard>

          {/* equipment card */}
          <FloatingCard
            style={{
              width: 126,
              bottom: 50,
              right: -16,
              animation: 'nagFloatSlow 6s ease-in-out 0.5s infinite',
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 6 }}>🚜</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginBottom: 2 }}>Equipment</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#a3e635' }}>5 Active</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>2 available</div>
          </FloatingCard>

          {/* experts card */}
          <FloatingCard
            style={{
              width: 126,
              bottom: 10,
              left: -16,
              animation: 'nagFloat 8s ease-in-out 2s infinite',
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 6 }}>👨‍🌾</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginBottom: 2 }}>Experts Online</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#4ade80' }}>12 Live</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>Ask now</div>
          </FloatingCard>

          {/* cover image behind cards */}
          <ImageWithFallback
            src={coverImg}
            alt="Farmer working"
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              top: 0,
              left: 0,
              transform: 'perspective(1000px) rotateY(-6deg) rotateX(3deg)',
              borderRadius: 28,
              objectFit: 'cover',
              opacity: 0.55,
              border: '2px solid rgba(255,255,255,0.08)',
              zIndex: 0,
            }}
          />
          {/* dark edge vignette so cards stay readable */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 28,
              background:
                'radial-gradient(ellipse at center, transparent 30%, rgba(2,26,12,0.75) 100%)',
              zIndex: 1,
              pointerEvents: 'none',
            }}
          />
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ padding: '60px 48px', position: 'relative' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))',
            gap: 20,
            maxWidth: 900,
            margin: '0 auto',
          }}
        >
          {stats.map((s) => (
            <div
              key={s.label}
              style={{
                textAlign: 'center',
                padding: '32px 20px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(34,197,94,0.12)',
                borderRadius: 22,
              }}
            >
              <div
                style={{
                  fontSize: 40,
                  fontWeight: 900,
                  background: 'linear-gradient(135deg,#4ade80,#86efac)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  letterSpacing: '-1px',
                }}
              >
                {s.num}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, marginTop: 6 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: '80px 48px', position: 'relative' }}>
        <p style={S.sectionLabel}>Platform Features</p>
        <h2 style={S.sectionTitle}>Everything Farmers Need</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))',
            gap: 24,
            maxWidth: 1200,
            margin: '0 auto',
          }}
        >
          {features.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </section>

      {/* ── GALLERY ── */}
      <section style={{ padding: '60px 48px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
            gap: 28,
            maxWidth: 1200,
            margin: '0 auto',
          }}
        >
          {gallery.map((g) => (
            <GalleryCard key={g.label} {...g} />
          ))}
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" style={{ padding: '80px 48px', textAlign: 'center', position: 'relative' }}>
        <p style={S.sectionLabel}>Our Mission</p>
        <h2
          style={{
            color: 'white',
            fontSize: 38,
            fontWeight: 800,
            marginBottom: 22,
            letterSpacing: '-0.5px',
          }}
        >
          About NagroMS
        </h2>
        <p
          style={{
            color: 'rgba(255,255,255,0.6)',
            maxWidth: 700,
            margin: '0 auto 36px',
            fontSize: 18,
            lineHeight: 1.85,
          }}
        >
          NagroMS connects farmers, customers, and agricultural experts through
          modern technology to improve productivity, market access, and farming
          decisions across Sri Lanka. We believe every farmer deserves the tools
          and knowledge that can transform their livelihood.
        </p>
        <button
          className="nag-btn"
          onClick={() => nav('signup')}
          style={{
            padding: '14px 38px',
            background: 'linear-gradient(135deg,#22c55e,#15803d)',
            color: 'white',
            border: 'none',
            borderRadius: 30,
            cursor: 'pointer',
            fontSize: 16,
            fontWeight: 800,
            boxShadow: '0 0 28px rgba(34,197,94,0.4)',
            transition: 'transform 0.2s,box-shadow 0.2s',
          }}
        >
          Join the Platform
        </button>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" style={{ padding: '60px 48px', textAlign: 'center' }}>
        <p style={S.sectionLabel}>Get in Touch</p>
        <h2 style={S.sectionTitle}>Contact Us</h2>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 20,
            flexWrap: 'wrap',
          }}
        >
          {[
            { icon: '📧', label: 'Email', val: 'nagroms16@gmail.com' },
            { icon: '📞', label: 'Phone', val: '+94 11 234 5678' },
            { icon: '📍', label: 'Location', val: 'Kandy, Sri Lanka' },
          ].map((c) => (
            <div
              key={c.label}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(34,197,94,0.15)',
                borderRadius: 20,
                padding: '24px 36px',
                minWidth: 200,
              }}
            >
              <div
                style={{
                  color: '#4ade80',
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  marginBottom: 10,
                }}
              >
                {c.icon} {c.label}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15 }}>{c.val}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        style={{
          background: 'rgba(0,0,0,0.45)',
          borderTop: '1px solid rgba(34,197,94,0.1)',
          padding: '36px 48px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            color: '#4ade80',
            fontSize: 20,
            fontWeight: 800,
            marginBottom: 8,
          }}
        >
          🌿 NagroMS
        </div>
        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
          © 2026 NagroMS. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
