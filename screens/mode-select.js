/* ==========================================
   screens/mode-select.js — 「シングル/マルチ」選択、マルチプレイの
   ホスト/参加フォーム、ルーム画面、ランキング画面の制御。
   実際のPeerJS通信はmultiplayer.js、ゲーム本編への合流はgame.jsの
   startMultiplayerRound()を呼ぶだけにしている。

   ★ホストのフローは「ルームを先に作る」形にしている:
   名前入力 → (この場でルーム作成・コード発行) → ルーム画面(コード/参加者一覧が
   常時見える) → ここから問題セット選択(シングルと同じUI)へ進んでSTART
   → 同じルームのままラウンド開始。「続ける」も同様に、ルームを作り直さず
   問題選択に戻るだけ。 */

function openModeSelect() {
    mpTeardown();
    mpRefreshRoomBadge();
    updateMultiplayerAvailability();
    openScreen('mode-select-screen');
}

function selectSingleMode() {
    mpMode = null; mpIsMultiplayer = false;
    openScreen('play-select-screen'); renderQuestionSets(); initTagFilters();
}

function selectMultiMode() {
    if (!navigator.onLine) return; // オフライン時はボタン自体を無効化しているが念のため
    openScreen('mp-select-screen');
}

function openHostNameForm() {
    document.getElementById('mp-host-name-error').classList.add('hidden');
    openScreen('mp-host-name-screen');
}

function openJoinForm() {
    document.getElementById('mp-join-error').classList.add('hidden');
    openScreen('mp-join-screen');
}

function backFromPlaySelect() {
    // ★ルームが既に開いている(ホストとして問題を選んでいる/続けるを押した)間は
    // 「戻る」でルームを畳んでしまわないよう、ルーム画面に戻すだけにする
    if (mpMode === 'host' && mpRoomActive) { openScreen('mp-room-screen'); }
    else if (mpMode === 'host') { openScreen('mp-host-name-screen'); }
    else { backToMain(); }
}

// 名前を確定したら、その場でルームを作成する(コードはmpHostのコールバックで確定)
function submitHostName() {
    const name = document.getElementById('mp-host-name-input').value.trim();
    const errEl = document.getElementById('mp-host-name-error');
    if (name.length < 3) { errEl.innerText = t('mp_name_too_short'); errEl.classList.remove('hidden'); return; }
    errEl.classList.add('hidden');

    mpMyName = name; mpMode = 'host'; mpIsMultiplayer = true;
    createRoomAsHost();
}

function createRoomAsHost() {
    document.getElementById('mp-room-code-text').innerText = '--------';
    document.getElementById('mp-host-room-status').innerText = t('mp_creating_room');
    renderMpParticipantList([]);
    openScreen('mp-room-screen');

    mpSetMessageHandler(handleMpMessage);
    mpHost(mpMyName, (code) => {
        document.getElementById('mp-host-room-status').innerText = t('mp_room_ready');
        document.getElementById('mp-room-code-text').innerText = code;
        mpRefreshRoomBadge();
    }, () => {
        renderMpParticipantList(mpHostConns);
        mpRefreshRoomBadge();
    }, (err) => {
        document.getElementById('mp-host-room-status').innerText = t('mp_connection_failed');
        console.error('[multiplayer] host error:', err);
    });
}

// ルーム画面から問題セット選択へ(シングルプレイと同じUIを使い回す)
function mpGoToQuestionSelect() {
    openScreen('play-select-screen'); renderQuestionSets(); initTagFilters();
}

// 参加者: コードと名前を確定し、その場でホストへの接続を試みる
function submitJoinForm() {
    const code = document.getElementById('mp-join-code-input').value.trim();
    const name = document.getElementById('mp-join-name-input').value.trim();
    const errEl = document.getElementById('mp-join-error');
    if (!code) { errEl.innerText = t('mp_code_required'); errEl.classList.remove('hidden'); return; }
    if (name.length < 3) { errEl.innerText = t('mp_name_too_short'); errEl.classList.remove('hidden'); return; }
    errEl.classList.add('hidden');

    mpMode = 'join'; mpIsMultiplayer = true;
    document.getElementById('mp-join-room-status').innerText = t('mp_connecting_status');
    document.getElementById('mp-join-participants').innerHTML = '';
    openScreen('mp-join-waiting-screen');

    mpSetMessageHandler(handleMpMessage);
    mpJoin(code, name, () => {
        document.getElementById('mp-join-room-status').innerText = t('mp_connected_waiting');
        mpRefreshRoomBadge();
    }, (reason) => {
        const msg = reason === 'duplicate_name' ? t('mp_name_taken') : (reason === 'room_full' ? t('mp_room_full') : t('mp_connection_failed'));
        document.getElementById('mp-join-room-status').innerText = msg;
    }, (err) => {
        // ★接続失敗(タイムアウト/相手不在/経路無し等)。以前はこれを「ホスト切断」と
        // 混同し、参加を試みただけで試合終了画面に飛んでしまうバグがあった。
        // ここでは純粋な「接続できなかった」エラーとして留め、画面遷移はしない。
        document.getElementById('mp-join-room-status').innerText = t('mp_connection_failed');
        console.error('[multiplayer] join error:', err);
    });
}

