/* ==========================================
   background.js — 背景演出
   スタイル(theme.jsのSTYLE_THEMES)ごとに異なる背景キャンバスを描画する。
   ・matrix → マトリックス風の文字落ち(cyber/retroが使用。色はCSS変数から取るので
              スタイルの配色にそのまま追従する)
   ・drift  → 落ち着いた浮遊パーティクル(minimalが使用)
   ・sakura → ゆっくり舞い散る花びら(waが使用)

   ★以前は「見ている画面によって背景文字の速度/間隔が違って見える」不具合が
   あった。原因は、移動量(drops[i] += steps)は経過時間で正規化していたのに、
   トレイルの残光フェード(fillRectのalpha)は毎フレーム固定値0.05を掛けて
   いたため。実際のフレームレートは画面の状況(タイピング中の処理負荷等)で
   変動するため、「掛かった回数」に依存するフェード濃度と「経過時間」に依存する
   移動量の基準がズレ、体感の速度/密度が場面によって変わって見えていた。
   フェードも指数減衰として経過時間で正規化することで解消した
   (1コマで0.05のフェードを、steps単位の経過時間ぶんだけ複利計算する)。
========================================== */

function initMatrixBackground() {
    const canvas = document.getElementById('bg-canvas'); const ctx = canvas.getContext('2d');
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ'.split('');
    const fontSize = 14;
    let drops = [];
    let particles = [];
    let rafId = null;

    function setupCanvas() {
        canvas.width = window.innerWidth; canvas.height = window.innerHeight;
        const columns = Math.ceil(canvas.width / fontSize);
        drops = new Array(columns).fill(1);
        const count = Math.floor((canvas.width * canvas.height) / 18000);
        particles = Array.from({ length: count }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: 1 + Math.random() * 2,
            speedY: 0.1 + Math.random() * 0.3,
            speedX: (Math.random() - 0.5) * 0.15,
            alpha: 0.15 + Math.random() * 0.25,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.02
        }));
    }
    setupCanvas();

    function currentBackgroundKind() {
        const style = (typeof appSettings !== 'undefined' && appSettings.styleTheme) || 'cyber';
        return (typeof STYLE_THEMES !== 'undefined' && STYLE_THEMES[style]) ? STYLE_THEMES[style].background : 'matrix';
    }

    // ★requestAnimationFrameは画面のリフレッシュレートに同期して呼ばれるため、
    // 60Hz/120Hzなど高リフレッシュレートのモニタでは呼ばれる回数そのものが増える。
    // 前回描画からの実経過時間(deltaTime)を測り、「33ms相当あたり何マス動くか」を
    // 基準に正規化することで、モニタや処理負荷に関わらず同じ体感速度になる。
    const BASE_FRAME_MS = 1000 / 30;
    const BASE_TRAIL_FADE = 0.05;
    let lastTime = performance.now();

    function drawMatrix(steps) {
        const isLight = document.body.classList.contains('theme-light');
        // ★経過時間(steps)に応じて複利計算したフェード濃度を使う(frame-rate非依存)
        const fadeAlpha = 1 - Math.pow(1 - BASE_TRAIL_FADE, steps);
        ctx.fillStyle = isLight ? `rgba(255, 255, 255, ${fadeAlpha})` : `rgba(0, 0, 0, ${fadeAlpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--accent-color').trim() || '#0F0';
        ctx.font = fontSize + 'px monospace';
        for(let i = 0; i < drops.length; i++) {
            const text = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            if(drops[i] * fontSize > canvas.height && Math.random() > (1 - 0.025 * steps)) drops[i] = 0;
            drops[i] += steps;
        }
    }

    // ミニマルスタイル用: ゆっくり漂う静かなパーティクル(サイバー感のない演出)
    function drawDrift(steps) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const accent = getComputedStyle(document.body).getPropertyValue('--accent-color').trim() || '#888';
        particles.forEach(p => {
            p.y -= p.speedY * steps; p.x += p.speedX * steps;
            if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = accent;
            ctx.globalAlpha = p.alpha;
            ctx.fill();
        });
        ctx.globalAlpha = 1;
    }

    // 和風スタイル用: ゆっくり舞い散る花びら
    function drawSakura(steps) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const accent = getComputedStyle(document.body).getPropertyValue('--accent-color').trim() || '#d98ba0';
        particles.forEach(p => {
            p.y += p.speedY * steps * 1.2;
            p.x += p.speedX * steps + Math.sin(p.y * 0.02) * 0.4 * steps;
            p.rotation += p.rotSpeed * steps;
            if (p.y > canvas.height + 10) { p.y = -10; p.x = Math.random() * canvas.width; }
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.beginPath();
            ctx.ellipse(0, 0, p.r * 1.8, p.r, 0, 0, Math.PI * 2);
            ctx.fillStyle = accent;
            ctx.globalAlpha = p.alpha;
            ctx.fill();
            ctx.restore();
        });
        ctx.globalAlpha = 1;
    }

    const RENDERERS = { matrix: drawMatrix, drift: drawDrift, sakura: drawSakura };

    function draw(now) {
        const steps = Math.min(4, (now - lastTime) / BASE_FRAME_MS); // 極端なタブ復帰直後の飛びすぎ防止に上限を設ける
        lastTime = now;
        const renderer = RENDERERS[currentBackgroundKind()] || drawMatrix;
        renderer(steps);
        rafId = requestAnimationFrame(draw);
    }
    rafId = requestAnimationFrame((t) => { lastTime = t; rafId = requestAnimationFrame(draw); });
    window.addEventListener('resize', setupCanvas);
}
