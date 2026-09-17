/* ==========================================
   lang.js — 多言語対応まわり
   翻訳データ・翻訳キーの解決・{en, ja}形式データの解決・
   画面全体への翻訳反映(applyTranslations)をまとめて担当する。
========================================== */

const translations = {
    ja: {
        menu_play: "遊ぶ", menu_status: "ステータス", menu_settings: "設定",
        menu_select_set: "問題を選択", menu_setup: "設定",
        play_category: "問題セット", play_mode: "モード", play_target_time: "制限時間(秒)", play_target_amount: "目標問題数", play_start: "スタート",
        play_mode_time: "タイムアタック", play_mode_amount: "問題数指定", btn_back: "戻る", btn_retry: "もう一度", status_best: "最高記録",
        status_history: "履歴", status_empty: "ログデータが存在しません。", setting_lang: "言語", setting_theme: "テーマ",
        setting_style: "スタイル",
        theme_auto: "自動設定 (Auto)", theme_dark: "ダーク (Cyber)", theme_light: "ライト (Hacker)", vol_ui: "UI音量",
        vol_hit: "正解音量", vol_miss: "ミス音量", setting_results: "リザルト表示項目", btn_fullscreen: "全画面切替",
        detail_close: "閉じる", res_total: "総タイプ数", res_wpm: "WPM (単語/分)", res_cpm: "CPM (文字/分)", res_kpm: "KPM (正解数/分)",
        res_correct: "正解数", res_miss: "ミス数", res_acc: "正確率", res_err: "エラー率", forced_rule: "【競技ルール適用中】",
        tooltip_play_mode: "制限時間で打つか、指定問題数を打つか選びます", tooltip_play_target: "目標とする時間・問題数",
        tooltip_lang: "システムの言語を変更します", tooltip_theme: "画面のカラーテーマを変更します",
        tooltip_style: "デザインの系統(サイバー/ミニマル等)を変更します",
        rotate_notice_title: "横画面を推奨します", rotate_notice_body: "端末を横向きにすると、より快適にタイピングできます。", rotate_notice_dismiss: "このまま続ける",
        mp_err_set_missing: "ホストが選んだ問題セットが手元にありません。ページを再読み込みしてから参加し直してください。",
        mp_err_set_mismatch: "問題セットの内容がホストと一致しません。版が違うか、書き換えられている可能性があります。",
        mp_err_bad_round: "対戦開始の情報を正しく受け取れませんでした。",
        status_no_best: "まだ記録がありません。競技ルールの問題セットをプレイすると記録されます。",
        status_no_history: "履歴がまだありません。プレイすると、ここに記録が並んでいきます。",
        status_no_comp_sets: "競技ルールの問題セットが読み込まれていないため、記録を表示できません。",
        mp_no_participants: "まだ誰も参加していません。上のルームキーを相手に伝えてください。",
        qset_import: "JSONから問題を追加",
        qset_import_ok: "問題セットを追加しました",
        qset_import_fail: "読み込めませんでした。JSONの形式を確認してください。",
        qset_imported_tag: "インポート",
        qset_remove_imported: "削除",
        chart_latest: "最新",
        setting_hue: "色味", tooltip_hue: "明るさ・彩度は保ったまま、アクセントカラーの色味だけを変更します",
        tooltip_vol: "各種効果音の大きさを調整します", tooltip_results: "結果画面に表示するデータを選びます",
        tooltip_fullscreen: "全画面表示を切り替えます",
        search_placeholder: "タイトルや説明文で検索...",
        menu_single: "シングルプレイ", menu_multi: "マルチプレイ",
        mp_host: "ホスト", mp_join: "参加",
        mp_your_name: "あなたの名前", mp_room_code: "ルームコード",
        mp_name_placeholder: "3文字以上", mp_code_placeholder: "8文字のコード",
        mp_connect: "接続", mp_next: "次へ",
        mp_name_too_short: "名前は3文字以上で入力してください", mp_code_required: "ルームコードを入力してください",
        mp_hosting: "ホスト中", mp_connecting: "接続中...",
        mp_room_code_label: "このコードを相手に伝えてください", mp_waiting_opponent: "相手の参加を待っています...",
        mp_connecting_status: "ホストに接続しています...", mp_connection_failed: "接続に失敗しました。コードを確認してください。",
        mp_cancel: "キャンセル", mp_opponent: "相手", mp_you: "あなた",
        mp_offline_notice: "※マルチプレイにはインターネット接続が必要です",
        mp_opponent_disconnected: "(相手が切断しました)",
        mp_copied: "コピーしました", mp_copy: "コピー", mp_participants: "参加者", mp_kick: "退出させる",
        mp_host_tag: "ホスト", mp_start_round: "ゲーム開始", mp_waiting_for_start: "ホストの開始を待っています",
        mp_allow_late_join: "ゲーム中の途中参加を許可する",
        mp_name_taken: "その名前は既に使われています", mp_room_full: "満員です",
        mp_connected_waiting: "接続しました。ホストの開始を待っています...",
        mp_waiting_host_round: "接続完了", mp_host_left: "ホストが退出したため対戦を終了しました",
        mp_all_left: "参加者が全員退出したため対戦を終了しました",
        mp_you_were_kicked: "ホストにより退出させられました",
        mp_you_were_removed: "接続が不安定だったため切断されました。ルームに再接続してください。",
        q_load_failed_short: "問題データを読み込めませんでした。",
        q_loading: "問題データを読み込んでいます...", q_loading_short: "読み込み中...",
        q_no_sets_found: "該当する問題セットがありません。",
        q_retrying: "再試行しています...",
        q_unavailable_title: "問題データを読み込めませんでした",
        q_unavailable_body: "インターネット接続が無いか、ブラウザの設定で読み込みがブロックされている可能性があります。接続を確認して再試行してください。",
        q_retry_button: "再試行",
        quit_confirm_title: "退出しますか?", quit_confirm_body: "このラウンドの記録は失われます。",
        quit_confirm_yes: "退出する", quit_confirm_no: "キャンセル",
        host_menu_title: "メニュー", host_menu_resume: "ゲームに戻る",
        global_error_toast: "問題が発生しました。改善しない場合はページを再読み込みしてください。",
        anticheat_alert: "不正な操作が検出されたため、プレイを終了します。",
        mp_continue: "続ける", mp_ranking_title: "対戦結果", mp_finished_count: "完了",
        mp_room_title: "ルーム", mp_select_questions: "問題を選択してゲーム開始",
        mp_creating_room: "ルームを作成しています...", mp_room_ready: "ルームを作成しました",
        mp_badge_count: "{n}人"
    },
    en: {
        menu_play: "PLAY", menu_status: "STATUS", menu_settings: "SETTINGS",
        menu_select_set: "SELECT DATA SET", menu_setup: "SETUP",
        play_category: "Category", play_mode: "Mode", play_target_time: "Time Limit (s)", play_target_amount: "Target Questions", play_start: "START",
        play_mode_time: "Time Attack", play_mode_amount: "Target Amount", btn_back: "Back", btn_retry: "RETRY", status_best: "BEST RECORD",
        status_history: "HISTORY", status_empty: "No log data available.", setting_lang: "Language", setting_theme: "Theme",
        setting_style: "Style",
        theme_auto: "Auto (Device)", theme_dark: "Dark (Cyber)", theme_light: "Light (Hacker)", vol_ui: "UI Vol",
        vol_hit: "Hit Vol", vol_miss: "Miss Vol", setting_results: "Result Display Items", btn_fullscreen: "Fullscreen",
        detail_close: "Close", res_total: "Total Keys", res_wpm: "WPM", res_cpm: "CPM", res_kpm: "KPM",
        res_correct: "Correct", res_miss: "Miss", res_acc: "Accuracy", res_err: "Error Rate", forced_rule: "[COMPETITION RULE ACTIVE]",
        tooltip_play_mode: "Choose Time Attack or Target Amount", tooltip_play_target: "Set your target goal",
        tooltip_lang: "Change system language", tooltip_theme: "Change color theme",
        tooltip_style: "Change the design style (cyber/minimal etc.)",
        rotate_notice_title: "Landscape recommended", rotate_notice_body: "Turn your device sideways for a better typing experience.", rotate_notice_dismiss: "Continue anyway",
        mp_err_set_missing: "You do not have the question set the host chose. Reload the page and rejoin.",
        mp_err_set_mismatch: "Your question set does not match the host's. It may be a different version or modified.",
        mp_err_bad_round: "Could not read the round information from the host.",
        status_no_best: "No record yet. Play a competition-rule set to record one.",
        status_no_history: "No history yet. Your plays will be listed here.",
        status_no_comp_sets: "No competition-rule question sets are loaded, so records cannot be shown.",
        mp_no_participants: "Nobody has joined yet. Share the room key above.",
        qset_import: "Import questions from JSON",
        qset_import_ok: "Question set added",
        qset_import_fail: "Could not load it. Check the JSON format.",
        qset_imported_tag: "Imported",
        qset_remove_imported: "Remove",
        chart_latest: "now",
        setting_hue: "Hue", tooltip_hue: "Shift the accent color's hue while keeping brightness/saturation fixed",
        tooltip_vol: "Adjust sound volume", tooltip_results: "Select data to show on results screen",
        tooltip_fullscreen: "Toggle fullscreen",
        search_placeholder: "Search by title or description...",
        menu_single: "SINGLE PLAYER", menu_multi: "MULTIPLAYER",
        mp_host: "HOST", mp_join: "JOIN",
        mp_your_name: "Your Name", mp_room_code: "Room Code",
        mp_name_placeholder: "3+ characters", mp_code_placeholder: "8-character code",
        mp_connect: "Connect", mp_next: "Next",
        mp_name_too_short: "Name must be at least 3 characters", mp_code_required: "Please enter a room code",
        mp_hosting: "Hosting", mp_connecting: "Connecting...",
        mp_room_code_label: "Share this code with your opponent", mp_waiting_opponent: "Waiting for opponent to join...",
        mp_connecting_status: "Connecting to host...", mp_connection_failed: "Connection failed. Please check the code.",
        mp_cancel: "Cancel", mp_opponent: "Opponent", mp_you: "You",
        mp_offline_notice: "* Multiplayer requires an internet connection",
        mp_opponent_disconnected: "(Opponent disconnected)",
        mp_copied: "Copied", mp_copy: "Copy", mp_participants: "Participants", mp_kick: "Kick",
        mp_host_tag: "HOST", mp_start_round: "Start Game", mp_waiting_for_start: "Waiting for host to start",
        mp_allow_late_join: "Allow joining while a game is in progress",
        mp_name_taken: "That name is already taken", mp_room_full: "Room is full",
        mp_connected_waiting: "Connected. Waiting for host to start...",
        mp_waiting_host_round: "Connected", mp_host_left: "Match ended: host disconnected",
        mp_all_left: "Match ended: all participants left",
        mp_you_were_kicked: "You were removed by the host",
        mp_you_were_removed: "Disconnected due to an unstable connection. Please rejoin the room.",
        q_load_failed_short: "Failed to load question data.",
        q_loading: "Loading question data...", q_loading_short: "Loading...",
        q_no_sets_found: "No sets found.",
        q_retrying: "Retrying...",
        q_unavailable_title: "Failed to load question data",
        q_unavailable_body: "You may be offline, or your browser settings may be blocking the request. Check your connection and retry.",
        q_retry_button: "Retry",
        quit_confirm_title: "Leave this session?", quit_confirm_body: "Your progress in this round will be lost.",
        quit_confirm_yes: "Leave", quit_confirm_no: "Cancel",
        host_menu_title: "Menu", host_menu_resume: "Resume",
        global_error_toast: "Something went wrong. Please reload the page if this persists.",
        anticheat_alert: "Unusual activity was detected, so this play session has ended.",
        mp_continue: "Continue", mp_ranking_title: "Results", mp_finished_count: "finished",
        mp_room_title: "ROOM", mp_select_questions: "Select Questions & Start",
        mp_creating_room: "Creating room...", mp_room_ready: "Room created",
        mp_badge_count: "{n} players"
    }
};
let currentLang = "ja";
function t(key) { return translations[currentLang]?.[key] || key; }

