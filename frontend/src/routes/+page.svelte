<script lang="ts">
	import { fade, slide } from 'svelte/transition';
	import { simulateMeetingGeneration } from '$lib/simulation';

	// i18n logic
	type Language = 'ru' | 'en' | 'jp';
	let currentLanguage = $state<Language>('ru');

	const translations = {
		ru: {
			app_title: 'TimeWave',
			landing_badge: 'AI-Редактор Планирования',
			landing_subtitle: 'Conceptual Demo',
			landing_description: 'Испытайте новое поколение управления проектами.<br /> Система автономно координирует структуру встреч, таймбоксы и динамику команды.',
			landing_button: 'Назначить встречу',
			strategy_widget: 'Стратегия развития TimeWave AI',
			setup_back: 'Вернуться на главную',
			setup_badge: 'Конфигуратор Встречи',
			setup_title: 'Панель управления встречей',
			setup_topic_label: 'Тема встречи',
			setup_topic_placeholder: 'Например: Анализ деградации качества тестирования',
			setup_points_label: 'Ключевые тезисы (каждый с новой строки)',
			setup_points_placeholder: '- Тезис 1\n- Тезис 2',
			setup_duration_label: 'Длительность',
			setup_duration_unit: 'мин',
			setup_generate_button: 'Сгенерировать план',
			setup_generate_hint: 'Нажмите для подтверждения конфигурации и запуска ИИ',
			setup_sync_hint: 'Синхронизируйте шаблоны и параметры времени для начала работы TimeWave AI.',
			setup_template_points_label: 'Ключевые тезисы сценария:',
			generating_title: 'Создание плана...',
			generating_cancel: 'Отменить',
			session_overtime: 'OVERTIME',
			session_active: 'Встреча активна',
			session_finish: 'Завершить',
			session_pause: 'Пауза',
			session_continue: 'Продолжить',
			session_start: 'Начать встречу',
			session_time_remaining: 'Оставшееся время',
			session_step_prefix: 'Шаг',
			session_motto: 'Девиз встречи',
			session_goal: 'Цель встречи',
			session_plan_badge: 'Порядок действий',
			session_plan_title: 'План встречи',
			session_points_badge: 'Контроль содержания',
			session_points_title: 'Ключевые тезисы',
			session_points_prefix: 'Тезис',
			insight_tabs_rules: 'Правила',
			insight_tabs_advice: 'Советы',
			insight_advice_prefix: 'Совет',
			insight_mechanic_title: 'Механика встречи',
			insight_next_tip: 'Следующий совет',
			summary_back: 'Завершить просмотр',
			summary_title: 'Анализ итогов встречи',
			summary_subtitle: 'Результаты синхронизации: итоги, тезисы, решения.',
			summary_metrics_badge: 'Метрики',
			summary_metrics_title: 'Выполненные этапы',
			summary_results_badge: 'Результаты',
			summary_results_title: 'Разобранные тезисы',
			summary_button_setup: 'Панель управления',
			summary_button_restart: 'Главное меню',
			strategy_modal_title: 'Стратегия TimeWave AI',
			strategy_phase_1: 'MVP & UX Mastery',
			strategy_phase_1_desc: 'Создание ядра AI-движка и премиального Azure Pearl интерфейса. Оптимизация под живые переговоры.',
			strategy_phase_2: 'Ecosystem Expansion',
			strategy_phase_2_desc: 'API-интеграции с Jira, Slack, Teams. Облачная синхронизация отчетов и «артефактов».',
			strategy_phase_3: 'Cognitive AI',
			strategy_phase_3_desc: 'Анализ тональности, невербальных сигналов и AI-коучинг в реальном времени.',
			strategy_revenue_title: 'Прогноз и рынок',
			strategy_revenue_target: 'Target ARR',
			strategy_revenue_model: 'Model',
			strategy_revenue_desc: 'Фокус на Enterprise-сегмент и консалтинговые агентства. Монетизация через подписку и лицензирование AI-технологий.',
			strategy_contact_title: 'Свяжитесь для масштабирования',
			strategy_contact_desc: 'Готовы к партнерству или разработке сложных корпоративных решений.',
			templates: [
				{ id: 'quality', title: 'Качество тестирования', description: 'Анализ деградации качества и ревизия процессов Code Review.', topic: 'Анализ деградации качества тестирования', points: '- Оценка покрытия Unit-тестами\n- Ревизия процесса Code Review\n- Оптимизация регрессионного цикла\n- Автоматизация критических путей', icon: '🧪' },
				{ id: 'stakeholder', title: 'Жалобы стейкхолдеров', description: 'Синхронизация ожиданий и прозрачность роадмапа продукта.', topic: 'Урегулирование требований стейкхолдеров', points: '- Синхронизация ожиданий и реальности\n- Прозрачность роадмапа продукта\n- Коммуникационный протокол изменений\n- Приоритизация бизнес-ценностей', icon: '🤝' },
				{ id: 'incident', title: 'Инцидент на продакшене', description: 'Анализ причин и план действий после сбоя.', topic: 'Разбор итогов: критический инцидент в работе', points: '- Поиск первопричин (анализ ситуации)\n- Эффективность системы мониторинга\n- Скорость реагирования команды\n- План превентивных мер', icon: '🚨' }
			],
			mechanics: [
				{ id: 'robin', title: 'Round Robin', rules: 'Каждый участник по очереди высказывается по 1 минуте. Никаких прерываний, пока круг не завершен.' },
				{ id: 'popcorn', title: 'Popcorn', rules: 'Участник заканчивает свою речь и передает слово любому другому «по желанию».' },
				{ id: 'stack', title: 'The Stack', rules: 'Ведущий ведет очередь желающих высказаться (стек). Кто хочет говорить — дает сигнал.' },
				{ id: 'silent', title: 'Silent Brainstorm', rules: '2 минуты тишины для записи идей каждым участником, затем краткий разбор всех записей.' },
				{ id: '124all', title: '1-2-4-All', rules: '1 мин думаем сами, 2 мин в парах, 4 мин в четверках. Затем выносим на общее обсуждение.' }
			],
			tips: [
				"Если дискуссия зашла в тупик, сделайте 5-минутный перерыв для перезагрузки.",
				"Назначайте «хранителя времени», который будет деликатно напоминать о таймбоксах.",
				"Паркуйте сложные вопросы, не относящиеся к текущей теме, в отдельный список «Парковка».",
				"Следите за тем, чтобы более активные участники не доминировали в беседе.",
				"Резюмируйте каждое принятое решение перед переходом к следующему шагу.",
				"Используйте «правило 2 минут»: если ответ можно дать быстро, делайте это сейчас.",
				"Включайте камеру, если встреча проходит онлайн — это на 40% повышает вовлеченность.",
				"Если встреча длится более 60 минут, делайте обязательную физическую разминку.",
				"Записывайте поручения сразу с именами ответственных и четким дедлайном.",
				"Заканчивайте встречу на 5 минут раньше для личной рефлексии участников."
			]
		},
		en: {
			app_title: 'TimeWave',
			landing_badge: 'AI Planning Interface',
			landing_subtitle: 'Conceptual Demo',
			landing_description: 'Experience the next generation of project management.<br /> The system autonomously coordinates meeting structures, timeboxes, and team dynamics.',
			landing_button: 'Get Started',
			strategy_widget: 'TimeWave AI Roadmap',
			setup_back: 'Back to landing',
			setup_badge: 'Meeting Configurator',
			setup_title: 'Meeting Control Panel',
			setup_topic_label: 'Meeting Topic',
			setup_topic_placeholder: 'e.g., Analyzing test quality degradation',
			setup_points_label: 'Key Points (each on a new line)',
			setup_points_placeholder: '- Point 1\n- Point 2',
			setup_duration_label: 'Duration',
			setup_duration_unit: 'min',
			setup_generate_button: 'Generate Plan',
			setup_generate_hint: 'Click to confirm configuration and start AI.',
			setup_sync_hint: 'Synchronize templates and time parameters to start TimeWave AI.',
			setup_template_points_label: 'Scenario key points:',
			generating_title: 'Generating plan...',
			generating_cancel: 'Cancel',
			session_overtime: 'OVERTIME',
			session_active: 'Meeting Active',
			session_finish: 'Finish',
			session_pause: 'Pause',
			session_continue: 'Continue',
			session_start: 'Start Meeting',
			session_time_remaining: 'Time Remaining',
			session_step_prefix: 'Step',
			session_motto: 'Meeting Motto',
			session_goal: 'Meeting Goal',
			session_plan_badge: 'Proceedings',
			session_plan_title: 'Meeting Plan',
			session_points_badge: 'Content Control',
			session_points_title: 'Key Points',
			session_points_prefix: 'Point',
			insight_tabs_rules: 'Rules',
			insight_tabs_advice: 'Advice',
			insight_advice_prefix: 'Tip',
			insight_mechanic_title: 'Meeting Mechanic',
			insight_next_tip: 'Next Tip',
			summary_back: 'Exit Review',
			summary_title: 'Meeting Summary Analysis',
			summary_subtitle: 'Synchronization results: summaries, points, decisions.',
			summary_metrics_badge: 'Metrics',
			summary_metrics_title: 'Completed Stages',
			summary_results_badge: 'Results',
			summary_results_title: 'Resolved Topics',
			summary_button_setup: 'Control Panel',
			summary_button_restart: 'Main Menu',
			strategy_modal_title: 'TimeWave AI Strategy',
			strategy_phase_1: 'MVP & UX Mastery',
			strategy_phase_1_desc: 'Core AI engine development and premium Azure Pearl UI. Optimization for live discussion.',
			strategy_phase_2: 'Ecosystem Expansion',
			strategy_phase_2_desc: 'API integrations with Jira, Slack, Teams. Cloud sync for reports and "artifacts".',
			strategy_phase_3: 'Cognitive AI',
			strategy_phase_3_desc: 'Sentimental analysis, non-verbal cues, and real-time AI coaching.',
			strategy_revenue_title: 'Forecast & Market',
			strategy_revenue_target: 'Target ARR',
			strategy_revenue_model: 'Model',
			strategy_revenue_desc: 'Focus on Enterprise segment and consulting agencies. Monetization through subscription and licensing of AI technologies.',
			strategy_contact_title: 'Contact for Scaling',
			strategy_contact_desc: 'Ready for partnership or complex enterprise development.',
			templates: [
				{ id: 'quality', title: 'Testing Quality', description: 'Analyzing quality degradation and reviewing Code Review processes.', topic: 'Quality Degradation Analysis', points: '- Unit test coverage evaluation\n- Code Review process revision\n- Regression cycle optimization\n- Critical path automation', icon: '🧪' },
				{ id: 'stakeholder', title: 'Stakeholder Complaints', description: 'Synchronizing expectations and product roadmap transparency.', topic: 'Stakeholder Requirements Alignment', points: '- Synchronizing expectations and reality\n- Product roadmap transparency\n- Communication protocol for changes\n- Business value prioritization', icon: '🤝' },
				{ id: 'incident', title: 'Production Incident', description: 'Root cause analysis and action plan after a failure.', topic: 'Post-mortem: Critical Production Incident', points: '- Root cause analysis\n- Monitoring system effectiveness\n- Team response speed\n- Preventive measures plan', icon: '🚨' }
			],
			mechanics: [
				{ id: 'robin', title: 'Round Robin', rules: 'Each participant speaks for 1 minute in order. No interruptions until the circle is complete.' },
				{ id: 'popcorn', title: 'Popcorn', rules: 'A participant finishes their speech and passes the floor to anyone else "at will".' },
				{ id: 'stack', title: 'The Stack', rules: 'The facilitator keeps a queue (stack) of those who want to speak. Signal when you want to talk.' },
				{ id: 'silent', title: 'Silent Brainstorm', rules: '2 minutes of silence for each participant to write down ideas, followed by a brief review.' },
				{ id: '124all', title: '1-2-4-All', rules: '1 min alone, 2 min in pairs, 4 min in fours. Then bring to the general discussion.' }
			],
			tips: [
				"If discussion hits a dead end, take a 5-minute break to reset.",
				"Appoint a \"Timekeeper\" to gently remind participants of timeboxes.",
				"Park complex questions not related to the current topic in a \"Parking Lot\" list.",
				"Monitor to ensure more vocal participants do not dominate the conversation.",
				"Summarize each decision made before moving on to the next step.",
				"Use the \"2-minute rule\": if a response can be given quickly, do it now.",
				"Turn on cameras for online meetings; it increases engagement by 40%.",
				"If the meeting lasts more than 60 minutes, do a mandatory physical stretching break.",
				"Record action items immediately with owners and clear deadlines.",
				"End the meeting 5 minutes early for personal reflection of participants."
			]
		},
		jp: {
			app_title: 'TimeWave',
			landing_badge: 'AIプランニングエディタ',
			landing_subtitle: 'コンセプトデモ',
			landing_description: '次世代のプロジェクト管理を体験してください。<br /> システムが自律的に会議の構成、タイムボックス、チームのダイナミクスを調整します。',
			landing_button: '会議を予約する',
			strategy_widget: 'TimeWave AI 開発戦略',
			setup_back: 'トップに戻る',
			setup_badge: '会議コンフィギュレーター',
			setup_title: '会議コントロールパネル',
			setup_topic_label: '会議のテーマ',
			setup_topic_placeholder: '例：テスト品質低下の分析',
			setup_points_label: '重要なポイント（改行で入力）',
			setup_points_placeholder: '- ポイント 1\n- ポイント 2',
			setup_duration_label: '所要時間',
			setup_duration_unit: '分',
			setup_generate_button: 'プランを生成',
			setup_generate_hint: '設定を確認してAIを開始するにはクリックしてください',
			setup_sync_hint: 'TimeWave AIを開始するために、テンプレートと時間パラメータを同期してください。',
			setup_template_points_label: 'シナリオの重要なポイント：',
			generating_title: 'プランを生成中...',
			generating_cancel: 'キャンセル',
			session_overtime: '残業',
			session_active: '会議中',
			session_finish: '終了',
			session_pause: '一時停止',
			session_continue: '続行',
			session_start: '会議を開始',
			session_time_remaining: '残り時間',
			session_step_prefix: 'ステップ',
			session_motto: '会議のモットー',
			session_goal: '会議の目的',
			session_plan_badge: '議事進行',
			session_plan_title: '会議プラン',
			session_points_badge: '内容管理',
			session_points_title: '重要なポイント',
			session_points_prefix: 'ポイント',
			insight_tabs_rules: 'ルール',
			insight_tabs_advice: 'アドバイス',
			insight_advice_prefix: 'ヒント',
			insight_mechanic_title: '会議のメカニズム',
			insight_next_tip: '次のアドバイス',
			summary_back: 'レビューを終了',
			summary_title: '会議結果の分析',
			summary_subtitle: '同期結果：要約、ポイント、決定事項。',
			summary_metrics_badge: 'メトリクス',
			summary_metrics_title: '完了したステージ',
			summary_results_badge: '結果',
			summary_results_title: '解決されたトピック',
			summary_button_setup: 'コントロールパネル',
			summary_button_restart: 'メインメニュー',
			strategy_modal_title: 'TimeWave AI 戦略',
			strategy_phase_1: 'MVP & UX マスター',
			strategy_phase_1_desc: 'コアAIエンジンの開発とプレミアムなAzure Pearl UI。ライブディスカッションへの最適化。',
			strategy_phase_2: 'エコシステムの拡大',
			strategy_phase_2_desc: 'JiraやSlack、TeamsとのAPI統合。レポートや「アーティファクト」のクラウド同期。',
			strategy_phase_3: '認知型 AI',
			strategy_phase_3_desc: '感情分析、非言語的手がかり、リアルタイムのAIコーチング。',
			strategy_revenue_title: '予測と市場',
			strategy_revenue_target: '目標 ARR',
			strategy_revenue_model: 'モデル',
			strategy_revenue_desc: 'エンタープライズセグメントとコンサルティングエージェンシーに焦点を当てています。サブスクリプションとAI技術のライセンス供与による収益化。',
			strategy_contact_title: 'スケーリングのお問い合わせ',
			strategy_contact_desc: 'パートナーシップや複雑なエンタープライズ開発の準備ができています。',
			templates: [
				{ id: 'quality', title: 'テスト品質', description: '品質低下の分析とコードレビュープロセスの見直し。', topic: '品質低下の分析', points: '- ユニットテストのカバレッジ評価\n- コードレビュープロセスの見直し\n- 回帰サイクルの最適化\n- クリティカルパスの自動化', icon: '🧪' },
				{ id: 'stakeholder', title: '関係者の苦情', description: '期待の同期とプロダクトロードマップの透明性。', topic: 'ステークホルダーの期待値調整', points: '- 期待と現実の同期\n- プロダクトロードマップの透明性\n- 変更に関するコミュニケーションプロトコル\n- ビジネス価値の優先順位付け', icon: '🤝' },
				{ id: 'incident', title: '商用障害', description: '根本原因の分析と障害後のアクションプラン。', topic: 'ポストモーテム：重大な不具合の分析', points: '- 根本原因の特定\n- モニタリングシステムの有効性\n- チームの対応スピード\n- 再発防止策の策定', icon: '🚨' }
			],
			mechanics: [
				{ id: 'robin', title: 'ラウンドロビン', rules: '各参加者が順番に1分間発言します。全員が終わるまで中断は禁止です。' },
				{ id: 'popcorn', title: 'ポップコーン', rules: '発言者が終わったら、次に話したい人を自由に指名します。' },
				{ id: 'stack', title: 'スタック', rules: '進行役が発言希望者のリスト（スタック）を管理します。話したいときは合図を。' },
				{ id: 'silent', title: 'サイレント・ブレスト', rules: '全員が2分間黙ってアイデアを書き出し、その後に全員で共有します。' },
				{ id: '124all', title: '1-2-4-All', rules: '1分間で個人考案、2分間でペア共有、4分間で4人共有。最後に全体会議に出します。' }
			],
			tips: [
				"議論が行き詰まったら、5分間の休憩を挟んでリセットしてください。",
				"タイムボックスを意識するために「タイムキーパー」を任命しましょう。",
				"現在のトピックに関係のない複雑な質問は「パーキングロット」に預けましょう。",
				"特定の人ばかりが話しすぎないよう、発言のバランスに注意しましょう。",
				"次のステップに進む前に、下された決定事項を必ず要約しましょう。",
				"「2分ルール」：すぐに答えられることは、その場で解決しましょう。",
				"オンライン会議ではカメラをオンにしましょう。エンゲージメントが40%向上します。",
				"会議が60分を超える場合は、必ずストレッチ休憩を入れましょう。",
				"決定事項と担当者、期限はその場ですぐに記録しましょう。",
				"振り返りの時間を作るために、予定より5分早く会議を切り上げましょう。"
			]
		}
	};

	const t = $derived(translations[currentLanguage]);

	// State definitions
	type AppState = 'landing' | 'setup' | 'generating' | 'session' | 'summary';
	let currentState = $state<AppState>('landing');

	// Form inputs
	let topic = $state('');
	let keyPoints = $state('');
	let duration = $state(30);

	const templates = $derived(t.templates);

	let selectedTemplateId = $state<string | null>(null);

	function selectTemplate(id: string) {
		const template = templates.find((t) => t.id === id);
		if (template) {
			selectedTemplateId = id;
			topic = template.topic;
			keyPoints = template.points;
		}
	}

	// AI Generation Status
	let generationStatusMessage = $state('Инициализация...');

	// Meeting Data structure
	type TimeBox = { title: string; durationRange: string; isCompleted: boolean };
	type MeetingData = {
		structure: {
			manifesto: string;
			timeBoxes: TimeBox[];
		};
		intentionality: {
			goal: string;
			keyPoints: { text: string; isCompleted: boolean }[];
		};
		collaboration: {
			engagementMechanic: string;
		};
		inclusivity: {
			advice: string;
		};
	};

	let meetingData = $state<MeetingData | null>(null);

	// Timer logic
	let timeRemaining = $state(0);

	// Initialize timer when session starts
	$effect(() => {
		if (currentState === 'session' && meetingData) {
			timeRemaining = duration * 60;
		}
	});
	let isTimerRunning = $state(false);
	let hasStarted = $state(false);
	let activeTimeBoxIndex = $state(0);
	let timerInterval: ReturnType<typeof setInterval>;

	$effect(() => {
		if (isTimerRunning) {
			timerInterval = setInterval(() => {
				timeRemaining--;
			}, 1000);
		} else {
			clearInterval(timerInterval);
		}
		return () => clearInterval(timerInterval);
	});

	let showStickyTimer = $state(false);
	$effect(() => {
		const handleScroll = () => {
			showStickyTimer = window.pageYOffset > 400 && currentState === 'session';
		};
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	});

	let activeInsightTab = $state<'rules' | 'advice'>('rules');

	const mechanics = $derived(t.mechanics);

	const tips = $derived(t.tips);

	let selectedMechanicId = $state('robin');
	let currentTipIndex = $state(0);

	function nextTip() {
		currentTipIndex = (currentTipIndex + 1) % tips.length;
	}

	// Formatting MM:SS
	let formattedTime = $derived.by(() => {
		const isNegative = timeRemaining < 0;
		const absTime = Math.abs(timeRemaining);
		const m = Math.floor(absTime / 60)
			.toString()
			.padStart(2, '0');
		const s = (absTime % 60).toString().padStart(2, '0');
		return `${isNegative ? '-' : ''}${m}:${s}`;
	});

	async function startGeneration() {
		if (!topic.trim()) return;

		currentState = 'generating';
		generationStatusMessage = '...';

		try {
			const stream = simulateMeetingGeneration(topic, keyPoints, duration, currentLanguage);

			for await (const chunk of stream) {
				if (chunk.event === 'status') {
					generationStatusMessage = chunk.data;
				} else if (chunk.event === 'complete') {
					meetingData = JSON.parse(chunk.data);
					currentState = 'session';
				}
			}
		} catch (e) {
			console.error(e);
			generationStatusMessage = 'Произошла ошибка при генерации.';
			setTimeout(() => (currentState = 'setup'), 3000);
		}
	}

	let showStrategyModal = $state(false);

	function toggleTimer() {
		isTimerRunning = !isTimerRunning;
		if (isTimerRunning) hasStarted = true;
	}

	function completeTimeBox(index: number) {
		if (!meetingData) return;
		meetingData.structure.timeBoxes[index].isCompleted =
			!meetingData.structure.timeBoxes[index].isCompleted;
	}

	function completeKeyPoint(index: number) {
		if (!meetingData) return;
		meetingData.intentionality.keyPoints[index].isCompleted =
			!meetingData.intentionality.keyPoints[index].isCompleted;
	}

	function finishSession() {
		isTimerRunning = false;
		currentState = 'summary';
	}

	function restart() {
		meetingData = null;
		topic = '';
		keyPoints = '';
		hasStarted = false;
		currentState = 'setup';
	}
