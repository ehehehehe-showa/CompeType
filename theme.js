/* ==========================================
   theme.js — 配色スタイルの読み込み・登録・適用を担当するローダー。
   questions.js/questions/フォルダと同じ考え方で、個々のスタイルの中身は
   置かず、styles/フォルダの各ファイルが registerStyle() を呼んで登録する。

   スタイルの配色はCSSを一切書き換えずにJSからCSS変数として直接bodyに
   適用するため、新しいスタイルを追加したいときはCSSを触らずstyles/に
   1ファイル追加してSTYLE_FILES配列(このファイルの下の方)に1行足すだけでよい
   (1スタイル=1ファイル、questions/と同じ運用。index.html自体は編集不要)。

   スタイルの登録フォーマット:
   {
     id, name: {en, ja},
     background: "matrix" | "drift",  // background.js側の描画レンダラー名
     glow: true | false,              // false にするとネオン/走査線/切り欠き
                                       // パネルなど"サイバー感"のある演出を一括オフにする
     colors: {
       dark:  { bgColor, panelBg, panelBorder, textColor, textMuted,
                accentColor, accentHover, accentGlow, accentRgb,
                borderColor, inputBg, keyBg, errorColor, fontMain },
       light: { ...同じキー... }
     }
   }
========================================== */

const STYLE_THEMES = {};

// styles/*.js から呼ばれる登録関数
function registerStyle(style) {
    try {
        if (!style || !style.id) { console.warn('registerStyle: idの無いスタイルをスキップしました', style); return; }
        if (!style.colors || !style.colors.dark) { console.warn(`registerStyle: "${style.id}" はcolors.darkが無いためスキップしました`); return; }
        STYLE_THEMES[style.id] = style;
    } catch(e) {
        console.error('registerStyle: 登録中にエラーが発生しました', e);
    }
}

// JSのプロパティ名 → 実際のCSSカスタムプロパティ名の対応表
const STYLE_CSS_VAR_MAP = {
    bgColor: '--bg-color', panelBg: '--panel-bg', panelBorder: '--panel-border',
    textColor: '--text-color', textMuted: '--text-muted', accentColor: '--accent-color',
    accentHover: '--accent-hover', accentGlow: '--accent-glow', accentRgb: '--accent-rgb',
    borderColor: '--border-color', inputBg: '--input-bg', keyBg: '--key-bg',
    errorColor: '--error-color', fontMain: '--font-main'
};

// 現在選択中のスタイル(styleId)と色モード(dark/light/auto)から、
// 実際の配色をCSS変数としてbodyへ直接適用する。テーマ・スタイルどちらの
// 変更でもこの1関数を呼べば見た目が揃うようにしている。
function applyAppearance(styleId, colorMode) {
    const style = STYLE_THEMES[styleId] || STYLE_THEMES[Object.keys(STYLE_THEMES)[0]];
    if (!style) return;

    const resolvedMode = colorMode === 'auto'
        ? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
        : colorMode;
    let palette = style.colors[resolvedMode] || style.colors.dark;

    // ★「明るさ・彩度は固定で色味(色相)だけ変えられる」サブカラー調整。
    // アクセント系の色だけを対象に、同じ彩度・明度を保ったまま色相をずらす。
    const hueShift = (typeof appSettings !== 'undefined' && appSettings.hueShift) || 0;
    if (hueShift) palette = applyHueShiftToPalette(palette, hueShift);

    Object.keys(palette).forEach(key => {
        const cssVar = STYLE_CSS_VAR_MAP[key];
        if (cssVar) document.body.style.setProperty(cssVar, palette[key]);
    });

    document.body.classList.toggle('no-glow', style.glow === false);
    document.body.classList.remove('theme-dark', 'theme-light', 'theme-auto');
    document.body.classList.add(`theme-${resolvedMode}`);

    // ★PWAのブラウザUI(Android Chromeのアドレスバー、iOS Safariのステータスバー等)
    // の色を、選択中のスタイルのアクセントカラーに合わせる。
    // なお、manifest.jsonのtheme_colorはインストール時/起動直後の一瞬にしか
    // 効かない静的な値のため、ここでは動的に変えられない(仕様上の制約)。
    // この<meta>タグの更新は、実行中の見た目には確実に効く。
    try {
        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme && palette.accentColor) metaTheme.setAttribute('content', palette.accentColor);
    } catch(e) { console.error('[theme] theme-colorメタタグの更新に失敗しました:', e); }

    // ★次回の初回ペイント前に(このJSが読み込まれるより前に)同じ配色を
    // すぐ再現できるよう、実際に適用した値をそのままキャッシュしておく。
    // index.htmlの<body>先頭の早期スクリプトがこれを読んで先に適用することで、
    // 「スタイル/言語の設定が読み込まれる前に別の見た目が一瞬映り、
    // あとから上書きされる」ちらつきを防ぐ。
    try {
        localStorage.setItem('typingLastPalette', JSON.stringify({ vars: paletteToVars(palette), noGlow: style.glow === false, mode: resolvedMode }));
    } catch(e) { console.error('[theme] 配色キャッシュの保存に失敗しました:', e); }
}