// {en, ja} 形式のオブジェクト（問題セット名・説明・タグ名など）を
// 現在の言語で解決する。文字列がそのまま渡された場合はそのまま返す。
function getI18nText(obj) {
    if (!obj) return "";
    if (typeof obj === 'string') return obj;
    return obj[currentLang] || obj['en'] || "";
}

// 現在の言語設定を画面全体に反映する（言語切り替え時・初期表示時に呼ぶ）
// 各screenの再描画関数（questions.jsのデータを表示するもの）にも
// 反映が必要なため、ここから横断的に呼び出している。
function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => { el.innerText = t(el.getAttribute('data-i18n')); });
    document.querySelectorAll('[data-i18n-title]').forEach(el => { el.title = t(el.getAttribute('data-i18n-title')); });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => { el.placeholder = t(el.getAttribute('data-i18n-placeholder')); });

    const optTime = document.getElementById('opt-mode-time'); if(optTime) optTime.innerText = t('play_mode_time');
    const optAmt = document.getElementById('opt-mode-amount'); if(optAmt) optAmt.innerText = t('play_mode_amount');

    updateStatusCategoryOptions();
    initTagFilters();
    if (typeof renderSettingsFields === 'function') renderSettingsFields(); // 選択肢のラベルを現在の言語で再生成
    if(document.getElementById('play-select-screen').classList.contains('active')) renderQuestionSets();
    if(selectedQSetId) {
        const set = questionSets.find(s => s.id === selectedQSetId);
        if(set) {
            document.getElementById('setup-qset-name').innerText = getI18nText(set.name);
            document.getElementById('setup-qset-desc').innerText = getI18nText(set.description);
        }
    }
    updateFormUI();

    // ★main-play-btnは通常時はdata-i18n="menu_play"の対象だが、問題データの
    // 読み込み中/失敗中は「読み込み中...」等の専用文言を出している。
    // 上のdata-i18n一括置換で上書きされてしまわないよう、ここで最後に
    // 現在の読み込み状態を見て必要なら文言を出し直す。
    if (typeof questionsLoadState !== 'undefined') {
        if (questionsLoadState === 'loading' && typeof showQuestionsLoadingState === 'function') showQuestionsLoadingState();
        else if (questionsLoadState === 'empty' && typeof showQuestionsUnavailableNotice === 'function') showQuestionsUnavailableNotice();
    }
}
