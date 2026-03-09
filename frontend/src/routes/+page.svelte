<script lang="ts">
	import { fade, slide } from 'svelte/transition';

	// State definitions
	type AppState = 'landing' | 'setup' | 'generating' | 'session' | 'summary';
	let currentState = $state<AppState>('landing');

	// Form inputs
	let topic = $state('');
	let keyPoints = $state('');
	let duration = $state(30);

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
			keyQuestions: { text: string; isCompleted: boolean }[];
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
	let isTimerRunning = $state(false);
	let hasStarted = $state(false);
	let activeTimeBoxIndex = $state(0);
	let timerInterval: ReturnType<typeof setInterval>;

	$effect(() => {
		if (isTimerRunning && timeRemaining > 0) {
			timerInterval = setInterval(() => {
				timeRemaining--;
				if (timeRemaining <= 0) {
					isTimerRunning = false;
					clearInterval(timerInterval);
				}
			}, 1000);
		} else {
			clearInterval(timerInterval);
		}
		return () => clearInterval(timerInterval);
	});

	// Formatting MM:SS
	let formattedTime = $derived.by(() => {
		const m = Math.floor(timeRemaining / 60)
			.toString()
			.padStart(2, '0');
		const s = (timeRemaining % 60).toString().padStart(2, '0');
		return `${m}:${s}`;
	});

	async function startGeneration() {
		if (!topic.trim()) return;

		currentState = 'generating';
		generationStatusMessage = 'Инициализация нейросети...';

		try {
			const res = await fetch('/api/generate-meeting', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ topic, keyPoints, duration })
			});

			if (!res.body) throw new Error('No response body');

			const reader = res.body.getReader();
			const decoder = new TextDecoder('utf-8');
			let buffer = '';

			let isReading = true;
			while (isReading) {
				const { value, done } = await reader.read();
				if (done) {
					isReading = false;
					break;
				}

				buffer += decoder.decode(value, { stream: true });

				// Parse SSE parts (handle both \n\n and \r\n\r\n)
				const lines = buffer.split(/\n\n|\r\n\r\n/);
				buffer = lines.pop() || '';

				for (const chunk of lines) {
					if (!chunk.trim()) continue;

					const chunkLines = chunk.split(/\n|\r\n/);
					let eventName = '';
					let eventData = '';

					for (const l of chunkLines) {
						if (l.startsWith('event:')) eventName = l.substring(6).trim();
						if (l.startsWith('data:')) eventData = l.substring(5).trim();
					}

					console.log(`[SSE] Received event: ${eventName}, data length: ${eventData.length}`);

					if (eventName && eventData) {
						if (eventName === 'status') {
							generationStatusMessage = eventData;
						} else if (eventName === 'complete') {
							try {
								console.log('[SSE] Parsing complete JSON...');
								meetingData = JSON.parse(eventData);
								console.log('[SSE] Meeting data loaded:', meetingData);
								timeRemaining = duration * 60;
								currentState = 'session';
								isReading = false;
							} catch (err) {
								console.error('[SSE] Failed to parse complete JSON:', err);
								generationStatusMessage = 'Ошибка обработки данных от ИИ: ' + err;
								setTimeout(() => (currentState = 'setup'), 5000);
							}
						} else if (eventName === 'error') {
							generationStatusMessage = `Ошибка: ${eventData}`;
							setTimeout(() => (currentState = 'setup'), 5000);
						}
					}
				}
			}
		} catch (e) {
			console.error(e);
			generationStatusMessage = 'Произошла ошибка при подключении к бекенду.';
			setTimeout(() => (currentState = 'setup'), 3000);
		}
	}

	function toggleTimer() {
		isTimerRunning = !isTimerRunning;
		if (isTimerRunning) hasStarted = true;
	}

	function completeTimeBox(index: number) {
		if (!meetingData) return;
		meetingData.structure.timeBoxes[index].isCompleted =
			!meetingData.structure.timeBoxes[index].isCompleted;
	}

	function completeQuestion(index: number) {
		if (!meetingData) return;
		meetingData.intentionality.keyQuestions[index].isCompleted =
			!meetingData.intentionality.keyQuestions[index].isCompleted;
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

<div class="animate-in fade-in space-y-8 duration-500">
	{#if currentState === 'landing'}
		<div class="flex flex-col items-center justify-center px-4 py-20 text-center md:py-32" in:fade>
			<div
				class="bg-brand-blue/10 text-brand-blue border-brand-blue/20 mb-8 inline-flex items-center gap-2 rounded-full border px-4 py-2 font-semibold"
			>
				<span class="relative flex h-3 w-3">
					<span
						class="bg-brand-blue absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
					></span>
					<span class="bg-brand-blue relative inline-flex h-3 w-3 rounded-full"></span>
				</span>
				Powered by AI
			</div>

			<h1
				class="mb-6 text-5xl leading-tight font-extrabold tracking-tight text-gray-900 md:text-7xl"
			>
				Превратите обсуждения в <br />
				<span class="from-brand-blue to-brand-mint bg-gradient-to-r bg-clip-text text-transparent"
					>реальные результаты</span
				>
			</h1>

			<p class="mx-auto mb-12 max-w-3xl text-xl text-gray-500 md:text-2xl">
				Сконцентрируйтесь на развитии проекта. ИИ сам создаст жесткие таймбоксы, составит вопросы и
				подберет идеальную механику взаимодействия для вашей команды и стейкхолдеров.
			</p>

			<div class="flex flex-col gap-4 sm:flex-row">
				<button
					onclick={() => (currentState = 'setup')}
					class="bg-brand-blue flex items-center gap-2 rounded-xl px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
				>
					Начать работу
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M14 5l7 7m0 0l-7 7m7-7H3"
						></path></svg
					>
				</button>
			</div>
		</div>
	{:else if currentState === 'setup'}
		<div class="glass-panel mx-auto mt-10 max-w-2xl rounded-3xl p-8 md:p-12" in:fade>
			<div class="mb-10 text-center">
				<h2 class="mb-2 text-3xl font-extrabold text-gray-900">Новая сессия</h2>
				<p class="text-gray-500">Настройте контекст встречи, а ИИ сгенерирует план и механику.</p>
			</div>

			<form
				class="space-y-6"
				onsubmit={(e) => {
					e.preventDefault();
					startGeneration();
				}}
			>
				<div>
					<label for="topic" class="mb-2 block text-sm font-semibold text-gray-700"
						>Тема Встречи *</label
					>
					<input
						id="topic"
						type="text"
						bind:value={topic}
						required
						class="focus:border-brand-blue focus:ring-brand-blue w-full rounded-xl border-gray-300 px-4 py-3 shadow-sm transition-all sm:text-lg"
						placeholder="Например: Архитектура API"
					/>
				</div>

				<div>
					<label for="keyPoints" class="mb-2 block text-sm font-semibold text-gray-700"
						>Ключевые тезисы (один на строку)</label
					>
					<textarea
						id="keyPoints"
						bind:value={keyPoints}
						rows="3"
						class="focus:border-brand-blue focus:ring-brand-blue sm:text-md w-full rounded-xl border-gray-300 px-4 py-3 shadow-sm transition-all"
						placeholder="- Утвердить формат JSON&#10;- Распределить задачи на спринт"
					></textarea>
				</div>

				<div>
					<label for="duration" class="mb-2 block text-sm font-semibold text-gray-700"
						>Длительность (в минутах)</label
					>
					<div class="flex items-center gap-4">
						<input
							id="duration"
							type="range"
							bind:value={duration}
							min="5"
							max="120"
							step="5"
							class="accent-brand-blue h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200"
						/>
						<span class="text-brand-blue w-12 text-right text-xl font-bold">{duration}</span>
					</div>
				</div>

				<div class="pt-6">
					<button
						type="submit"
						class="from-brand-blue focus:ring-brand-blue flex w-full transform items-center justify-center rounded-xl border border-transparent bg-gradient-to-r to-teal-500 px-8 py-4 text-lg font-bold text-white shadow-md transition-all hover:-translate-y-1 hover:from-blue-700 hover:to-teal-600 focus:ring-2 focus:ring-offset-2 focus:outline-none"
					>
						Сгенерировать План
					</button>
				</div>
			</form>
		</div>
	{:else if currentState === 'generating'}
		<div class="flex flex-col items-center justify-center py-32" in:fade>
			<div class="relative mb-8 h-24 w-24">
				<div class="border-brand-mint/20 absolute inset-0 rounded-full border-4"></div>
				<div
					class="border-brand-mint absolute inset-0 animate-spin rounded-full border-4 border-t-transparent"
				></div>
			</div>
			<h2
				class="from-brand-blue bg-gradient-to-r to-teal-500 bg-clip-text text-2xl font-bold text-transparent"
			>
				{generationStatusMessage}
			</h2>
			<p class="mt-2 text-gray-500">Нейросеть анализирует ваши тезисы...</p>
		</div>
	{:else if currentState === 'session' && meetingData}
		<div class="grid grid-cols-1 gap-8 lg:grid-cols-3" in:fade>
			<!-- Left Column: Timer & Timeboxes -->
			<div class="space-y-6 lg:col-span-2">
				<!-- Main Timer Glass Panel -->
				<div class="glass-panel flex flex-col overflow-hidden rounded-3xl shadow-lg md:flex-row">
					<div
						class="flex flex-col items-center justify-center border-b border-gray-200 bg-white/40 p-10 md:w-1/2 md:border-r md:border-b-0"
					>
						<span class="mb-2 text-sm font-bold tracking-widest text-gray-500 uppercase"
							>Остаток Времени</span
						>
						<div
							class="font-mono text-7xl font-black tracking-tighter text-gray-900 md:text-8xl"
							class:text-red-500={timeRemaining < 60 && timeRemaining > 0}
						>
							{formattedTime}
						</div>
						<div class="mt-8 flex gap-4">
							<button
								onclick={toggleTimer}
								class="transform rounded-full px-8 py-3 text-lg font-bold text-white shadow-md transition-all hover:scale-105 {isTimerRunning
									? 'bg-amber-500 hover:bg-amber-600'
									: 'bg-brand-mint hover:bg-emerald-600'}"
							>
								{isTimerRunning ? 'Пауза' : 'Старт'}
							</button>
							<button
								onclick={finishSession}
								disabled={!hasStarted}
								class="transform rounded-full bg-gray-800 px-8 py-3 text-lg font-bold text-white shadow-md transition-all enabled:hover:scale-105 enabled:hover:bg-black disabled:cursor-not-allowed disabled:opacity-30 disabled:grayscale"
							>
								Завершить
							</button>
						</div>
					</div>
					<div class="p-8 md:w-1/2">
						<div class="mb-4">
							<h3 class="text-brand-blue font-bold">Манифест:</h3>
							<p class="mt-1 text-lg leading-relaxed text-gray-700 italic">
								«{meetingData.structure.manifesto}»
							</p>
						</div>
						<div class="mt-6">
							<h3 class="text-brand-blue mb-3 font-bold">Главная цель:</h3>
							<p class="text-xl leading-tight font-medium text-gray-900">
								💎 {meetingData.intentionality.goal}
							</p>
						</div>
					</div>
				</div>

				<!-- TimeBoxes -->
				<div class="glass-panel rounded-3xl p-8">
					<h3 class="mb-6 flex items-center gap-2 text-xl font-bold">
						<div class="bg-brand-blue h-3 w-3 rounded-full"></div>
						Дорожная Карта
					</h3>
					<div class="space-y-3">
						{#each meetingData.structure.timeBoxes as box, i}
							<button
								class="flex w-full cursor-pointer items-center justify-between rounded-xl border p-4 text-left transition-all {box.isCompleted
									? 'border-gray-200 bg-gray-100 opacity-60'
									: 'border-brand-blue/30 hover:border-brand-blue bg-white shadow-sm'}"
								onclick={() => completeTimeBox(i)}
								aria-label="Toggle task completion"
							>
								<div class="flex items-center gap-4">
									<div
										class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 {box.isCompleted
											? 'border-gray-400 bg-gray-400'
											: 'border-gray-300'}"
									>
										{#if box.isCompleted}
											<svg
												class="h-4 w-4 text-white"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
												><path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M5 13l4 4L19 7"
												></path></svg
											>
										{/if}
									</div>
									<span
										class="text-lg font-bold {box.isCompleted
											? 'text-gray-500 line-through'
											: 'text-gray-900'}">{box.title}</span
									>
								</div>
								<span
									class="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold whitespace-nowrap text-gray-600"
									>{box.durationRange}</span
								>
							</button>
						{/each}
					</div>
				</div>
			</div>

			<!-- Right Column: Mechanics & Advice -->
			<div class="space-y-6">
				<!-- Collaboration Mechanic -->
				<div
					class="glass-panel to-brand-mint/10 border-brand-mint/30 rounded-3xl bg-gradient-to-b from-white/60 p-8"
				>
					<h3 class="mb-4 flex items-center gap-2 text-lg font-bold text-emerald-800">
						🕹️ Механика Взаимодействия
					</h3>
					<p class="leading-relaxed font-medium text-gray-800">
						{meetingData.collaboration.engagementMechanic}
					</p>
				</div>

				<!-- Questions -->
				<div class="glass-panel rounded-3xl p-8">
					<h3 class="text-brand-blue mb-4 text-lg font-bold">Ключевые Вопросы</h3>
					<ul class="space-y-3">
						{#each meetingData.intentionality.keyQuestions as q, i}
							<li>
								<button
									class="hover:border-brand-blue flex w-full cursor-pointer items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 text-left font-medium transition-all {q.isCompleted
										? 'opacity-60 grayscale'
										: ''}"
									onclick={() => completeQuestion(i)}
									aria-label="Toggle question completion"
								>
									<div
										class="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 {q.isCompleted
											? 'border-brand-mint bg-brand-mint'
											: 'border-gray-300'}"
									>
										{#if q.isCompleted}
											<svg
												class="h-3 w-3 text-white"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
												><path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="3"
													d="M5 13l4 4L19 7"
												></path></svg
											>
										{/if}
									</div>
									<span class="text-gray-700">
										<span class="text-brand-blue mr-1 font-black">Q:</span>{q.text}
									</span>
								</button>
							</li>
						{/each}
					</ul>
				</div>

				<!-- Inclusivity Advice -->
				<div class="glass-panel rounded-3xl border-l-4 border-l-amber-400 p-8">
					<h3 class="mb-2 text-sm font-bold text-amber-600 uppercase">Совет по Инклюзивности</h3>
					<p class="text-gray-700 italic">{meetingData.inclusivity.advice}</p>
				</div>
			</div>
		</div>
	{:else if currentState === 'summary' && meetingData}
		<div class="mx-auto max-w-4xl space-y-8" in:fade>
			<div class="text-center">
				<div
					class="bg-brand-mint/10 text-brand-mint mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full p-4"
				>
					<svg class="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
						></path></svg
					>
				</div>
				<h2 class="text-4xl font-black text-gray-900">Сессия завершена</h2>
				<p class="mt-2 text-xl text-gray-500">Результаты вашей работы над проектом</p>
			</div>

			<div
				class="glass-panel grid grid-cols-1 divide-y divide-gray-200 overflow-hidden rounded-3xl md:grid-cols-2 md:divide-x md:divide-y-0"
			>
				<div class="p-8">
					<h3 class="mb-6 border-b pb-2 text-xl font-bold text-gray-900">✅ Реализованные этапы</h3>
					<ul class="space-y-4">
						{#each meetingData.structure.timeBoxes as box}
							<li class="flex items-center gap-3">
								<div
									class="flex h-6 w-6 items-center justify-center rounded-full {box.isCompleted
										? 'bg-brand-mint text-white'
										: 'bg-gray-100 text-gray-400'}"
								>
									{#if box.isCompleted}
										<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"
											><path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="3"
												d="M5 13l4 4L19 7"
											></path></svg
										>
									{:else}
										<div class="h-2 w-2 rounded-full bg-current"></div>
									{/if}
								</div>
								<span
									class="text-lg {box.isCompleted
										? 'font-semibold text-gray-800'
										: 'text-gray-400'}">{box.title}</span
								>
							</li>
						{/each}
					</ul>
				</div>
				<div class="p-8">
					<h3 class="mb-6 border-b pb-2 text-xl font-bold text-gray-900">❓ Ответы на вопросы</h3>
					<ul class="space-y-4">
						{#each meetingData.intentionality.keyQuestions as q}
							<li class="flex items-start gap-3">
								<div
									class="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full {q.isCompleted
										? 'bg-brand-blue text-white'
										: 'bg-gray-100 text-gray-400'}"
								>
									{#if q.isCompleted}
										<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"
											><path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="3"
												d="M5 13l4 4L19 7"
											></path></svg
										>
									{:else}
										<div class="h-2 w-2 rounded-full bg-current"></div>
									{/if}
								</div>
								<span class="text-md {q.isCompleted ? 'text-gray-800' : 'text-gray-400'}"
									>{q.text}</span
								>
							</li>
						{/each}
					</ul>
				</div>
			</div>

			<div class="flex justify-center gap-4">
				<button
					onclick={restart}
					class="from-brand-blue to-brand-mint hover:from-brand-blue hover:to-brand-blue flex transform items-center gap-3 rounded-2xl bg-gradient-to-r px-10 py-4 text-xl font-bold text-white shadow-xl transition-all hover:-translate-y-1 active:scale-95"
				>
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
						></path></svg
					>
					Новый проект
				</button>
			</div>
		</div>
	{/if}
</div>
