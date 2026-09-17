/* styles/bloom.js — 明るいピンクの柔らかいスタイル。
   背景はハート形パーティクル("heart"レンダラー、background.js参照)。
   グローや切り欠きを使わないフラットな見た目。 */
registerStyle({
    id: 'bloom',
    name: { en: 'Bloom', ja: 'ブルーム' },
    background: 'heart',
    glow: false,
    colors: {
        dark: {
            bgColor: '#1f1419', panelBg: 'rgba(42, 26, 34, 0.92)', panelBorder: 'rgba(244, 143, 177, 0.28)',
            textColor: '#ffe9f0', textMuted: '#9c7683', accentColor: '#f48fb1', accentHover: '#e57a9e',
            accentGlow: 'rgba(244, 143, 177, 0.22)', accentRgb: '244, 143, 177', borderColor: 'rgba(244, 143, 177, 0.2)',
            inputBg: 'rgba(0, 0, 0, 0.28)', keyBg: 'rgba(255, 255, 255, 0.06)', errorColor: '#ef5350',
            fontMain: "'Zen Kaku Gothic New', 'Segoe UI', sans-serif"
        },
        light: {
            bgColor: '#fff5f8', panelBg: 'rgba(255, 255, 255, 0.96)', panelBorder: 'rgba(216, 85, 132, 0.22)',
            textColor: '#3d2630', textMuted: '#b08a97', accentColor: '#d85584', accentHover: '#c2456f',
            accentGlow: 'rgba(216, 85, 132, 0.18)', accentRgb: '216, 85, 132', borderColor: 'rgba(216, 85, 132, 0.18)',
            inputBg: 'rgba(216, 85, 132, 0.05)', keyBg: 'rgba(255, 255, 255, 0.95)', errorColor: '#e53935',
            fontMain: "'Zen Kaku Gothic New', 'Segoe UI', sans-serif"
        }
    }
});
