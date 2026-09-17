/* ==========================================
   utils.js — 汎用ユーティリティ
   特定の機能に依存しない、単体で完結する便利関数だけを置く場所。
========================================== */

// 配列をその場でシャッフルする（Fisher-Yates）
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// ★シード付き乱数(mulberry32)。同じシードなら必ず同じ並びになる。
// マルチプレイで「全員が同じ出題順」を共有するために使う。
// 以前は出題順を確定した配列(最大250問)をそのままWebRTCで送っていたため、
// 対戦開始時に大きなデータ転送が発生していた。シードだけ送って各自が
// 同じ手順で並べ替えれば、転送量は数バイトで済む。
function makeSeededRandom(seed) {
    let a = seed >>> 0;
    return function() {
        a |= 0; a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function shuffleArraySeeded(array, seed) {
    const rand = makeSeededRandom(seed);
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
