/* ==========================================
   device.js — 端末/OSの判定と、それに応じた案内。

   ・スマートフォンを縦持ちしている間は、タイピングに向かないため
     横画面を推奨するオーバーレイを出す(タブレット・PCでは出さない)。
   ・OS判定の結果はbodyのクラス(os-windows / os-macos / os-ios /
     os-android / os-linux、device-phone / device-tablet / device-desktop)
     として付与し、CSS側から端末ごとの微調整ができるようにしておく。
   ・修飾キーの表記など、OSによって案内を変えたい箇所で使えるよう
     getModifierKeyLabel()も用意している。

   ★判定は「当たれば嬉しい」程度のもので、外れても機能が壊れないように
   している(オーバーレイは閉じられるし、クラスは見た目の微調整にしか
   使っていない)。UA文字列は詐称も仕様変更もありうるため、これに
   依存した必須機能は作らない方針。
========================================== */

function detectOS() {
    try {
        const ua = navigator.userAgent || '';
        const platform = navigator.platform || '';
        // iPadOS 13以降はUAがMacを名乗るため、タッチ点数で併せて判定する
        const isIOS = /iPhone|iPad|iPod/.test(ua) || (platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        if (isIOS) return 'ios';
        if (/Android/.test(ua)) return 'android';
        if (/Win/.test(platform) || /Windows/.test(ua)) return 'windows';
        if (/Mac/.test(platform) || /Macintosh/.test(ua)) return 'macos';
        if (/Linux|X11/.test(platform) || /Linux/.test(ua)) return 'linux';
        return 'unknown';
    } catch(e) {
        console.error('[device] OS判定に失敗しました:', e);
        return 'unknown';
    }
}

function detectDeviceType() {
    try {
        const ua = navigator.userAgent || '';
        const hasTouch = (navigator.maxTouchPoints || 0) > 0;
        const isTabletUA = /iPad/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
            || (/Android/.test(ua) && !/Mobile/.test(ua));
        if (isTabletUA) return 'tablet';
        const isPhoneUA = /iPhone|iPod/.test(ua) || (/Android/.test(ua) && /Mobile/.test(ua))
            || /Windows Phone|BlackBerry|Opera Mini/.test(ua);
        if (isPhoneUA) return 'phone';
        // UAで判別できない場合、タッチ対応かつ画面が小さければスマホ扱いにする
        if (hasTouch && Math.min(window.screen.width, window.screen.height) < 500) return 'phone';
        return 'desktop';
    } catch(e) {
        console.error('[device] 端末種別の判定に失敗しました:', e);
        return 'desktop';
    }
}

let detectedOS = 'unknown';
let detectedDeviceType = 'desktop';

// Ctrl / Cmd のように、OSで呼び方が違う修飾キーの表記を返す
function getModifierKeyLabel() {
    return detectedOS === 'macos' || detectedOS === 'ios' ? 'Cmd' : 'Ctrl';
}

function isPortraitOrientation() {
    try {
        if (window.matchMedia) return window.matchMedia('(orientation: portrait)').matches;
        return window.innerHeight > window.innerWidth;
    } catch(e) {
        return window.innerHeight > window.innerWidth;
    }
}

// スマホを縦持ちしている間だけ「横画面推奨」を出す。
// 一度閉じられたらそのセッション中は再表示しない(邪魔をしないため)。
let rotateNoticeDismissed = false;
function updateRotateNotice() {
    try {
        const el = document.getElementById('rotate-notice');
        if (!el) return;
        const shouldShow = detectedDeviceType === 'phone' && isPortraitOrientation() && !rotateNoticeDismissed;
        el.classList.toggle('active', shouldShow);
    } catch(e) { console.error('[device] 横画面推奨表示の更新に失敗しました:', e); }
}

function dismissRotateNotice() {
    rotateNoticeDismissed = true;
    updateRotateNotice();
}

function initDevice() {
    try {
        detectedOS = detectOS();
        detectedDeviceType = detectDeviceType();
        document.body.classList.add('os-' + detectedOS, 'device-' + detectedDeviceType);
        updateRotateNotice();
        window.addEventListener('resize', updateRotateNotice);
        if (window.matchMedia) {
            const mq = window.matchMedia('(orientation: portrait)');
            // Safari旧版はaddEventListenerに未対応なのでaddListenerにフォールバック
            if (mq.addEventListener) mq.addEventListener('change', updateRotateNotice);
            else if (mq.addListener) mq.addListener(updateRotateNotice);
        }
    } catch(e) {
        console.error('[device] 初期化に失敗しました:', e);
    }
}