</script>

<div class="animate-in fade-in space-y-12 duration-700 relative">
	{#if currentState === 'landing'}
		<!-- Language Switcher -->
		<div class="fixed top-8 left-10 z-40 flex gap-4">
			{#each ['ru', 'en', 'jp'] as lang}
				<button 
					onclick={() => currentLanguage = lang as Language}
					class="text-[10px] font-bold tracking-[0.15em] uppercase transition-all {currentLanguage === lang ? 'text-brand-blue' : 'text-white/20 hover:text-white/50'}"
				>
					{lang}
				</button>
			{/each}
		</div>

		<!-- Strategy Widget -->
		<div class="fixed top-8 right-10 z-40">
			<button 
				onclick={() => showStrategyModal = true}
				class="group flex items-center gap-3 transition-all active:scale-95"
			>
				<div class="relative flex h-2 w-2">
					<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-blue opacity-50"></span>
					<span class="relative inline-flex rounded-full h-2 w-2 bg-brand-blue shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
				</div>
				<span class="text-[10px] font-bold tracking-[0.15em] text-white/30 uppercase group-hover:text-white/80 transition-all">
					{t.strategy_widget}
				</span>
			</button>
		</div>

		<div class="flex flex-col items-center justify-center px-4 py-24 text-center md:py-40" in:fade>
			<!-- App Status Badge -->
			<div class="-mt-12 mb-8 flex flex-col items-center gap-4">
				<div
					class="inline-flex items-center justify-center gap-3 rounded-[32px] border border-white/10 bg-white/5 px-5 py-2.5 saturate-150 backdrop-blur-xl"
				>
					<span
						class="bg-brand-blue h-2.5 w-2.5 animate-pulse rounded-full shadow-[0_0_12px_rgba(59,130,246,0.8)]"
					></span>
					<span class="text-sm font-medium tracking-wide text-white/70 uppercase"
						>{t.landing_badge}</span
					>
				</div>
			</div>

			<h1
				class="font-jakarta mb-4 flex flex-wrap items-baseline justify-center text-5xl leading-none font-bold tracking-normal text-white md:text-7xl lg:text-8xl"
			>
				<span class="relative flex items-baseline">
					<span
						class="bg-brand-blue/10 absolute -inset-10 -z-10 animate-pulse rounded-full blur-[100px]"
					></span>
					<span
						class="bg-gradient-to-b from-[#F8FAFC] via-[#E0F2FE] to-[#94A3B8] bg-clip-text text-transparent"
						>{t.app_title}</span
					>
					<span class="text-shimmer-blue ml-2 font-black">AI</span>
				</span>
			</h1>

			<!-- Sub-titles and social -->
			<div class="mb-12 flex flex-col items-center gap-2">
				<span class="text-[12px] font-medium text-white/30 uppercase"
					>{t.landing_subtitle}</span
				>
				<a
					href="https://github.com/Piryutko"
					target="_blank"
					class="text-shimmer-blue text-[11px] font-medium uppercase transition-opacity hover:opacity-80"
				>
					github.com/Piryutko
				</a>
			</div>

			<p
				class="mx-auto mb-16 max-w-2xl text-[21px] leading-relaxed font-normal text-white/50"
			>
				{@html t.landing_description}
			</p>

			<div class="mb-16 flex flex-col items-center gap-8">
				<div class="flex flex-col items-center gap-6 sm:flex-row">
					<button
						onclick={() => (currentState = 'setup')}
						class="group border-brand-blue/50 hover:border-brand-blue hover:bg-brand-blue/10 relative overflow-hidden rounded-[32px] border-2 bg-white/5 px-10 py-5 text-sm font-bold tracking-wide text-white uppercase backdrop-blur-xl transition-all hover:shadow-[0_0_50px_rgba(59,130,246,0.3)] active:scale-95"
					>
						<span class="relative z-10 flex items-center gap-3">
							{t.landing_button}
							<svg
								class="text-brand-blue h-4 w-4 transition-transform group-hover:translate-x-1"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="3"
									d="M13 7l5 5m0 0l-5 5m5-5H6"
								/></svg
							>
						</span>
						<div
							class="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform group-hover:animate-[shimmer_1.5s_infinite]"
						></div>
					</button>
				</div>
			</div>
		</div>
	{:else if currentState === 'setup'}
		<div class="mx-auto mt-10 max-w-6xl space-y-8" in:fade>
			<!-- Header Title Section -->
			<div class="mb-6">
				<button
					onclick={() => (currentState = 'landing')}
					class="flex items-center gap-2 text-white/30 hover:text-white transition-colors group"
				>
					<svg class="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
					</svg>
					<span class="text-[10px] font-bold tracking-widest uppercase">{t.setup_back}</span>
				</button>
			</div>
			<div class="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
				<div>
					<span class="text-brand-blue mb-2 block text-[10px] font-bold tracking-wide uppercase"
						>{t.setup_badge}</span
					>
					<h2 class="text-4xl font-bold text-[--color-azure-pearl]">{t.setup_title}</h2>
				</div>
				<p class="max-w-md font-medium text-white/40 md:text-right text-sm">
					{t.setup_sync_hint}
				</p>
			</div>

			<div class="grid grid-cols-1 gap-8 lg:grid-cols-12">
				<!-- Left Column: Patterns/Templates (7/12) -->
				<div class="space-y-6 lg:col-span-7">
					<div class="flex items-center gap-3 px-2">
						<div class="h-1.5 w-1.5 rounded-full bg-brand-blue"></div>
						<span class="text-[10px] font-bold tracking-wide text-white/60 uppercase"
							>{t.setup_badge}</span
						>
					</div>

					<div class="grid grid-cols-1 gap-4">
						{#each templates as template}
							<button
								type="button"
								class="group relative flex flex-col items-start rounded-[32px] border-2 p-6 text-left transition-all {selectedTemplateId ===
								template.id
									? 'border-brand-blue bg-brand-blue/10 shadow-[0_0_40px_rgba(59,130,246,0.15)]'
									: 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]'}"
								onclick={() => selectTemplate(template.id)}
							>
								<div class="flex w-full items-center justify-between">
									<div class="flex items-center gap-4">
										<div
											class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-2xl transition-transform group-hover:scale-110"
										>
											{template.icon}
										</div>
										<div>
											<h3 class="font-bold text-[--color-azure-pearl] text-lg">{template.title}</h3>
											<p class="text-[12px] font-medium text-white/30">
												{template.description}
											</p>
										</div>
									</div>
									{#if selectedTemplateId === template.id}
										<div class="h-2 w-2 rounded-full bg-brand-blue shadow-[0_0_12px_#3B82F6]"></div>
									{/if}
								</div>

								{#if selectedTemplateId === template.id}
									<div class="w-full space-y-4 pt-6" in:slide>
										<div class="h-px w-full bg-brand-blue/20"></div>
										<div class="space-y-3">
											<span class="text-[9px] font-bold tracking-wide text-brand-blue/60 uppercase">{t.setup_template_points_label}</span>
											<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
												{#each template.points.split('\n') as point}
													<div
														class="bg-brand-blue/5 border-brand-blue/10 flex items-center gap-3 rounded-xl border px-3 py-2.5 text-[10px] font-semibold text-white/80 uppercase shadow-sm transition-all hover:border-brand-blue/30"
													>
														<div class="h-1.5 w-1.5 rounded-full bg-brand-blue animate-pulse"></div>
														{point.replace('- ', '')}
													</div>
												{/each}
											</div>
										</div>
									</div>
								{/if}
							</button>
						{/each}
					</div>
				</div>

				<!-- Right Column: Parameters & Activity (5/12) -->
				<div class="space-y-8 lg:col-span-5">
					<!-- Parameters Block -->
					<div
						class="glass-panel group relative overflow-hidden rounded-[32px] p-8 transition-all hover:border-white/20"
					>
						<div class="mb-8 flex items-center justify-between">
							<span class="text-[10px] font-bold tracking-wide text-white/40 uppercase"
								>{t.setup_title}</span
							>
							<div
								class="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 group-hover:bg-brand-blue/10"
							>
								<svg
									class="h-4 w-4 text-white/20 group-hover:text-brand-blue"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
									/>
								</svg>
							</div>
						</div>

						<div class="space-y-6">
							<div class="space-y-3">
								<span class="text-[9px] font-bold tracking-wide text-brand-blue/60 uppercase"
									>{t.setup_topic_label}</span
								>
								<div
									class="min-h-[4rem] w-full rounded-2xl border transition-all duration-500 flex items-center px-5 py-4 {topic ? 'border-brand-blue/40 bg-brand-blue/10 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : 'border-white/5 bg-white/[0.02]'}"
								>
									{#if topic}
										<div class="flex items-center gap-4">
											<div class="h-2 w-2 rounded-full bg-brand-blue animate-ping"></div>
											<span class="text-lg font-medium text-[--color-azure-pearl]/90 leading-tight">{topic}</span>
										</div>
									{:else}
										<span class="text-white/10 italic text-sm">{t.setup_topic_placeholder}</span>
									{/if}
								</div>
							</div>

							<div class="space-y-2">
								<span class="text-[9px] font-bold tracking-wide text-brand-blue/60 uppercase"
									>{t.setup_duration_label}</span>
								<div class="space-y-6 rounded-2xl border border-white/5 bg-white/[0.02] p-6">
									<div class="flex items-center justify-between">
										<span class="text-3xl font-bold tabular-nums text-[--color-azure-pearl]">{duration}</span>
										<span class="text-[10px] font-bold text-white/30 uppercase"
											>{t.setup_duration_unit}</span
										>
									</div>
									<input
										id="duration"
										type="range"
										bind:value={duration}
										min="5"
										max="120"
										step="5"
										class="accent-brand-blue h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-white/5"
									/>
									<div
										class="flex justify-between text-[8px] font-bold text-white/20 uppercase"
									>
										<span>5m</span>
										<span>60m</span>
										<span>120m</span>
									</div>
								</div>
							</div>
						</div>
					</div>

					<!-- Final Action Block -->
					<div class="space-y-4">
						<button
							onclick={(e) => {
								e.preventDefault();
								if (selectedTemplateId) startGeneration();
							}}
							disabled={!selectedTemplateId}
							class="group border-brand-blue/50 hover:border-brand-blue hover:bg-brand-blue/10 relative w-full overflow-hidden rounded-[32px] border-2 bg-white/5 py-6 text-sm font-bold tracking-wide text-white uppercase backdrop-blur-xl transition-all hover:shadow-[0_0_50px_rgba(59,130,246,0.3)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-10"
						>
							<span class="relative z-10 flex items-center justify-center gap-3">
								{t.setup_generate_button}
								<svg
									class="text-brand-blue h-5 w-5 transition-transform group-hover:translate-x-1"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="3"
										d="M13 10V3L4 14h7v7l9-11h-7z"
									/>
								</svg>
							</span>
							<div
								class="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform group-hover:animate-[shimmer_1.5s_infinite]"
							></div>
						</button>
						<p class="text-center text-[10px] font-medium text-white/20 uppercase">
							{t.setup_generate_hint}
						</p>
					</div>
				</div>
			</div>
		</div>
	{:else if currentState === 'generating'}
		<div class="flex flex-col items-center justify-center py-48" in:fade>
			<button
				onclick={() => {
					currentState = 'landing';
				}}
				class="absolute top-12 left-12 flex items-center gap-2 text-white/30 hover:text-white transition-colors group"
			>
				<svg class="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
				</svg>
				<span class="text-[10px] font-bold tracking-widest uppercase">{t.generating_cancel}</span>
			</button>
			<div class="relative mb-12 h-32 w-32">
				<div class="absolute inset-0 rounded-full border-2 border-white/5"></div>
				<div
					class="border-t-brand-blue absolute inset-0 animate-spin rounded-full border-2 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
				></div>
				<!-- Center pulse -->
				<div class="absolute inset-0 flex items-center justify-center">
					<div class="bg-brand-blue h-2 w-2 animate-ping rounded-full"></div>
				</div>
			</div>

			<span class="text-brand-blue mb-4 text-[10px] font-bold tracking-wide uppercase"
				>{generationStatusMessage}</span>
			<h2 class="text-3xl font-bold text-[--color-azure-pearl]">{t.generating_title}</h2>
		</div>
	{:else if currentState === 'session' && meetingData}
		<div class="mb-6">
			<button
				onclick={restart}
				class="flex items-center gap-2 text-white/30 hover:text-white transition-colors group"
			>
				<svg class="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
				</svg>
				<span class="text-[10px] font-bold tracking-widest uppercase">{t.setup_back}</span>
			</button>
		</div>
		<div class="grid grid-cols-1 gap-4 lg:grid-cols-12" in:fade>
			<!-- Left Column: Timer & Timeboxes -->
			<div class="space-y-4 lg:col-span-8">
				<!-- Main Timer Glass Panel -->
				<div class="glass-panel relative flex flex-col overflow-hidden rounded-2xl md:flex-row">
					<!-- Active State Indicator -->
					<div
						class="{isTimerRunning ? 'bg-brand-blue/10 border-brand-blue/20' : 'bg-white/5 border-white/10'} absolute top-6 left-6 flex items-center gap-3 rounded-full border px-4 py-2 transition-all"
					>
						<span class="{isTimerRunning ? 'bg-brand-blue animate-pulse' : 'bg-white/20'} h-2 w-2 rounded-full"></span>
						<span class="{isTimerRunning ? 'text-brand-blue' : 'text-white/30'} text-[9px] font-bold tracking-wide uppercase"
							>{isTimerRunning ? t.session_active : t.session_finish}</span
						>
					</div>

					<div
						class="flex flex-col items-center justify-center border-b border-white/5 bg-white/[0.02] p-6 md:w-1/2 md:border-r md:border-b-0"
					>
						<span class="mb-2 text-[9px] font-medium tracking-wide text-white/20 uppercase"
							>{t.session_time_remaining}</span
						>
						<div
							class="relative font-mono text-5xl font-bold tracking-tighter text-white md:text-6xl"
							class:text-red-500={timeRemaining < 60 && timeRemaining > 0}
						>
							{formattedTime}
							{#if isTimerRunning}
								<div
									class="bg-brand-blue/5 absolute -inset-4 -z-10 animate-pulse rounded-3xl blur-2xl"
								></div>
							{/if}
						</div>

						<div class="mt-8 flex gap-4">
							<button
								onclick={toggleTimer}
								class="group relative overflow-hidden rounded-xl px-6 py-3 text-[10px] font-bold tracking-wide uppercase transition-all active:scale-95 {isTimerRunning
									? 'border border-white/10 bg-white/10 text-white hover:bg-white/20'
									: 'bg-brand-blue text-white shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_50px_rgba(59,130,246,0.5)]'}"
							>
								{isTimerRunning ? t.session_pause : (hasStarted ? t.session_continue : t.session_start)}
							</button>
							<button
								onclick={finishSession}
								disabled={!hasStarted}
								class="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-[10px] font-bold tracking-wide text-white/40 uppercase transition-all enabled:hover:bg-white/10 enabled:hover:text-white disabled:opacity-20"
							>
								{t.session_finish}
							</button>
						</div>
					</div>
					<div class="flex flex-col justify-center p-6 md:w-1/2">
						<div class="mb-3">
							<span
								class="text-brand-blue mb-1 block text-[10px] font-bold tracking-wide uppercase"
								>{t.session_motto}</span
							>
							<p class="text-base leading-tight font-medium text-[--color-azure-pearl] italic">
								«{meetingData.structure.manifesto}»
							</p>
						</div>
						<div>
							<span
								class="text-brand-blue mb-1 block text-[10px] font-bold tracking-wide uppercase"
								>{t.session_goal}</span
							>
							<h2 class="text-lg font-bold text-[--color-azure-pearl]">
								{meetingData.intentionality.goal}
							</h2>
						</div>
					</div>
				</div>

				<!-- TimeBoxes -->
				<div class="glass-panel rounded-2xl p-6">
					<div class="mb-6 flex items-center justify-between">
						<div>
							<h3 class="mb-1 text-xl font-bold text-[--color-azure-pearl]">
								{t.session_plan_title}
							</h3>
							<p class="text-[10px] font-medium tracking-wide text-white/30 uppercase">
								{t.session_plan_badge}
							</p>
						</div>

						<div
							class="flex h-1 h-12 w-12 items-center justify-center rounded-2xl border border-white/10"
						>
							<svg
								class="h-6 w-6 text-white/20"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
								></path></svg
							>
						</div>
					</div>
					<div class="space-y-4">
						{#each meetingData.structure.timeBoxes as box, i}
							<button
								class="group relative flex w-full cursor-pointer items-center justify-between overflow-hidden rounded-3xl border px-8 py-6 text-left transition-all {box.isCompleted
									? 'border-white/5 bg-white/[0.01] opacity-30 grayscale'
									: 'hover:border-brand-blue/50 border-white/10 bg-white/[0.03] hover:bg-white/[0.05]'}"
								onclick={() => completeTimeBox(i)}
							>
								<div class="relative z-10 flex items-center gap-6">
									<div
										class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all {box.isCompleted
											? 'border-brand-blue bg-brand-blue'
											: 'group-hover:border-brand-blue/50 border-white/10'}"
									>
										{#if box.isCompleted}
											<svg
												class="h-5 w-5 text-black"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
												><path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="4"
													d="M5 13l4 4L19 7"
												></path></svg
											>
										{/if}
									</div>
									<div class="flex flex-col">
										<span
											class="mb-1 text-[9px] font-medium text-white/30 uppercase"
											>{t.session_step_prefix} {i + 1}</span
										>
										<span
											class="text-[15px] font-bold {box.isCompleted
												? 'text-white/60 line-through'
												: 'text-white'}">{box.title}</span
										>
									</div>
								</div>
								<span
									class="group-hover:border-brand-blue/30 group-hover:text-brand-blue relative z-10 rounded-full border border-white/10 bg-white/5 px-6 py-2 text-[10px] font-bold text-white/50 uppercase transition-all"
									>{box.durationRange}</span
								>

								{#if !box.isCompleted}
									<div
										class="bg-brand-blue absolute top-0 right-0 bottom-0 w-1 opacity-0 transition-opacity group-hover:opacity-100"
									></div>
								{/if}
							</button>
						{/each}
					</div>
				</div>
			</div>

			<!-- Right Column: Mechanics & Advice -->
			<div class="space-y-4 lg:col-span-4">
				<!-- Unified Insights Tray -->
				<div class="glass-panel overflow-hidden rounded-2xl p-6 relative">
					<div
						class="bg-brand-mint/10 absolute -top-10 -right-10 h-32 w-32 rounded-full blur-3xl opacity-50"
					></div>

					<div class="flex items-center gap-1 p-1 bg-white/[0.03] rounded-xl mb-6 relative z-10">
						<button
							onclick={() => activeInsightTab = 'rules'}
							class="flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all {activeInsightTab === 'rules' ? 'bg-brand-blue text-white shadow-lg' : 'text-white/30 hover:text-white/60'}"
						>
							{t.insight_tabs_rules}
						</button>
						<button
							onclick={() => activeInsightTab = 'advice'}
							class="flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all {activeInsightTab === 'advice' ? 'bg-brand-blue text-white shadow-lg' : 'text-white/30 hover:text-white/60'}"
						>
							{t.insight_tabs_advice}
						</button>
					</div>

					<div class="relative z-10 min-h-[140px]">
						{#if activeInsightTab === 'rules'}
							<div in:fade={{ duration: 200 }} class="space-y-4">
								<div class="flex flex-wrap gap-2 mb-4">
									{#each mechanics as mech}
										<button
											onclick={() => selectedMechanicId = mech.id}
											class="px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all {selectedMechanicId === mech.id ? 'bg-brand-mint text-black' : 'bg-white/5 text-white/40 hover:bg-white/10'}"
										>
											{mech.title}
										</button>
									{/each}
								</div>
								<div class="bg-white/5 rounded-2xl p-4 border border-white/5">
									<p class="text-base leading-relaxed font-medium text-white/70">
										{mechanics.find(m => m.id === selectedMechanicId)?.rules}
									</p>
								</div>
							</div>
						{:else}
							<div in:fade={{ duration: 200 }} class="space-y-4">
								<div class="flex items-center justify-between mb-2">
									<span class="text-amber-500/80 block text-[11px] font-bold tracking-wide uppercase">{t.insight_advice_prefix} {currentTipIndex + 1}</span>
									<button 
										onclick={nextTip}
										class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[9px] font-bold text-white/50 uppercase transition-all"
									>
										{t.insight_next_tip}
										<svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7" />
										</svg>
									</button>
								</div>
								<p class="text-[15px] leading-relaxed font-medium text-white/70 min-h-[60px]">
									{tips[currentTipIndex]}
								</p>
							</div>
						{/if}
					</div>
				</div>

				<!-- Key Points Checklist -->
				<div class="glass-panel rounded-2xl p-6">
					<div class="mb-6">
						<span
							class="text-brand-blue mb-2 block text-[10px] font-bold tracking-wide uppercase"
							>{t.session_points_badge}</span
						>
						<h3 class="text-[15px] font-bold text-[--color-azure-pearl]">{t.session_points_title}</h3>
					</div>

					<ul class="space-y-3">
						{#each meetingData.intentionality.keyPoints as item, i}
							<li>
								<button
									class="group flex w-full cursor-pointer items-start gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-left transition-all hover:bg-white/[0.04] {item.isCompleted
										? 'opacity-30 grayscale'
										: ''}"
									onclick={() => completeKeyPoint(i)}
								>
									<div
										class="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all {item.isCompleted
											? 'border-brand-blue bg-brand-blue'
											: 'group-hover:border-brand-blue/50 border-white/20'}"
									>
										{#if item.isCompleted}
											<svg
												class="h-3 w-3 text-black"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
												><path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="5"
													d="M5 13l4 4L19 7"
												></path></svg
											>
										{:else}
											<div class="h-1 w-1 rounded-full bg-white/20"></div>
										{/if}
									</div>
									<div class="flex flex-col">
										<span
											class="text-brand-blue mb-1 text-[9px] font-medium uppercase"
											>{t.session_points_prefix} {i + 1}</span
										>
										<span class="text-[14px] leading-snug font-bold text-white/80">
											{item.text}
										</span>
									</div>
								</button>
							</li>
						{/each}
					</ul>
				</div>
			</div>
		</div>
	{:else if currentState === 'summary' && meetingData}
		<div class="mx-auto max-w-5xl space-y-12" in:fade>
			<div class="flex justify-start">
				<button
					onclick={restart}
					class="flex items-center gap-2 text-white/30 hover:text-white transition-colors group"
				>
					<svg class="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
					</svg>
					<span class="text-[10px] font-bold tracking-widest uppercase">{t.summary_back}</span>
				</button>
			</div>
			<div class="text-center">
				<div
					class="bg-brand-blue/10 border-brand-blue/20 mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full border relative group"
				>
					<div class="absolute inset-0 bg-brand-blue/20 rounded-full blur-2xl group-hover:bg-brand-blue/30 transition-all duration-1000"></div>
					<svg
						class="text-brand-blue h-10 w-10 relative z-10"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
						></path></svg
					>
				</div>
				<h2 class="mb-4 text-6xl font-bold tracking-tighter text-[--color-azure-pearl]">{t.summary_title}</h2>
				<p class="text-xl font-medium text-white/40 max-w-2xl mx-auto">
					{t.summary_subtitle}
				</p>
			</div>

			<div
				class="glass-panel grid grid-cols-1 divide-y divide-white/5 overflow-hidden rounded-[40px] md:grid-cols-2 md:divide-x md:divide-y-0"
			>
				<div class="p-12">
					<div class="mb-10">
						<span
							class="text-brand-blue mb-2 block text-[10px] font-bold tracking-wider uppercase"
							>{t.summary_metrics_badge}</span
						>
						<h3 class="text-2xl font-bold text-[--color-azure-pearl]">{t.summary_metrics_title}</h3>
					</div>
					<ul class="space-y-6">
						{#each meetingData.structure.timeBoxes as box}
							<li class="flex items-center gap-5">
								<div
									class="flex h-8 w-8 items-center justify-center rounded-full transition-shadow {box.isCompleted
										? 'bg-brand-blue text-black shadow-[0_0_15px_rgba(59,130,246,0.4)]'
										: 'bg-white/5 text-white/20'}"
								>
									{#if box.isCompleted}
										<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"
											><path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="4"
												d="M5 13l4 4L19 7"
											></path></svg
										>
									{:else}
										<div class="h-1.5 w-1.5 rounded-full bg-current"></div>
									{/if}
								</div>
								<span
									class="text-xl tracking-tight {box.isCompleted
										? 'font-bold text-white'
										: 'text-white/20'}">{box.title}</span
								>
							</li>
						{/each}
					</ul>
				</div>
				<div class="p-12">
					<div class="mb-10">
						<span
							class="text-brand-blue mb-2 block text-[10px] font-bold tracking-wider uppercase"
							>{t.summary_results_badge}</span
						>
						<h3 class="text-2xl font-bold text-[--color-azure-pearl]">{t.summary_results_title}</h3>
					</div>
					<ul class="space-y-6">
						{#each meetingData.intentionality.keyPoints as item}
							<li class="flex items-start gap-5">
								<div
									class="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-shadow {item.isCompleted
										? 'bg-brand-blue text-black shadow-[0_0_15px_rgba(59,130,246,0.4)]'
										: 'bg-white/5 text-white/20'}"
								>
									{#if item.isCompleted}
										<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"
											><path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="4"
												d="M5 13l4 4L19 7"
											></path></svg
										>
									{:else}
										<div class="h-1.5 w-1.5 rounded-full bg-current"></div>
									{/if}
								</div>
								<span
									class="text-lg leading-relaxed {item.isCompleted
										? 'font-medium text-white/80'
										: 'text-white/20'}">{item.text}</span
								>
							</li>
						{/each}
					</ul>
				</div>
			</div>

			<div class="flex flex-col items-center gap-6 pt-12 pb-12 sm:flex-row justify-center">
				<button
					onclick={() => (currentState = 'setup')}
					class="group relative w-full sm:w-80 overflow-hidden rounded-[32px] border-2 border-brand-blue/50 bg-white/5 px-8 py-6 text-sm font-bold tracking-wide text-white uppercase backdrop-blur-xl transition-all hover:bg-brand-blue/10 hover:border-brand-blue hover:shadow-[0_0_50px_rgba(59,130,246,0.3)] active:scale-95"
				>
					<span class="relative z-10 flex items-center justify-center gap-3">
						<svg class="h-4 w-4 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
						</svg>
						{t.summary_button_setup}
					</span>
					<div
						class="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform group-hover:animate-[shimmer_1.5s_infinite]"
					></div>
				</button>

				<button
					onclick={restart}
					class="group relative w-full sm:w-80 overflow-hidden rounded-[32px] border-2 border-brand-blue/50 bg-white/5 px-8 py-6 text-sm font-bold tracking-wide text-white uppercase backdrop-blur-xl transition-all hover:bg-brand-blue/10 hover:border-brand-blue hover:shadow-[0_0_50px_rgba(59,130,246,0.3)] active:scale-95"
				>
					<span class="relative z-10 flex items-center justify-center gap-4">
						<svg
							class="h-5 w-5 text-brand-blue"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="3"
								d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
							></path></svg
						>
						{t.summary_button_restart}
					</span>
					<div
						class="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform group-hover:animate-[shimmer_1.5s_infinite]"
					></div>
				</button>
			</div>
		</div>
	{/if}

	<!-- Persistent Sticky Timer Widget -->
	{#if currentState === 'session' && showStickyTimer}
		<div
			class="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl glass-panel border border-brand-blue/30 shadow-[0_0_30px_rgba(59,130,246,0.2)] flex items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-500"
		>
			<div class="flex flex-col">
				<span class="text-[8px] font-bold text-white/30 uppercase tracking-widest">{t.session_active}</span>
				<span class="text-2xl font-mono font-bold text-[--color-azure-pearl] leading-none">{formattedTime}</span>
			</div>
			
			<div class="h-8 w-px bg-white/10"></div>
			
			<button
				onclick={toggleTimer}
				class="h-10 w-10 flex items-center justify-center rounded-xl transition-all {isTimerRunning ? 'bg-white/10 text-white' : 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20'}"
			>
				{#if isTimerRunning}
					<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
						<rect x="6" y="4" width="4" height="16" rx="1" />
						<rect x="14" y="4" width="4" height="16" rx="1" />
					</svg>
				{:else}
					<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
						<path d="M8 5v14l11-7z" />
					</svg>
				{/if}
			</button>
		</div>
	{/if}

	<!-- Strategy Modal -->
	{#if showStrategyModal}
		<div 
			class="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12 overflow-y-auto bg-black/80 backdrop-blur-2xl animate-in fade-in duration-300"
			onclick={(e) => { if (e.target === e.currentTarget) showStrategyModal = false }}
			onkeydown={(e) => { if (e.key === 'Escape') showStrategyModal = false }}
			role="button"
			tabindex="-1"
		>
			<div 
				class="glass-panel w-full max-w-4xl rounded-[40px] border border-white/10 bg-white/[0.02] p-8 md:p-16 animate-in zoom-in-95 slide-in-from-bottom-12 duration-500 shadow-2xl relative"
				in:fade
			>
				<button 
					onclick={() => showStrategyModal = false}
					class="absolute top-8 right-8 h-12 w-12 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-90"
					aria-label="Close"
				>
					<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>

				<div class="mb-12">
					<span class="text-brand-blue mb-3 block text-xs font-bold tracking-[0.2em] uppercase">Vision & Scale</span>
					<h2 class="text-5xl md:text-6xl font-black tracking-tight text-[--color-azure-pearl]">{t.strategy_modal_title}</h2>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-12">
					<!-- Development Phases -->
					<div class="space-y-8">
						<h3 class="text-xl font-bold text-white flex items-center gap-3">
							<span class="w-8 h-8 rounded-lg bg-brand-blue/20 flex items-center justify-center text-brand-blue text-sm">01</span>
							{t.strategy_phase_1.split('&')[0]}
						</h3>
						<div class="space-y-6 border-l-2 border-white/5 ml-4 pl-8">
							<div class="relative">
								<div class="absolute -left-10 top-1 h-4 w-4 rounded-full bg-brand-blue border-4 border-black"></div>
								<h4 class="font-bold text-white">{t.strategy_phase_1}</h4>
								<p class="text-sm text-white/40 leading-relaxed">{t.strategy_phase_1_desc}</p>
							</div>
							<div class="relative">
								<div class="absolute -left-10 top-1 h-4 w-4 rounded-full bg-white/20 border-4 border-black"></div>
								<h4 class="font-bold text-white">{t.strategy_phase_2}</h4>
								<p class="text-sm text-white/40 leading-relaxed">{t.strategy_phase_2_desc}</p>
							</div>
							<div class="relative">
								<div class="absolute -left-10 top-1 h-4 w-4 rounded-full bg-white/20 border-4 border-black"></div>
								<h4 class="font-bold text-white">{t.strategy_phase_3}</h4>
								<p class="text-sm text-white/40 leading-relaxed">{t.strategy_phase_3_desc}</p>
							</div>

						</div>
					</div>

					<!-- Revenue & Contact -->
					<div class="space-y-12">
						<div class="space-y-6">
							<h3 class="text-xl font-bold text-white flex items-center gap-3">
								<span class="w-8 h-8 rounded-lg bg-brand-mint/20 flex items-center justify-center text-brand-mint text-sm">02</span>
								{t.strategy_revenue_title}
							</h3>
							<div class="grid grid-cols-2 gap-4">
								<div class="bg-white/5 p-5 rounded-2xl border border-white/5">
									<span class="text-[10px] text-white/30 uppercase block mb-1">{t.strategy_revenue_target}</span>
									<span class="text-2xl font-bold text-brand-mint">$500K+</span>
								</div>
								<div class="bg-white/5 p-5 rounded-2xl border border-white/5">
									<span class="text-[10px] text-white/30 uppercase block mb-1">{t.strategy_revenue_model}</span>
									<span class="text-2xl font-bold text-white">SaaS/PaaS</span>
								</div>
							</div>
							<p class="text-sm text-white/40 leading-relaxed">
								{t.strategy_revenue_desc}
							</p>
						</div>

						<div class="pt-8 border-t border-white/5">
							<div class="bg-brand-blue/5 rounded-3xl p-8 border border-brand-blue/20">
								<h4 class="text-lg font-bold text-white mb-2">{t.strategy_contact_title}</h4>
								<p class="text-sm text-white/50 mb-6">{t.strategy_contact_desc}</p>
								<a 
									href="mailto:maximpiryutko@gmail.com"
									class="inline-flex items-center gap-3 text-brand-blue font-bold hover:gap-5 transition-all"
								>
									maximpiryutko@gmail.com
									<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
									</svg>
								</a>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