function mpCopyRoomCode(sourceElId, buttonElId) {
    const code = document.getElementById(sourceElId || 'mp-room-code-text').innerText;
    if (!code || code === '--------') return;
    navigator.clipboard?.writeText(code).then(() => {
        const btn = document.getElementById(buttonElId || 'mp-copy-code-btn');
        if (!btn) return;
        const original = btn.innerText;
        btn.innerText = t('mp_copied');
        setTimeout(() => { btn.innerText = original; }, 1200);
    }).catch(() => {});
}

function renderMpParticipantList(list, hostNameOverride) {
    const showKick = mpMode === 'host';
    const el = document.getElementById(mpMode === 'host' ? 'mp-host-participants' : 'mp-join-participants');
    const hostLabel = hostNameOverride || mpMyName;
    if (el) {
        let html = `<div class="mp-participant-row mp-participant-host"><span>${hostLabel}</span><span class="mp-role-tag">${t('mp_host_tag')}</span></div>`;
        list.forEach(p => {
            const isMe = p.id === mpMyId;
            html += `<div class="mp-participant-row"><span>${p.name}${isMe ? ' (' + t('mp_you') + ')' : ''}</span>${showKick ? `<button class="mp-kick-btn" onclick="mpHostKick('${p.id}')">${t('mp_kick')}</button>` : ''}</div>`;
        });
        // 参加者がいない間は、次に何をすればよいかを書いておく
        if (list.length === 0 && showKick) html += `<p class="empty-msg">${t('mp_no_participants')}</p>`;
        el.innerHTML = html;
    }
    mpUpdateParticipantCountDisplays(list.length + 1);
}

// ★「常に人数と参加者を把握できる」ように、人数表示は複数箇所(ルーム画面の見出し、
// 常設バッジ)へまとめて反映する。
function mpUpdateParticipantCountDisplays(count) {
    document.querySelectorAll('.mp-participant-count').forEach(el => { el.innerText = `${count}`; });
    mpRefreshRoomBadge();
}

// 画面をまたいで常に見える、ルームのコードと人数を示す固定バッジ。
// ★常設のルームキー/人数バッジは廃止した(ホストのESCメニューから
// 必要な時にだけ確認する方式に変更したため)。呼び出し側を1つずつ消して回る
// 手間とリスクを避けるため、この関数自体を安全な無害化(no-op)に留めている。
function mpRefreshRoomBadge() {
    const badge = document.getElementById('mp-room-badge');
    if (!badge) return; // 通常はここで終わる(バッジ要素はもう存在しない)
    badge.classList.add('hidden');
}

// play-setup画面のSTARTボタンから呼ばれる共通の入口。
function handleSetupStart() {
    if (mpMode === 'host') mpStartRoundFromSetup();
    else startCountdown();
}

// ホスト: 既に開いている「同じルーム」で新しいラウンドを開始する
// (ルームの作り直しは行わない。初回起動でも「続ける」でも同じ経路)。
function mpStartRoundFromSetup() {
    if (!Array.isArray(questionSets) || questionSets.length === 0) {
        if (typeof notifyQuestionsUnavailable === 'function') notifyQuestionsUnavailable();
        return;
    }
    const catId = selectedQSetId || questionSets[0].id;
    const set = questionSets.find(s => s.id === catId) || questionSets[0];

    let mode, target;
    if (set.forceSettings) { mode = set.forceSettings.mode; target = set.forceSettings.target; }
    else {
        mode = document.getElementById('play-mode').value;
        target = Math.min(9999, Math.max(1, parseInt(document.getElementById('play-value').value) || 60));
    }
    const isCjk = set.is_cjk !== false;
    const allowLateJoin = document.getElementById('mp-allow-late-join').checked;

    // ★出題順は「シード」だけを配り、各自が同じ手順で並べ替える。
    // 問題配列そのもの(最大250問)を送らないので、対戦開始時の転送が軽くなる。
    const seed = (Date.now() ^ Math.floor(Math.random() * 0xFFFFFFFF)) >>> 0;
    const sharedQuestions = [...set.questions];
    shuffleArraySeeded(sharedQuestions, seed);

    mpHostStartRound(isCjk, mode, target, sharedQuestions, allowLateJoin, {
        setId: set.id, seed, hash: set.hash || null
    });
    startMultiplayerRound(isCjk, mode, target, sharedQuestions);
}

