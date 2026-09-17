/* styles/galaxy.js — 深い紫の宇宙。星形パーティクルが降る。
   背景は座標配列から生成した星形("star"レンダラー、background.js参照)。 */
registerStyle({
    id: 'galaxy',
    name: { en: 'Galaxy', ja: 'ギャラクシー' },
    background: 'star',
    glow: true,
    colors: {
        dark: {
            bgColor: '#0b0718', panelBg: 'rgba(24, 16, 48, 0.9)', panelBorder: 'rgba(167, 139, 250, 0.35)',
            textColor: '#e9e3ff', textMuted: '#6d5f9c', accentColor: '#a78bfa', accentHover: '#9070f5',
            accentGlow: 'rgba(167, 139, 250, 0.5)', accentRgb: '167, 139, 250', borderColor: 'rgba(167, 139, 250, 0.25)',
            inputBg: 'rgba(0, 0, 0, 0.45)', keyBg: 'rgba(40, 28, 74, 0.9)', errorColor: '#ff5c8a',
            fontMain: "'Zen Kaku Gothic New', 'Segoe UI', sans-serif"
        },
        light: {
            bgColor: '#f4f1fb', panelBg: 'rgba(255, 255, 255, 0.94)', panelBorder: 'rgba(109, 76, 199, 0.3)',
            textColor: '#2b2350', textMuted: '#8b82b5', accentColor: '#6d4cc7', accentHover: '#5a3cb0',
            accentGlow: 'rgba(109, 76, 199, 0.25)', accentRgb: '109, 76, 199', borderColor: 'rgba(109, 76, 199, 0.2)',
            inputBg: 'rgba(109, 76, 199, 0.05)', keyBg: 'rgba(255, 255, 255, 0.95)', errorColor: '#d6336c',
            fontMain: "'Zen Kaku Gothic New', 'Segoe UI', sans-serif"
        }
    }
});
