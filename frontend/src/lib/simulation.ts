export async function* simulateMeetingGeneration(topic: string, keyPoints: string, duration: number) {
	yield { event: 'status', data: 'Инициализация нейросети...' };
	await new Promise((r) => setTimeout(r, 800));

	yield { event: 'status', data: 'Анализ контекста встречи...' };
	await new Promise((r) => setTimeout(r, 1200));

	yield { event: 'status', data: 'Формирование структуры таймбоксов...' };
	await new Promise((r) => setTimeout(r, 1000));

	yield { event: 'status', data: 'Подбор механик взаимодействия...' };
	await new Promise((r) => setTimeout(r, 1500));

	yield { event: 'status', data: 'Финальная сборка плана...' };
	await new Promise((r) => setTimeout(r, 800));

	// Default template for demonstration
	const meetingData = {
		structure: {
			manifesto: `Эффективное обсуждение темы "${topic}" с фокусом на результат за ${duration} минут.`,
			timeBoxes: [
				{ title: 'Введение и контекст', durationRange: '0-5 мин', isCompleted: false },
				{ title: 'Разбор ключевых тезисов', durationRange: '5-20 мин', isCompleted: false },
				{ title: 'Принятие решений и Action Items', durationRange: '20-25 мин', isCompleted: false },
				{ title: 'Подведение итогов', durationRange: '25-30 мин', isCompleted: false }
			]
		},
		intentionality: {
			goal: `Сформировать общее видение и конкретные шаги по теме: ${topic}.`,
			keyQuestions: [
				{ text: `Каков текущий статус вопроса "${topic.split(' ')[0]}"?`, isCompleted: false },
				{ text: `Какие основные риски мы видим в "${keyPoints.substring(0, 20)}..."?`, isCompleted: false },
				{ text: 'Кто берет на себя ответственность за следующие шаги?', isCompleted: false }
			]
		},
		collaboration: {
			engagementMechanic:
				'Используйте механику "Round Robin" для обсуждения каждого тезиса: каждый участник высказывается по 1 минуте без прерываний.'
		},
		inclusivity: {
			advice:
				'Следите за тем, чтобы более активные участники не доминировали. Сделайте паузу после каждого блока для комментариев от тех, кто еще не высказывался.'
		}
	};

	// Adjust timeboxes if duration is different
	if (duration !== 30) {
		const factor = duration / 30;
		meetingData.structure.timeBoxes = meetingData.structure.timeBoxes.map((box, i) => {
			const start = Math.round(5 * i * factor);
			const end = Math.round(5 * (i + 1) * factor);
			if (i === meetingData.structure.timeBoxes.length - 1) {
				return { ...box, durationRange: `${Math.round(25 * factor)}-${duration} мин` };
			}
			return { ...box, durationRange: `${start}-${end} мин` };
		});
	}

	yield { event: 'complete', data: JSON.stringify(meetingData) };
}