// 全クライアント共通のメッセージ処理(ホスト・参加者どちらの立場でも呼ばれる)
function handleMpMessage(data) {
    if (data.type === 'roster') {
        mpAllowLateJoin = data.allowLateJoin;
        if (mpMode === 'host') {
            renderMpParticipantList(mpHostConns);
            // ★インゲームメニューを開いている間の参加者リストもリアルタイムに追随させる
            if (document.getElementById('host-ingame-menu').classList.contains('active')) renderHostMenuParticipants();
        }
        else renderMpParticipantList(data.participants, data.hostName);
    } else if (data.type === 'start') {
        // ★ホストが既に進行中のラウンドを打ち切って次を始めた場合、参加者側は
        // 自分がまだプレイ中でも新しいラウンドへ切り替える(ホストの判断を優先)
        if (typeof isPlaying !== 'undefined' && isPlaying) { mpAbortCurrentRoundSilently(); }
        const resolved = mpResolveRoundQuestions(data);
        if (!resolved.ok) { mpShowRoundError(resolved.reason); return; }
        startMultiplayerRound(data.isCjk, data.mode, data.targetValue, resolved.questions);
    } else if (data.type === 'leaderboard') {
        mpUpdateParticipantCountDisplays(data.entries.length);
        renderMpRankingIfVisible();
    } else if (data.type === 'round_over') {
        mpEnterRankingScreen(data.reason);
    } else if (data.type === 'kicked') {
        mpTeardown();
        mpRefreshRoomBadge();
        openScreen('mode-select-screen');
        alert(t('mp_you_were_kicked'));
    } else if (data.type === 'removed') {
        // ★タブが一時停止している間にハートビートが途切れ、ホスト側で
        // タイムアウト退出させられていたケース。「キックもされず続けている
        // 判定のまま固まる」不具合を避けるため、ここで能動的に片付ける。
        mpTeardown();
        mpRefreshRoomBadge();
        openScreen('mode-select-screen');
        alert(t('mp_you_were_removed'));
    } else if (data.type === 'host_disconnected') {
        mpEnterRankingScreen('host_left');
    }
}

// マルチプレイのラウンド終了(自分自身の完走、ホスト離脱、全員離脱いずれか)後に
// 表示するランキング画面。ホストのみ「続ける」ボタンが有効になる。
function mpEnterRankingScreen(reason) {
    // ★強制終了(ホスト離脱/全員離脱)の場合、自分がまだプレイ中である可能性がある。
    // 画面だけ切り替えてタイマーや入力判定が裏で動き続けないよう、先に停止する。
    if (reason && typeof isPlaying !== 'undefined' && isPlaying) { mpAbortCurrentRoundSilently(); }

    openScreen('mp-ranking-screen');
    renderMpRankingIfVisible();

    const statusEl = document.getElementById('mp-ranking-status');
    if (reason === 'host_left') statusEl.innerText = t('mp_host_left');
    else if (reason === 'all_left') statusEl.innerText = t('mp_all_left');
    else statusEl.innerText = '';

    const continueBtn = document.getElementById('mp-continue-btn');
    continueBtn.classList.toggle('hidden', mpMode !== 'host' || reason === 'host_left');
}

function renderMpRankingIfVisible() {
    const listEl = document.getElementById('mp-ranking-list');
    if (!listEl) return;
    const entries = mpLastLeaderboard;
    if (!entries.length) return;

    const top5 = entries.slice(0, 5);
    const mine = entries.find(e => e.id === mpMyId);
    let html = top5.map(e => mpRankRowHtml(e)).join('');
    if (mine && !top5.some(e => e.id === mine.id)) {
        html += `<div class="mp-rank-sep">...</div>` + mpRankRowHtml(mine);
    }
    listEl.innerHTML = html;
}

function mpRankRowHtml(e) {
    const isMe = e.id === mpMyId;
    return `<div class="mp-rank-row${isMe ? ' mp-rank-me' : ''}"><span class="mp-rank-num">#${e.rank}</span><span class="mp-rank-name">${e.name}</span><span class="mp-rank-score">${e.score.toLocaleString()}</span></div>`;
}