function paletteToVars(palette) {
    const vars = {};
    Object.keys(palette).forEach(key => {
        const cssVar = STYLE_CSS_VAR_MAP[key];
        if (cssVar) vars[cssVar] = palette[key];
    });
    return vars;
}

/* ---- 色相シフト(サブカラー調整)まわりの色変換ユーティリティ ----
   #rrggbb / rgb(...) / rgba(...) のいずれかを受け取り、HSLに変換して
   色相だけをずらし、元と同じ形式(alpha付きかどうか)で返す。
   パース出来ない値はそのまま素通しする(壊れた配色になるよりは安全側に倒す)。 */
function acParseColorToRgba(str) {
    if (!str) return null;
    str = String(str).trim();
    if (str[0] === '#') {
        const hex = str.length === 4
            ? str.slice(1).split('').map(c => c + c).join('')
            : str.slice(1);
        if (hex.length !== 6) return null;
        return { r: parseInt(hex.slice(0,2),16), g: parseInt(hex.slice(2,4),16), b: parseInt(hex.slice(4,6),16), a: 1 };
    }
    const m = str.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)/);
    if (m) return { r: +m[1], g: +m[2], b: +m[3], a: m[4] !== undefined ? +m[4] : 1 };
    return null;
}

function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s; const l = (max + min) / 2;
    if (max === min) { h = s = 0; }
    else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            default: h = (r - g) / d + 4;
        }
        h /= 6;
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToRgb(h, s, l) {
    h = ((h % 360) + 360) % 360 / 360; s /= 100; l /= 100;
    let r, g, b;
    if (s === 0) { r = g = b = l; }
    else {
        const hue2rgb = (p, q, tt) => {
            if (tt < 0) tt += 1;
            if (tt > 1) tt -= 1;
            if (tt < 1/6) return p + (q - p) * 6 * tt;
            if (tt < 1/2) return q;
            if (tt < 2/3) return p + (q - p) * (2/3 - tt) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3); g = hue2rgb(p, q, h); b = hue2rgb(p, q, h - 1/3);
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

function acShiftColorHue(colorStr, hueDeg) {
    const rgba = acParseColorToRgba(colorStr);
    if (!rgba) return colorStr;
    const hsl = rgbToHsl(rgba.r, rgba.g, rgba.b);
    const rgb = hslToRgb(hsl.h + hueDeg, hsl.s, hsl.l);
    return rgba.a < 1 ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgba.a})` : `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

// アクセント系のキーだけ色相をずらしたコピーを作る(背景・文字色などは触らない=
// 「明るさ・彩度は固定」の意図を守る)。accentRgbは--accent-colorとrgba()を
// 併用しているCSSと整合させるため、シフト後の色から算出し直す。
const HUE_SHIFT_TARGET_KEYS = ['accentColor', 'accentHover', 'accentGlow', 'panelBorder', 'borderColor'];
function applyHueShiftToPalette(palette, hueDeg) {
    const shifted = { ...palette };
    HUE_SHIFT_TARGET_KEYS.forEach(key => {
        if (shifted[key]) shifted[key] = acShiftColorHue(shifted[key], hueDeg);
    });
    if (shifted.accentColor) {
        const rgba = acParseColorToRgba(shifted.accentColor);
        if (rgba) shifted.accentRgb = `${rgba.r}, ${rgba.g}, ${rgba.b}`;
    }
    return shifted;
}

// ★questions.jsと同じ考え方: 新しいスタイルを追加するときにindex.htmlへ
// <script>タグを足す必要が無いよう、ここでファイル名の一覧から動的に
// <script>タグを生成して読み込む。追加したいときはstyles/にファイルを作り、
// この配列に1行足すだけでよい。
const STYLE_FILES = [
    'cyber.js',
    'minimal.js',
    'retro.js',
    'wa.js'
];

STYLE_FILES.forEach(filename => {
    const script = document.createElement('script');
    script.src = 'styles/' + filename;
    document.head.appendChild(script);
});
