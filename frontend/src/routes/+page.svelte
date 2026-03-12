<script lang="ts">
	import { fade, slide } from 'svelte/transition';
	import { simulateMeetingGeneration } from '$lib/simulation';

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
		generationStatusMessage = 'Инициализация...';

		try {
			const stream = simulateMeetingGeneration(topic, keyPoints, duration);

			for await (const chunk of stream) {
				if (chunk.event === 'status') {
					generationStatusMessage = chunk.data;
				} else if (chunk.event === 'complete') {
					meetingData = JSON.parse(chunk.data);
					timeRemaining = duration * 60;
					currentState = 'session';
				}
			}
		} catch (e) {
			console.error(e);
			generationStatusMessage = 'Произошла ошибка при генерации.';
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

<div class="animate-in fade-in space-y-12 duration-700">
	{#if currentState === 'landing'}
		<div class="flex flex-col items-center justify-center px-4 py-24 text-center md:py-40" in:fade>
			<!-- App Status Badge -->
			<div class="-mt-12 mb-8 flex flex-col items-center gap-4">
				<div
					class="inline-flex items-center justify-center gap-3 rounded-[32px] border border-white/10 bg-white/5 px-5 py-2.5 saturate-150 backdrop-blur-xl"
				>
					<span
						class="bg-brand-blue h-2.5 w-2.5 animate-pulse rounded-full shadow-[0_0_12px_rgba(59,130,246,0.8)]"
					></span>
					<span class="text-sm font-medium tracking-[0.05em] text-white/70 uppercase"
						>AI-Редактор Планирования</span
					>
				</div>
			</div>

			<h1
				class="font-jakarta mb-4 flex flex-wrap items-baseline justify-center text-5xl leading-none font-black tracking-tight text-white md:text-7xl lg:text-8xl"
			>
				<span class="relative flex items-baseline">
					<span
						class="bg-brand-blue/10 absolute -inset-10 -z-10 animate-pulse rounded-full blur-[100px]"
					></span>
					<span
						class="bg-gradient-to-b from-[#F8FAFC] via-[#E0F2FE] to-[#94A3B8] bg-clip-text text-transparent"
						>TimeWave</span
					>
					<span class="text-shimmer-blue ml-2">AI</span>
				</span>
			</h1>

			<!-- Sub-titles and social -->
			<div class="mb-12 flex flex-col items-center gap-2">
				<span class="text-[12px] font-medium tracking-[0.2em] text-white/30 uppercase"
					>Conceptual Demo</span
				>
				<a
					href="https://github.com/Piryutko"
					target="_blank"
					class="text-shimmer-blue text-[11px] font-medium tracking-[0.2em] uppercase transition-opacity hover:opacity-80"
				>
					github.com/Piryutko
				</a>
			</div>

			<p
				class="mx-auto mb-16 max-w-2xl text-[21px] leading-relaxed font-medium tracking-wide text-white/50"
			>
				Испытайте новое поколение управления проектами.<br /> Система автономно координирует структуру
				встреч, таймбоксы и динамику команды с математической точностью.
			</p>

			<div class="mb-16 flex flex-col items-center gap-8">
				<div class="flex flex-col items-center gap-6 sm:flex-row">
					<button
						onclick={() => (currentState = 'setup')}
						class="group border-brand-blue/50 hover:border-brand-blue hover:bg-brand-blue/10 relative overflow-hidden rounded-[32px] border-2 bg-white/5 px-10 py-5 text-sm font-black tracking-[0.2em] text-white uppercase backdrop-blur-xl transition-all hover:shadow-[0_0_50px_rgba(59,130,246,0.3)] active:scale-95"
					>
						<span class="relative z-10 flex items-center gap-3">
							Начать работу
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
		<div
			class="glass-panel relative mx-auto mt-20 max-w-2xl overflow-hidden rounded-[40px] p-12 md:p-16"
			in:fade
		>
			<!-- Decorative corner glow -->
			<div
				class="bg-brand-blue/10 absolute -top-20 -right-20 h-40 w-40 rounded-full blur-3xl"
			></div>

			<div class="relative z-10 mb-12">
				<span class="text-brand-blue mb-4 block text-[10px] font-black tracking-[0.4em] uppercase"
					>Новая Сессия</span
				>
				<h2 class="mb-3 text-4xl font-extrabold tracking-tight text-white">Конфигурация</h2>
				<p class="font-medium tracking-wide text-white/40">
					Определите параметры вашей встречи, чтобы инициализировать Wave Engine.
				</p>
			</div>

			<form
				class="relative z-10 space-y-8"
				onsubmit={(e) => {
					e.preventDefault();
					startGeneration();
				}}
			>
				<div class="space-y-3">
					<label
						for="topic"
						class="ml-1 text-[10px] font-black tracking-[0.3em] text-white/40 uppercase"
						>Тема Встречи</label
					>
					<input
						id="topic"
						type="text"
						bind:value={topic}
						required
						class="focus:border-brand-blue/50 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-4 text-lg font-medium text-white transition-all placeholder:text-white/10 focus:bg-white/[0.05] focus:outline-none"
						placeholder="например: Обзор архитектуры API"
					/>
				</div>

				<div class="space-y-3">
					<label
						for="keyPoints"
						class="ml-1 text-[10px] font-black tracking-[0.3em] text-white/40 uppercase"
						>Ключевые Области (Разделяйте строками)</label
					>
					<textarea
						id="keyPoints"
						bind:value={keyPoints}
						rows="4"
						class="focus:border-brand-blue/50 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-4 leading-relaxed font-medium text-white transition-all placeholder:text-white/10 focus:bg-white/[0.05] focus:outline-none"
						placeholder="- Валидация JSON схемы&#10;- Стратегия лимитирования запросов"
					></textarea>
				</div>

				<div class="space-y-6">
					<div class="ml-1 flex items-center justify-between">
						<label
							for="duration"
							class="text-[10px] font-black tracking-[0.3em] text-white/40 uppercase"
							>Распределение Времени</label
						>
						<span class="text-brand-blue text-sm font-black tracking-widest">{duration} МИН</span>
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
				</div>

				<div class="pt-6">
					<button
						type="submit"
						class="hover:bg-brand-blue w-full rounded-2xl bg-white py-5 text-sm font-black tracking-[0.3em] text-black uppercase shadow-[0_0_30px_rgba(255,255,255,0.05)] transition-all hover:text-white active:scale-[0.98]"
					>
						Обработать и Создать
					</button>
				</div>
			</form>
		</div>
	{:else if currentState === 'generating'}
		<div class="flex flex-col items-center justify-center py-48" in:fade>
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

			<span class="text-brand-blue mb-4 text-[10px] font-black tracking-[0.5em] uppercase"
				>{generationStatusMessage}</span
			>
			<h2 class="text-3xl font-extrabold tracking-tight text-white">Оркестрация Логики...</h2>
		</div>
	{:else if currentState === 'session' && meetingData}
		<div class="grid grid-cols-1 gap-10 lg:grid-cols-12" in:fade>
			<!-- Left Column: Timer & Timeboxes -->
			<div class="space-y-10 lg:col-span-8">
				<!-- Main Timer Glass Panel -->
				<div class="glass-panel relative flex flex-col overflow-hidden rounded-[40px] md:flex-row">
					<!-- Active State Indicator -->
					<div
						class="bg-brand-blue/10 border-brand-blue/20 absolute top-6 left-6 flex items-center gap-3 rounded-full border px-4 py-2"
					>
						<span class="bg-brand-blue h-2 w-2 animate-pulse rounded-full"></span>
						<span class="text-brand-blue text-[9px] font-black tracking-widest uppercase"
							>Движок Активен</span
						>
					</div>

					<div
						class="flex flex-col items-center justify-center border-b border-white/5 bg-white/[0.02] p-20 md:w-1/2 md:border-r md:border-b-0"
					>
						<span class="mb-6 text-[10px] font-medium tracking-[0.4em] text-white/30 uppercase"
							>Оставшееся Время</span
						>
						<div
							class="relative font-mono text-8xl font-black tracking-tighter text-white md:text-9xl"
							class:text-red-500={timeRemaining < 60 && timeRemaining > 0}
						>
							{formattedTime}
							{#if isTimerRunning}
								<div
									class="bg-brand-blue/5 absolute -inset-4 -z-10 animate-pulse rounded-3xl blur-2xl"
								></div>
							{/if}
						</div>

						<div class="mt-12 flex gap-6">
							<button
								onclick={toggleTimer}
								class="group relative overflow-hidden rounded-2xl px-10 py-4 text-[11px] font-black tracking-[0.2em] uppercase transition-all active:scale-95 {isTimerRunning
									? 'border border-white/10 bg-white/10 text-white hover:bg-white/20'
									: 'bg-brand-blue text-white shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_50px_rgba(59,130,246,0.5)]'}"
							>
								{isTimerRunning ? 'Приостановить' : 'Продолжить'}
							</button>
							<button
								onclick={finishSession}
								disabled={!hasStarted}
								class="rounded-2xl border border-white/10 bg-white/5 px-10 py-4 text-[11px] font-black tracking-[0.2em] text-white/40 uppercase transition-all enabled:hover:bg-white/10 enabled:hover:text-white disabled:opacity-20"
							>
								Завершить
							</button>
						</div>
					</div>
					<div class="flex flex-col justify-center p-12 md:w-1/2">
						<div class="mb-10">
							<span
								class="text-brand-blue mb-4 block text-[12px] font-black tracking-[0.2em] uppercase"
								>Манифест</span
							>
							<p class="text-2xl leading-tight font-medium tracking-tight text-white italic">
								«{meetingData.structure.manifesto}»
							</p>
						</div>
						<div>
							<span
								class="text-brand-blue mb-4 block text-[12px] font-black tracking-[0.2em] uppercase"
								>Стратегическая Цель</span
							>
							<h2 class="text-3xl font-black tracking-tight text-white">
								{meetingData.intentionality.goal}
							</h2>
						</div>
					</div>
				</div>

				<!-- TimeBoxes -->
				<div class="glass-panel rounded-[40px] p-12">
					<div class="mb-10 flex items-center justify-between">
						<div>
							<h3 class="mb-1 text-2xl font-black tracking-tight text-white">
								Пайплайн Выполнения
							</h3>
							<p class="text-[10px] font-medium tracking-[0.4em] text-white/30 uppercase">
								Процедурные шаги
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
											class="mb-1 text-[9px] font-medium tracking-[0.2em] text-white/30 uppercase"
											>Шаг {i + 1}</span
										>
										<span
											class="text-[15px] font-bold tracking-tight {box.isCompleted
												? 'text-white/60 line-through'
												: 'text-white'}">{box.title}</span
										>
									</div>
								</div>
								<span
									class="group-hover:border-brand-blue/30 group-hover:text-brand-blue relative z-10 rounded-full border border-white/10 bg-white/5 px-6 py-2 text-[10px] font-black tracking-widest text-white/50 uppercase transition-all"
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
			<div class="space-y-10 lg:col-span-4">
				<!-- Collaboration Mechanic -->
				<div class="glass-panel relative overflow-hidden rounded-[40px] p-10">
					<div
						class="bg-brand-mint/10 absolute -top-10 -right-10 h-32 w-32 rounded-full blur-3xl"
					></div>

					<div class="mb-8">
						<span
							class="text-brand-mint mb-3 block text-[12px] font-black tracking-[0.2em] uppercase"
							>Логика Взаимодействия</span
						>
						<h3 class="text-[15px] font-bold tracking-tight text-white">Системная Механика</h3>
					</div>

					<p class="text-lg leading-relaxed font-medium tracking-wide text-white/70">
						{meetingData.collaboration.engagementMechanic}
					</p>
				</div>

				<!-- Questions -->
				<div class="glass-panel rounded-[40px] p-10">
					<div class="mb-8">
						<span
							class="text-brand-blue mb-3 block text-[12px] font-black tracking-[0.2em] uppercase"
							>Верификация</span
						>
						<h3 class="text-[15px] font-bold tracking-tight text-white">Критические Точки</h3>
					</div>

					<ul class="space-y-4">
						{#each meetingData.intentionality.keyQuestions as q, i}
							<li>
								<button
									class="group flex w-full cursor-pointer items-start gap-4 rounded-3xl border border-white/5 bg-white/[0.02] p-6 text-left transition-all hover:bg-white/[0.04] {q.isCompleted
										? 'opacity-30 grayscale'
										: ''}"
									onclick={() => completeQuestion(i)}
								>
									<div
										class="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all {q.isCompleted
											? 'border-brand-blue bg-brand-blue'
											: 'group-hover:border-brand-blue/50 border-white/20'}"
									>
										{#if q.isCompleted}
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
											class="text-brand-blue mb-1 text-[9px] font-medium tracking-[0.2em] uppercase"
											>Q-{i + 1}</span
										>
										<span class="text-[15px] leading-relaxed font-bold tracking-wide text-white/80">
											{q.text}
										</span>
									</div>
								</button>
							</li>
						{/each}
					</ul>
				</div>

				<!-- Inclusivity Advice -->
				<div
					class="glass-panel border-l-brand-blue/50 rounded-[40px] border-l-2 bg-gradient-to-br from-amber-500/5 to-transparent p-10"
				>
					<span
						class="decoration-brand-blue mb-4 block text-[12px] font-black tracking-[0.2em] text-amber-500/80 uppercase underline underline-offset-8"
						>Процедурные Рекомендации</span
					>
					<p class="text-[15px] leading-relaxed font-medium tracking-wide text-white/60 italic">
						{meetingData.inclusivity.advice}
					</p>
				</div>
			</div>
		</div>
	{:else if currentState === 'summary' && meetingData}
		<div class="mx-auto max-w-5xl space-y-12" in:fade>
			<div class="text-center">
				<div
					class="bg-brand-blue/10 border-brand-blue/20 mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full border"
				>
					<svg
						class="text-brand-blue h-10 w-10 shadow-[0_0_20px_rgba(59,130,246,0.5)]"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2.5"
							d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
						></path></svg
					>
				</div>
				<h2 class="mb-4 text-6xl font-black tracking-tighter text-white">Результат Сессии</h2>
				<p class="text-xl font-medium tracking-wide text-white/40">
					Анализ выполнения и итогов работы движка.
				</p>
			</div>

			<div
				class="glass-panel grid grid-cols-1 divide-y divide-white/5 overflow-hidden rounded-[40px] md:grid-cols-2 md:divide-x md:divide-y-0"
			>
				<div class="p-12">
					<div class="mb-10">
						<span
							class="text-brand-blue mb-2 block text-[10px] font-black tracking-[0.3em] uppercase"
							>Метрики</span
						>
						<h3 class="text-2xl font-black tracking-tight text-white">Выполненные Этапы</h3>
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
							class="text-brand-blue mb-2 block text-[10px] font-black tracking-[0.3em] uppercase"
							>Верификация</span
						>
						<h3 class="text-2xl font-black tracking-tight text-white">Решенные Вопросы</h3>
					</div>
					<ul class="space-y-6">
						{#each meetingData.intentionality.keyQuestions as q}
							<li class="flex items-start gap-5">
								<div
									class="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-shadow {q.isCompleted
										? 'bg-brand-blue text-black shadow-[0_0_15px_rgba(59,130,246,0.4)]'
										: 'bg-white/5 text-white/20'}"
								>
									{#if q.isCompleted}
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
									class="text-lg leading-relaxed tracking-wide {q.isCompleted
										? 'font-medium text-white/80'
										: 'text-white/20'}">{q.text}</span
								>
							</li>
						{/each}
					</ul>
				</div>
			</div>

			<div class="flex justify-center pt-8">
				<button
					onclick={restart}
					class="group bg-brand-blue relative overflow-hidden rounded-[32px] px-16 py-6 text-sm font-black tracking-[0.4em] text-white uppercase shadow-[0_0_50px_rgba(59,130,246,0.3)] transition-all hover:scale-105 active:scale-95"
				>
					<span class="relative z-10 flex items-center gap-4">
						<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="3"
								d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
							></path></svg
						>
						Запустить Новый Движок
					</span>
					<div
						class="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full"
					></div>
				</button>
			</div>
		</div>
	{/if}
</div>