// ホストが「続ける」を押した時: 同じルームのまま(参加者もコードもそのまま)、
// 最初のホスト時と同じ手順(問題セット選択画面)を踏むだけ。
function mpContinueRound() {
    if (mpMode !== 'host') return;
    mpGoToQuestionSelect();
}

// ホスト用: ESCで呼ばれるインゲームメニュー。参加者一覧・途中参加可否・
// ルームキー表示をここにまとめている(常時表示のバッジ類は廃止したため、
// 必要な時にここから確認する形にしている)。
function openHostIngameMenu() {
    showHostMenuView('main');
    document.getElementById('host-ingame-menu').classList.add('active');
    document.getElementById('host-menu-allow-late-join').checked = !!mpAllowLateJoin;
    renderHostMenuParticipants();
    document.getElementById('host-menu-room-code-text').innerText = mpRoomCode ? mpRoomCode.toUpperCase() : '--------';
}

function showHostMenuView(view) {
    ['main', 'settings', 'roomkey'].forEach(v => {
        const el = document.getElementById('host-menu-' + v + '-view');
        if (el) el.classList.toggle('hidden', v !== view);
    });
}

function renderHostMenuParticipants() {
    const el = document.getElementById('host-menu-participants');
    if (!el) return;
    let html = `<div class="mp-participant-row mp-participant-host"><span>${mpMyName}</span><span class="mp-role-tag">${t('mp_host_tag')}</span></div>`;
    mpHostConns.forEach(p => {
        html += `<div class="mp-participant-row"><span>${p.name}</span><button class="mp-kick-btn" onclick="mpHostKick('${p.id}')">${t('mp_kick')}</button></div>`;
    });
    el.innerHTML = html;
    document.querySelectorAll('#host-menu-settings-view .mp-participant-count').forEach(elx => { elx.innerText = `${mpHostConns.length + 1}`; });
}

// 途中参加チェックボックスの変更をその場でmpAllowLateJoinへ反映する
function updateAllowLateJoinFromMenu() {
    mpAllowLateJoin = document.getElementById('host-menu-allow-late-join').checked;
}

// ホストから届いた開始情報から、自分の手元にある問題セットを使って
// 同じ出題順を再現する。セットが無い/中身が違う場合は、黙って別の問題で
// 始めてしまわないよう、はっきり失敗として扱う。
function mpResolveRoundQuestions(data) {
    try {
        // 旧形式(問題配列がそのまま入っている)との互換
        if (Array.isArray(data.questions) && data.questions.length) {
            return { ok: true, questions: data.questions };
        }
        if (!data.setId || data.seed === undefined || data.seed === null) {
            return { ok: false, reason: 'mp_err_bad_round' };
        }
        const set = questionSets.find(s => s.id === data.setId);
        if (!set) return { ok: false, reason: 'mp_err_set_missing' };
        // ★同じセットIDでも中身が違えば対戦にならない(改造・版ズレの検出)
        if (data.hash && set.hash && data.hash !== set.hash) {
            return { ok: false, reason: 'mp_err_set_mismatch' };
        }
        const questions = [...set.questions];
        shuffleArraySeeded(questions, data.seed);
        return { ok: true, questions };
    } catch(e) {
        console.error('[multiplayer] 出題順の再現に失敗しました:', e);
        return { ok: false, reason: 'mp_err_bad_round' };
    }
}

function mpShowRoundError(reasonKey) {
    try {
        const el = document.getElementById('mp-join-room-status');
        if (el) el.innerText = t(reasonKey);
        openScreen('mp-join-waiting-screen');
    } catch(e) { console.error('[multiplayer] エラー表示に失敗しました:', e); }
}

function cancelMultiplayerSetup() {
    mpTeardown();
    mpRefreshRoomBadge();
    backToMain();
}

/* ==================== オンライン/オフライン検知 ==================== */
// ★サーバーレスで(navigator.onLineという、外部サーバーへの問い合わせなしで
// ブラウザが把握しているネットワークI/Fの状態だけを見る)判定しているため、
// 「OSはオンラインと言っているが実際にはPeerJSのサーバーに届かない」ケースは
// 検知できない。その場合は実際の接続試行時のエラーハンドリング側で拾う。
function updateMultiplayerAvailability() {
    const btn = document.getElementById('mp-select-btn');
    const notice = document.getElementById('mp-offline-inline-notice');
    const online = navigator.onLine;
    if (btn) { btn.disabled = !online; btn.classList.toggle('mp-btn-disabled', !online); }
    if (notice) notice.classList.toggle('hidden', online);
}
window.addEventListener('online', updateMultiplayerAvailability);
window.addEventListener('offline', updateMultiplayerAvailability);
