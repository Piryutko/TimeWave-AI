type Language = 'ru' | 'en' | 'jp';

const i18n = {
	ru: {
		status: [
			'Инициализация нейросети...',
			'Анализ контекста встречи...',
			'Формирование структуры таймбоксов...',
			'Подбор механик взаимодействия...',
			'Финальная сборка плана...'
		],
		quotes: [
			"«Переговоры — это не битва, это процесс открытия». — Крис Восс",
			"«Вы не получаете то, чего заслуживаете, вы получаете то, о чем договариваетесь». — Честер Каррасс",
			"«Слушайте на 50% больше, чем говорите». — Херб Коэн",
			"«Никогда не разделяйте разницу. Компромисс — это часто поражение для обеих сторон». — Крис Восс",
			"«Терпение — самый мощный инструмент в арсенале переговорщика». — Херб Коэн"
		],
		boxes: [
			{ title: 'Введение и контекст', duration: '0-5 мин' },
			{ title: 'Разбор ключевых тезисов', duration: '5-20 мин' },
			{ title: 'Принятие решений и список поручений', duration: '20-25 мин' },
			{ title: 'Подведение итогов', duration: '25-30 мин' }
		],
		goal: (topic: string) => `Сформировать общее видение и конкретные шаги по теме: ${topic}.`,
		mechanic: 'Используйте механику "Round Robin" для обсуждения каждого тезиса: каждый участник высказывается по 1 минуте без прерываний.',
		advice: 'Следите за тем, чтобы более активные участники не доминировали. Сделайте паузу после каждого блока для комментариев от тех, кто еще не высказывался.',
		min: 'мин'
	},
	en: {
		status: [
			'Initializing neural network...',
			'Analyzing meeting context...',
			'Generating timebox structure...',
			'Selecting interaction mechanics...',
			'Finalizing the plan...'
		],
		quotes: [
			"\"Negotiation is not an act of battle; it's a process of discovery.\" — Chris Voss",
			"\"You don't get what you deserve, you get what you negotiate.\" — Chester Karrass",
			"\"Listen 50% more than you talk.\" — Herb Cohen",
			"\"Never split the difference. Compromise is often a defeat for both sides.\" — Chris Voss",
			"\"Patience is the most powerful tool in the negotiator's arsenal.\" — Herb Cohen"
		],
		boxes: [
			{ title: 'Introduction & Context', duration: '0-5 min' },
			{ title: 'Key Points Review', duration: '5-20 min' },
			{ title: 'Decision Making & Action Items', duration: '20-25 min' },
			{ title: 'Summary & Wrap-up', duration: '25-30 min' }
		],
		goal: (topic: string) => `Establish a shared vision and specific action steps regarding: ${topic}.`,
		mechanic: 'Use the "Round Robin" mechanic: each participant speaks for 1 minute without interruption.',
		advice: "Ensure that more vocal participants do not dominate. Pause after each block for comments from those who haven't spoken yet.",
		min: 'min'
	},
	jp: {
		status: [
			'ニューラルネットワークを初期化中...',
			'会議のコンテキストを分析中...',
			'タイムボックス構造を生成中...',
			'対話メカニズムを選択中...',
			'プランを最終調整中...'
		],
		quotes: [
			"「交渉は戦いではなく、発見のプロセスである」 — クリス・ヴォス",
			"「あなたは報われるべきものを手に入れるのではなく、交渉したものを手に入れる」 — チェスター・カラス",
			"「話すよりも50%多く聞きなさい」 — ハーブ・コーエン",
			"「決して妥協点を探るな。妥協はしばしば双方にとっての敗北である」 — クリス・ヴォス",
			"「忍耐は交渉者の武器庫の中で最も強力なツールである」 — ハーブ・コーエン"
		],
		boxes: [
			{ title: '導入とコンテキスト', duration: '0-5 分' },
			{ title: '重要なポイントのレビュー', duration: '5-20 分' },
			{ title: '意思決定とアクションアイテム', duration: '20-25 分' },
			{ title: '要約と締めくくり', duration: '25-30 分' }
		],
		goal: (topic: string) => `共有されたビジョンを確立し、${topic}に関する具体的なアクションステップを決定する。`,
		mechanic: '「ラウンドロビン」方式を使用：各参加者が中断されることなく1分間ずつ発言します。',
		advice: '声の大きい参加者が支配的にならないように注意してください。各ブロックの後にまだ発言していない人のための時間を設けてください。',
		min: '分'
	}
};

export async function* simulateMeetingGeneration(topic: string, keyPoints: string, duration: number, lang: Language = 'ru') {
	const t = i18n[lang];
	
	for (const msg of t.status) {
		yield { event: 'status', data: msg };
		await new Promise((r) => setTimeout(r, 600 + Math.random() * 600));
	}

	const randomQuote = t.quotes[Math.floor(Math.random() * t.quotes.length)];

	const meetingData = {
		structure: {
			manifesto: randomQuote,
			timeBoxes: t.boxes.map(box => ({ ...box, durationRange: box.duration, isCompleted: false }))
		},
		intentionality: {
			goal: t.goal(topic),
			keyPoints: keyPoints.split('\n')
				.filter(p => p.trim())
				.map(p => ({ text: p.replace(/^- /, '').trim(), isCompleted: false }))
		},
		collaboration: {
			engagementMechanic: t.mechanic
		},
		inclusivity: {
			advice: t.advice
		}
	};

	if (duration !== 30) {
		const factor = duration / 30;
		meetingData.structure.timeBoxes = meetingData.structure.timeBoxes.map((box, i) => {
			const start = Math.round(5 * i * factor);
			const end = Math.round(5 * (i + 1) * factor);
			if (i === meetingData.structure.timeBoxes.length - 1) {
				return { ...box, durationRange: `${Math.round(25 * factor)}-${duration} ${t.min}` };
			}
			return { ...box, durationRange: `${start}-${end} ${t.min}` };
		});
	}

	yield { event: 'complete', data: JSON.stringify(meetingData) };
}
