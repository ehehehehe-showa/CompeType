/* styles/wa.js — 和紙と藍色の落ち着いた和風スタイル。
   背景は舞い散る花びら("sakura"レンダラー、background.js参照)。 */
registerStyle({
    id: 'wa',
    name: { en: 'Wa (Japanese)', ja: '和' },
    background: 'sakura',
    glow: false,
    colors: {
        dark: {
            bgColor: '#1a1510', panelBg: 'rgba(30, 24, 18, 0.92)', panelBorder: 'rgba(212, 175, 55, 0.3)',
            textColor: '#e8dcc8', textMuted: '#8a7a5c', accentColor: '#d4af37', accentHover: '#c19b2e',
            accentGlow: 'rgba(212, 175, 55, 0.18)', accentRgb: '212, 175, 55', borderColor: 'rgba(212, 175, 55, 0.2)',
            inputBg: 'rgba(0, 0, 0, 0.3)', keyBg: 'rgba(255, 255, 255, 0.05)', errorColor: '#c0392b',
            fontMain: "'Hiragino Mincho ProN', 'Yu Mincho', serif"
        },
        light: {
            bgColor: '#f5f0e6', panelBg: 'rgba(255, 253, 248, 0.95)', panelBorder: 'rgba(38, 74, 107, 0.25)',
            textColor: '#2c2416', textMuted: '#8a7a5c', accentColor: '#264a6b', accentHover: '#1c3a54',
            accentGlow: 'rgba(38, 74, 107, 0.12)', accentRgb: '38, 74, 107', borderColor: 'rgba(38, 74, 107, 0.2)',
            inputBg: 'rgba(0, 0, 0, 0.03)', keyBg: 'rgba(0, 0, 0, 0.04)', errorColor: '#a83232',
            fontMain: "'Hiragino Mincho ProN', 'Yu Mincho', serif"
        }
    }
});
