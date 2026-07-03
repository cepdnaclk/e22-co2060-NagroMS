export const colors = {
    // A more elegant, muted emerald/forest green palette
    green: '#1F5A2E', 
    greenLight: '#EAF3EC',
    greenMid: '#397B48',
    // Text colors
    text: '#2C3A32',
    textMuted: '#707A74',
    // Borders and backgrounds
    border: '#E8EBE9',
    bg: '#F8F9F8',
    white: '#FFFFFF',
    // Accents
    red: '#B73232',
    redLight: '#FCECEC',
    gold: '#B8860B',
};

export const shadows = {
    sm: '0 2px 8px rgba(31, 90, 46, 0.04)',
    md: '0 4px 16px rgba(31, 90, 46, 0.06)',
};

export const card = {
    background: colors.white,
    border: `1px solid ${colors.border}`,
    borderRadius: '16px',
    padding: '24px 28px',
    boxShadow: shadows.md,
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
};

export const pageTitle = {
    fontSize: '26px',
    fontWeight: '600',
    color: colors.text,
    marginBottom: '6px',
    fontFamily: "'Merriweather', Georgia, serif",
    letterSpacing: '-0.3px',
};

export const pageSub = {
    fontSize: '14px',
    color: colors.textMuted,
    marginBottom: '32px',
    fontFamily: "'Inter', 'Lato', sans-serif",
    lineHeight: '1.5',
};

export const sectionTitle = {
    fontSize: '13px',
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: '16px',
    fontFamily: "'Inter', 'Lato', sans-serif",
    textTransform: 'uppercase',
    letterSpacing: '1px',
};

export const badge = (status) => ({
    fontSize: '12px',
    padding: '4px 12px',
    borderRadius: '24px',
    fontWeight: '600',
    fontFamily: "'Inter', 'Lato', sans-serif",
    background: status === 'confirmed' ? colors.greenLight : '#F0F2F1',
    color: status === 'confirmed' ? colors.green : colors.textMuted,
    letterSpacing: '0.3px',
});

export const btn = {
    padding: '10px 16px',
    borderRadius: '10px',
    border: `1px solid ${colors.border}`,
    background: colors.white,
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
    color: colors.text,
    fontFamily: "'Inter', 'Lato', sans-serif",
    transition: 'all 0.2s ease',
    boxShadow: shadows.sm,
};

export const page = {
    padding: '40px 48px',
    fontFamily: "'Inter', 'Lato', sans-serif",
    background: colors.bg,
    minHeight: '100vh',
    color: colors.text,
};
