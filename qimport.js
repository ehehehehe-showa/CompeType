/* ==========================================
   qimport.js — 問題セットJSONのインポートとローカル保存

   ・手元のJSONファイルを読み込んで問題セットとして追加できる
   ・追加したセットはlocalStorageに保存され、次回以降も自動で読み込まれる
     (配信元のquestions/以下を触らずに自分用の問題を持てる)

   ★配信されているセットのオフライン利用については、service-worker.js が
   questions/*.json をキャッシュしているので、そちらで担保されている。
   ここで扱うのは「利用者が自分で追加したセット」の保存のみ。

   ★インポートしたセットは hash を持たない(または一致を保証できない)ため、
   questions.js の検証では verified:false になる。中身を自由に書ける以上、
   競技記録として他人と比較できるものではない、という扱いにしている。
========================================== */

const IMPORTED_SETS_KEY = 'typingImportedSets_v1';

function loadImportedSets() {
    try {
        const raw = localStorage.getItem(IMPORTED_SETS_KEY);
        if (!raw) return [];
        const list = JSON.parse(raw);
        return Array.isArray(list) ? list : [];
    } catch (e) {
        console.error('[qimport] 保存済みセットの読み込みに失敗しました:', e);
        return [];
    }
}

function persistImportedSets(list) {
    try {
        localStorage.setItem(IMPORTED_SETS_KEY, JSON.stringify(list));
        return true;
    } catch (e) {
        // 容量超過やプライベートモードで失敗しうる
        console.error('[qimport] セットの保存に失敗しました:', e);
        return false;
    }
}

// 受け取ったJSONが問題セットとして最低限成立しているかを見る。
// ここを通らないものは登録しない(壊れたデータでゲームが止まるのを防ぐ)。
function validateImportedSet(data) {
    if (!data || typeof data !== 'object') return '形式がオブジェクトではありません';
    if (!data.id || typeof data.id !== 'string') return 'id がありません';
    if (!Array.isArray(data.questions) || data.questions.length === 0) return 'questions が空です';

    const isCjk = data.is_cjk !== false;
    for (let i = 0; i < data.questions.length; i++) {
        const q = data.questions[i];
        if (isCjk) {
            if (!q || typeof q.text !== 'string' || typeof q.kana !== 'string') return `questions[${i}] に text/kana がありません`;
            if (q.text.split('|').length !== q.kana.split('|').length) return `questions[${i}] の text と kana のグループ数が一致しません`;
        } else {
            if (typeof q !== 'string' || !q) return `questions[${i}] が文字列ではありません`;
        }
    }
    return null;
}

// 起動時に呼ぶ。保存済みのインポートセットを questionSets に登録する。
function registerImportedSets() {
    const list = loadImportedSets();
    let count = 0;
    list.forEach(set => {
        try {
            const err = validateImportedSet(set);
            if (err) { console.warn(`[qimport] 保存済みセット "${set && set.id}" をスキップ: ${err}`); return; }
            set.imported = true;
            set.verified = false;
            registerQuestionSet(set);
            count++;
        } catch (e) {
            console.error('[qimport] 保存済みセットの登録に失敗しました:', e);
        }
    });
    return count;
}

// ファイル選択 → 読み込み → 検証 → 登録 → 保存
function handleQuestionImport(inputEl) {
    try {
        const file = inputEl && inputEl.files && inputEl.files[0];
        if (!file) return;
        const reader = new FileReader();

        reader.onerror = () => {
            console.error('[qimport] ファイルの読み取りに失敗しました');
            showImportStatus(t('qset_import_fail'), true);
        };

        reader.onload = () => {
            try {
                const data = JSON.parse(reader.result);
                const err = validateImportedSet(data);
                if (err) {
                    console.warn('[qimport] 検証エラー:', err);
                    showImportStatus(t('qset_import_fail') + ' (' + err + ')', true);
                    return;
                }
                if (questionSets.some(s => s.id === data.id)) {
                    showImportStatus(t('qset_import_fail') + ' (id が既存と重複)', true);
                    return;
                }

                data.imported = true;
                data.verified = false;
                registerQuestionSet(data);

                const list = loadImportedSets();
                list.push(data);
                if (!persistImportedSets(list)) {
                    // 登録はできたが保存に失敗 → 今回だけ使える状態であることを伝える
                    showImportStatus(t('qset_import_ok') + ' (保存はできませんでした)', true);
                } else {
                    showImportStatus(t('qset_import_ok'), false);
                }

                if (typeof renderQuestionSets === 'function') renderQuestionSets();
                if (typeof updateStatusCategoryOptions === 'function') updateStatusCategoryOptions();
            } catch (e) {
                console.error('[qimport] JSONの解析に失敗しました:', e);
                showImportStatus(t('qset_import_fail'), true);
            } finally {
                // 同じファイルをもう一度選べるように値をクリアする
                try { inputEl.value = ''; } catch (e) {}
            }
        };

        reader.readAsText(file);
    } catch (e) {
        console.error('[qimport] インポート処理に失敗しました:', e);
        showImportStatus(t('qset_import_fail'), true);
    }
}

function showImportStatus(message, isError) {
    try {
        const el = document.getElementById('qset-import-status');
        if (!el) return;
        el.innerText = message;
        el.classList.toggle('import-error', !!isError);
        clearTimeout(showImportStatus._timer);
        showImportStatus._timer = setTimeout(() => { try { el.innerText = ''; } catch (e) {} }, 5000);
    } catch (e) {
        console.error('[qimport] 状態表示に失敗しました:', e);
    }
}

// インポートしたセットを削除する
function removeImportedSet(setId) {
    try {
        const list = loadImportedSets().filter(s => s.id !== setId);
        persistImportedSets(list);
        const idx = questionSets.findIndex(s => s.id === setId);
        if (idx !== -1) questionSets.splice(idx, 1);
        if (typeof renderQuestionSets === 'function') renderQuestionSets();
        if (typeof updateStatusCategoryOptions === 'function') updateStatusCategoryOptions();
    } catch (e) {
        console.error('[qimport] インポートセットの削除に失敗しました:', e);
    }
}
