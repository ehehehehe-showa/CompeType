/* styles/retro.js — レトロなアンバーCRTターミナル風スタイル。
   背景は奥行きのあるワイヤーフレームグリッド("grid")。サイバーの
   文字降りとは別物にして、見た目がはっきり区別できるようにしている。 */
registerStyle({
    id: 'retro',
    name: { en: 'Retro Terminal', ja: 'レトロターミナル' },
    background: 'grid',
    glow: true,
    colors: {
        dark: {
            bgColor: '#0a0800', panelBg: 'rgba(20, 15, 0, 0.88)', panelBorder: 'rgba(255, 176, 0, 0.35)',
            textColor: '#ffd479', textMuted: '#7a5c00', accentColor: '#ffb000', accentHover: '#e69d00',
            accentGlow: 'rgba(255, 176, 0, 0.55)', accentRgb: '255, 176, 0', borderColor: 'rgba(255, 176, 0, 0.25)',
            inputBg: 'rgba(0, 0, 0, 0.6)', keyBg: 'rgba(30, 22, 0, 0.9)', errorColor: '#ff4433',
            fontMain: "'VT323', 'Courier New', monospace"
        },
        light: {
            bgColor: '#f3ead6', panelBg: 'rgba(255, 250, 238, 0.92)', panelBorder: 'rgba(140, 90, 0, 0.35)',
            textColor: '#4a3200', textMuted: '#9c8258', accentColor: '#a05a00', accentHover: '#8a4c00',
            accentGlow: 'rgba(160, 90, 0, 0.3)', accentRgb: '160, 90, 0', borderColor: 'rgba(140, 90, 0, 0.25)',
            inputBg: 'rgba(255, 246, 225, 0.9)', keyBg: 'rgba(255, 250, 238, 0.95)', errorColor: '#b3311c',
            fontMain: "'VT323', 'Courier New', monospace"
        }
    }
});
