/* ==========================================
   screens/status-screen.js — 「ステータス」画面
   履歴一覧・ベスト記録・スコア推移グラフ・詳細モーダルの表示。
   データそのものはrecords.jsのgetHistory()/getBest()から取得する。
========================================== */

function updateStatusCategoryOptions() {
    const statCatSel = document.getElementById('status-category');
    if (!statCatSel) return;
    const currentVal = statCatSel.value;
    statCatSel.innerHTML = "";
    // ★履歴はforceSettings(競技ルール)のセットしか保存されないため、
    // それ以外のセットを一覧に出しても常に空になるだけで意味が無い
    questionSets.filter(set => set.forceSettings).forEach((set, idx) => {
        const valueId = set.id || String(idx);
        statCatSel.add(new Option(getI18nText(set.name), valueId));
    });
    if (currentVal && Array.from(statCatSel.options).some(o => o.value === currentVal)) {
        statCatSel.value = currentVal;
    }
}

function renderStatusScreen() {
    setTimeout(() => {
        const catId = document.getElementById('status-category').value;
        const currentHist = getHistory(catId);
        const currentBest = getBest(catId);

        const listEl = document.getElementById('status-content');
        const bestEl = document.getElementById('best-status-content');
        const canvas = document.getElementById('score-chart');
        const wrapper = document.getElementById('chart-wrapper');

        canvas.width = wrapper.clientWidth; canvas.height = wrapper.clientHeight;
        const ctx = canvas.getContext('2d'); ctx.clearRect(0, 0, canvas.width, canvas.height);

        if(currentBest) {
            bestEl.innerHTML = `<div class="status-row" onclick='openModal(${JSON.stringify(currentBest.fullStats)})'><span class="neon-text">${currentBest.date}</span><span style="font-family:monospace">Score: <b class="neon-text">${currentBest.score.toLocaleString()}</b> | WPM: <b>${currentBest.wpm}</b> | Acc: <b>${currentBest.acc}</b></span></div>`;
        } else { bestEl.innerHTML = `<p style="text-align:center; color:var(--text-muted);">No Data</p>`; }

        if(currentHist.length === 0) { listEl.innerHTML = `<p style="text-align:center; color:var(--text-muted);">${t('status_empty')}</p>`; return; }

        let listHtml = '';
        [...currentHist].reverse().forEach(h => { listHtml += `<div class="status-row" onclick='openModal(${JSON.stringify(h.fullStats)})'><span>${h.date}</span><span style="font-family:monospace">Score: <b>${h.score.toLocaleString()}</b> | WPM: <b>${h.wpm}</b></span></div>`; });
        listEl.innerHTML = listHtml;

        drawScoreChart(ctx, canvas, currentHist.map(h => h.score));
    }, 50);
}

/* ==========================================
   スコア推移グラフの描画。
   ★以前は折れ線を引くだけで目盛りも数値も無く、「上がった/下がった」しか
   読み取れなかった。Y軸に実際のスコア値、X軸に何回前のプレイかを振り、
   水平のグリッド線を入れて具体的な値を読めるようにする。
========================================== */
function drawScoreChart(ctx, canvas, scores) {
    try {
        if (!scores || scores.length === 0) return;

        const css = getComputedStyle(document.body);
        const accentColor = css.getPropertyValue('--accent-color').trim() || '#3b82f6';
        const mutedColor = css.getPropertyValue('--text-muted').trim() || '#888';
        const borderColor = css.getPropertyValue('--border-color').trim() || 'rgba(128,128,128,0.2)';

        // 軸ラベルのぶんだけ左と下に余白を取る
        const padL = 52, padR = 14, padT = 14, padB = 24;
        const width = canvas.width - padL - padR;
        const height = canvas.height - padT - padB;
        if (width <= 0 || height <= 0) return;

        // Y軸の上限を「キリのいい数字」に丸める(目盛りの数値を読みやすくするため)
        const rawMax = Math.max(...scores, 10);
        const magnitude = Math.pow(10, Math.floor(Math.log10(rawMax)));
        const niceMax = Math.ceil(rawMax / (magnitude / 2)) * (magnitude / 2);

        const GRID_LINES = 4;
        ctx.font = '10px monospace';
        ctx.textBaseline = 'middle';

        // 水平グリッド線 + Y軸の数値
        for (let i = 0; i <= GRID_LINES; i++) {
            const value = (niceMax / GRID_LINES) * i;
            const y = padT + height - (i / GRID_LINES) * height;
            ctx.beginPath();
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = 1;
            ctx.moveTo(padL, y);
            ctx.lineTo(padL + width, y);
            ctx.stroke();

            ctx.fillStyle = mutedColor;
            ctx.textAlign = 'right';
            ctx.fillText(Math.round(value).toLocaleString(), padL - 8, y);
        }

        // 軸線(左と下)
        ctx.beginPath();
        ctx.strokeStyle = mutedColor;
        ctx.lineWidth = 1;
        ctx.moveTo(padL, padT);
        ctx.lineTo(padL, padT + height);
        ctx.lineTo(padL + width, padT + height);
        ctx.stroke();

        const xAt = (i) => padL + (scores.length === 1 ? width / 2 : (i / (scores.length - 1)) * width);
        const yAt = (s) => padT + height - (s / niceMax) * height;

        // X軸の目盛り(何回前のプレイか)。点が多いときは間引いて重ならないようにする
        ctx.textAlign = 'center';
        ctx.fillStyle = mutedColor;
        const step = Math.max(1, Math.ceil(scores.length / 6));
        for (let i = 0; i < scores.length; i += step) {
            const fromEnd = scores.length - 1 - i;
            const label = fromEnd === 0 ? t('chart_latest') : '-' + fromEnd;
            ctx.fillText(label, xAt(i), padT + height + 12);
        }

        // 折れ線
        ctx.beginPath();
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        scores.forEach((s, i) => { i === 0 ? ctx.moveTo(xAt(i), yAt(s)) : ctx.lineTo(xAt(i), yAt(s)); });
        ctx.stroke();

        // データ点
        ctx.fillStyle = accentColor;
        scores.forEach((s, i) => {
            ctx.beginPath();
            ctx.arc(xAt(i), yAt(s), 3, 0, Math.PI * 2);
            ctx.fill();
        });
    } catch (e) {
        console.error('[status] グラフの描画に失敗しました:', e);
    }
}

function openModal(statsObj) {
    playCyberSound('click');
    const grid = document.getElementById('modal-detail-grid');
    let html = '';
    resultStatsKeys.forEach(key => { html += `<div class="res-item"><span style="font-size:0.8rem; color:var(--text-muted)">${t('res_' + key)}</span><span class="res-val" style="font-size:1.5rem;">${statsObj[key]}</span></div>`; });
    grid.innerHTML = html;
    const modal = document.getElementById('status-modal');
    modal.classList.add('active');
    // ★以前はCSSの@keyframes fadeInで表示していたが、開閉のたびに
    // 毎回同じ短い演出をするだけなのでWeb Animations APIに統一した。
    modal.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: 'ease-out' });
}
function closeModal() { playCyberSound('click'); document.getElementById('status-modal').classList.remove('active'); }
