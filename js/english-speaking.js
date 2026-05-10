(function () {
    'use strict';

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const hasRecognition = Boolean(SpeechRecognition);
    const hasSpeechSynthesis = 'speechSynthesis' in window;
    const STORAGE_KEY = 'edunova_english_profiles';
    const LLM_KEY = 'edunova_english_llm_config';

    const state = {
        mode: 'conversation',
        lastReply: '',
        lastCoachReply: '',
        listening: false,
        expectedSentence: '',
        currentUserId: 'guest',
        currentUserName: 'Guest',
        profile: { attempts: [] },
        llmConfig: {
            provider: 'openai',
            model: 'gpt-4o-mini',
            endpoint: 'https://api.openai.com/v1/chat/completions',
            apiKey: ''
        },
        isAuthenticated: false,
        preferredVoiceName: ''
    };

    const ui = {};
    let recognition = null;

    function init() {
        ui.modeGroup = document.getElementById('trainerModeGroup');
        ui.startBtn = document.getElementById('startListeningBtn');
        ui.stopBtn = document.getElementById('stopListeningBtn');
        ui.speakBtn = document.getElementById('retrySpeakBtn');
        ui.liveState = document.getElementById('liveState');
        ui.liveTranscript = document.getElementById('liveTranscript');
        ui.messages = document.getElementById('trainerMessages');
        ui.form = document.getElementById('trainerForm');
        ui.input = document.getElementById('trainerInput');
        ui.feedbackScore = document.getElementById('fluencyScore');
        ui.feedbackPoints = document.getElementById('feedbackPoints');
        ui.promptGrid = document.getElementById('promptGrid');
        ui.supportNote = document.getElementById('speechSupportNote');
        ui.pronunciationTarget = document.getElementById('pronunciationTarget');
        ui.analyticsTotal = document.getElementById('analyticsTotal');
        ui.analyticsFluency = document.getElementById('analyticsFluency');
        ui.analyticsPronunciation = document.getElementById('analyticsPronunciation');
        ui.analyticsStreak = document.getElementById('analyticsStreak');
        ui.sessionHistory = document.getElementById('sessionHistoryList');
        ui.improvementSuggestions = document.getElementById('improvementSuggestions');

        ui.openScorecardBtn = document.getElementById('openScorecardBtn');
        ui.openScorecardBtnSide = document.getElementById('openScorecardBtnSide');
        ui.scorecardModal = document.getElementById('scorecardModal');
        ui.closeScorecardBtn = document.getElementById('closeScorecardBtn');

        ui.openLlmSettingsBtn = document.getElementById('openLlmSettingsBtn');
        ui.llmModal = document.getElementById('llmSettingsModal');
        ui.closeLlmSettingsBtn = document.getElementById('closeLlmSettingsBtn');
        ui.saveLlmConfigBtn = document.getElementById('saveLlmConfigBtn');
        ui.testLlmConfigBtn = document.getElementById('testLlmConfigBtn');
        ui.llmProvider = document.getElementById('llmProvider');
        ui.llmModel = document.getElementById('llmModel');
        ui.llmEndpoint = document.getElementById('llmEndpoint');
        ui.llmApiKey = document.getElementById('llmApiKey');
        ui.llmStatus = document.getElementById('llmSettingsStatus');

        if (!ui.messages || !ui.form || !ui.input) return;

        loadSessionUser();
        enforceLoginGate();
        if (!state.isAuthenticated) return;

        loadProfile();
        loadLlmConfig();
        bindEvents();
        initVoiceRecognition();
        renderSupportNote();
        renderAnalytics();
        renderLlmConfig();
        appendMessage('ai', `Hello ${state.currentUserName}! I am your English speaking coach. Speak naturally like you would in class, and I will guide you step by step with supportive feedback.`);
        initVoicePreference();
    }

    function bindEvents() {
        if (ui.modeGroup) {
            ui.modeGroup.addEventListener('click', (event) => {
                const button = event.target.closest('[data-mode]');
                if (!button) return;

                state.mode = button.dataset.mode;
                ui.modeGroup.querySelectorAll('[data-mode]').forEach((item) => item.classList.remove('active'));
                button.classList.add('active');
                appendMessage('ai', `Great choice. We are now in ${titleCase(state.mode)} mode. Share your next sentence whenever you are ready.`);
            });
        }

        if (ui.form) {
            ui.form.addEventListener('submit', async (event) => {
                event.preventDefault();
                const sentence = ui.input.value.trim();
                if (!sentence) return;
                await handleUserInput(sentence, false);
                ui.input.value = '';
            });
        }

        if (ui.startBtn) {
            ui.startBtn.addEventListener('click', startListening);
        }

        if (ui.stopBtn) {
            ui.stopBtn.addEventListener('click', stopListening);
        }

        if (ui.speakBtn) {
            ui.speakBtn.addEventListener('click', () => {
                if (state.lastReply) speakText(state.lastReply);
            });
        }

        if (ui.promptGrid) {
            ui.promptGrid.addEventListener('click', async (event) => {
                const button = event.target.closest('[data-prompt]');
                if (!button) return;
                const prompt = button.dataset.prompt;
                await handleUserInput(prompt, false);
            });
        }

        if (ui.openLlmSettingsBtn && ui.llmModal) {
            ui.openLlmSettingsBtn.addEventListener('click', () => {
                ui.llmModal.classList.add('active');
                ui.llmModal.setAttribute('aria-hidden', 'false');
            });
        }

        if (ui.closeLlmSettingsBtn && ui.llmModal) {
            ui.closeLlmSettingsBtn.addEventListener('click', closeSettingsModal);
        }

        if (ui.llmModal) {
            ui.llmModal.addEventListener('click', (event) => {
                if (event.target === ui.llmModal) closeSettingsModal();
            });
        }

        if (ui.saveLlmConfigBtn) {
            ui.saveLlmConfigBtn.addEventListener('click', saveLlmConfig);
        }

        if (ui.testLlmConfigBtn) {
            ui.testLlmConfigBtn.addEventListener('click', async () => {
                setLlmStatus('Testing AI provider connection...');
                try {
                    const result = await getTrainerResponseFromLLM('Please correct this sentence: he go to school every day', 'grammar');
                    setLlmStatus(`Connection OK. Model response received from ${escapeHtml(state.llmConfig.provider)}.`);
                    if (result && result.corrected) {
                        appendMessage('ai', `✅ LLM Test Success\n\nProvider: ${state.llmConfig.provider}\nModel: ${state.llmConfig.model}\nSample Correction: ${result.corrected}`);
                    }
                } catch (error) {
                    setLlmStatus(`Connection failed: ${error.message}`);
                }
            });
        }

        if (ui.openScorecardBtn) {
            ui.openScorecardBtn.addEventListener('click', openScorecard);
        }

        if (ui.openScorecardBtnSide) {
            ui.openScorecardBtnSide.addEventListener('click', openScorecard);
        }

        if (ui.closeScorecardBtn) {
            ui.closeScorecardBtn.addEventListener('click', closeScorecard);
        }

        if (ui.scorecardModal) {
            ui.scorecardModal.addEventListener('click', (event) => {
                if (event.target === ui.scorecardModal) closeScorecard();
            });
        }
    }

    function initVoiceRecognition() {
        if (!hasRecognition) return;

        recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = true;
        recognition.continuous = false;

        let finalTranscript = '';

        recognition.onstart = () => {
            state.listening = true;
            setLiveState('Listening', true);
        };

        recognition.onresult = (event) => {
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; i += 1) {
                const result = event.results[i];
                if (result.isFinal) {
                    finalTranscript += `${result[0].transcript} `;
                } else {
                    interimTranscript += result[0].transcript;
                }
            }

            const shownText = (finalTranscript + interimTranscript).trim();
            ui.liveTranscript.textContent = shownText || 'Listening...';
        };

        recognition.onerror = () => {
            setLiveState('Error', false);
            state.listening = false;
        };

        recognition.onend = () => {
            setLiveState('Idle', false);
            state.listening = false;
            const clean = finalTranscript.trim();
            finalTranscript = '';
            if (clean) {
                handleUserInput(clean, true);
            }
        };
    }

    function startListening() {
        if (!recognition) {
            appendMessage('ai', 'Voice recognition is not supported in this browser. Please type your sentence for correction.');
            return;
        }

        if (state.listening) return;

        ui.liveTranscript.textContent = 'Listening...';
        recognition.start();
    }

    function stopListening() {
        if (!recognition || !state.listening) return;
        recognition.stop();
    }

    function setLiveState(text, isListening) {
        if (!ui.liveState) return;
        ui.liveState.textContent = text;
        ui.liveState.classList.toggle('listening', isListening);
    }

    async function handleUserInput(sentence, fromVoice) {
        appendMessage('user', fromVoice ? `🎙️ ${sentence}` : sentence);
        const typingNode = appendMessage('ai', 'Let me check that and coach you like a teacher...');

        let result;
        try {
            result = await getTrainerResponse(sentence, state.mode);
        } catch (error) {
            result = buildLocalTrainerResponse(sentence, state.mode);
            result.reply = `${result.reply} (Fallback mode: ${error.message})`;
        }

        if (typingNode && typingNode.parentNode) {
            typingNode.parentNode.removeChild(typingNode);
        }

        const pronunciation = fromVoice
            ? computePronunciationScore(sentence, state.expectedSentence || result.corrected)
            : { score: null, detail: 'Pronunciation score available after voice input.' };

        state.expectedSentence = result.corrected;
        if (ui.pronunciationTarget) {
            ui.pronunciationTarget.textContent = `Target for pronunciation scoring: ${result.corrected}`;
        }

        updateFeedback(result);

        const correctionLine = (result.error && result.error.trim())
            ? `✍️ Nice effort. A better way to say it is: ${result.corrected}`
            : (result.isQuestion ? '✅ Nice question. Your sentence is understandable.' : '✅ Well spoken. Your sentence is clear and correct.');
        const coachReplyLine = result.reply || 'Good progress. Please try one more sentence, and I will guide you further.';
        const followUpLine = getFollowUpPrompt(result.isQuestion, state.mode);

        const formattedReply = result.isQuestion
            ? [
                `💡 Answer: ${coachReplyLine}`,
                correctionLine,
                `🧠 Coach Tip: ${result.tip}`,
                `🤝 Let’s Continue: ${followUpLine}`,
                `🎯 Pronunciation: ${pronunciation.score === null ? 'Not scored yet (send voice input)' : `${pronunciation.score}/100`}`,
                `🔎 Pronunciation Detail: ${pronunciation.detail}`
            ].join('\n\n')
            : [
                correctionLine,
                `🧠 Coach Tip: ${result.tip}`,
                `🗣️ Coach: ${coachReplyLine}`,
                `🤝 Let’s Continue: ${followUpLine}`,
                `🎯 Pronunciation: ${pronunciation.score === null ? 'Not scored yet (send voice input)' : `${pronunciation.score}/100`}`,
                `🔎 Pronunciation Detail: ${pronunciation.detail}`
            ].join('\n\n');

        state.lastReply = buildSpeechReply({
            isQuestion: result.isQuestion,
            corrected: result.corrected,
            hasError: Boolean(result.error && result.error.trim()),
            tip: result.tip,
            answerOrReply: coachReplyLine,
            followUp: followUpLine
        });
        appendMessage('ai', formattedReply);
        speakText(state.lastReply);

        saveAttempt({
            timestamp: new Date().toISOString(),
            mode: state.mode,
            provider: state.llmConfig.provider,
            input: sentence,
            corrected: result.corrected,
            fluencyScore: result.score,
            pronunciationScore: pronunciation.score
        });
    }

    function updateFeedback(result) {
        if (ui.feedbackScore) {
            ui.feedbackScore.textContent = `Fluency Score: ${result.score}/100`;
        }

        if (!ui.feedbackPoints) return;

        ui.feedbackPoints.innerHTML = [
            `<li><strong>Error Found:</strong> ${escapeHtml(result.error || 'No major grammar error detected.')}</li>`,
            `<li><strong>Correction:</strong> ${escapeHtml(result.corrected)}</li>`,
            `<li><strong>Practice Tip:</strong> ${escapeHtml(result.tip)}</li>`
        ].join('');
    }

    async function getTrainerResponse(input, mode) {
        if (state.llmConfig.apiKey && state.llmConfig.endpoint) {
            try {
                return await getTrainerResponseFromLLM(input, mode);
            } catch (error) {
                return buildLocalTrainerResponse(input, mode);
            }
        }

        return buildLocalTrainerResponse(input, mode);
    }

    async function getTrainerResponseFromLLM(input, mode) {
        const config = state.llmConfig;
        const prompt = [
            'You are a warm, encouraging human-like English teacher coaching a student.',
            'Return STRICT JSON ONLY with keys: corrected, natural, score, error, tip, reply.',
            'score must be integer between 0 and 100.',
            'Do NOT repeat the user sentence back.',
            'If correction is needed, phrase guidance like: "The correct sentence should be: ...".',
            'If user asks a question, answer the question directly first in reply, then optionally coach phrasing.',
            'If no correction is needed, provide direct coaching and next practice step.',
            'Tone requirements: friendly, respectful, motivating, and classroom-like. Avoid robotic wording.',
            `Mode: ${mode}`,
            `User sentence: ${input}`
        ].join('\n');

        const request = buildProviderRequest(config, prompt);
        const response = await fetch(request.url, request.options);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const payload = await response.json();
        const text = extractProviderText(config.provider, payload);
        const parsed = safeParseJSON(text);
        if (!parsed || !parsed.corrected) {
            throw new Error('Invalid LLM JSON format');
        }

        return {
            corrected: String(parsed.corrected),
            natural: String(parsed.natural || parsed.corrected),
            score: normalizeScore(parsed.score),
            error: String(parsed.error || ''),
            tip: String(parsed.tip || 'Try short daily speaking practice, 5-10 minutes with clear pauses.'),
            reply: String(parsed.reply || 'Good effort. Let us build confidence one sentence at a time.'),
            isQuestion: isQuestionInput(input)
        };
    }

    function buildProviderRequest(config, prompt) {
        const provider = config.provider;
        const endpoint = config.endpoint;
        const headers = {
            'Content-Type': 'application/json'
        };

        if (provider === 'openai') {
            headers.Authorization = `Bearer ${config.apiKey}`;
            return {
                url: endpoint,
                options: {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        model: config.model || 'gpt-4o-mini',
                        temperature: 0.35,
                        messages: [
                            { role: 'system', content: 'You are an English speaking trainer.' },
                            { role: 'user', content: prompt }
                        ]
                    })
                }
            };
        }

        if (provider === 'anthropic') {
            headers['x-api-key'] = config.apiKey;
            headers['anthropic-version'] = '2023-06-01';
            headers['anthropic-dangerous-direct-browser-access'] = 'true';
            return {
                url: endpoint,
                options: {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        model: config.model || 'claude-3-5-sonnet-20241022',
                        max_tokens: 500,
                        temperature: 0.35,
                        messages: [{ role: 'user', content: prompt }]
                    })
                }
            };
        }

        headers.Authorization = `Bearer ${config.apiKey}`;
        return {
            url: endpoint,
            options: {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    model: config.model,
                    prompt,
                    mode: 'english_coach'
                })
            }
        };
    }

    function extractProviderText(provider, payload) {
        if (provider === 'openai') {
            return payload?.choices?.[0]?.message?.content || '';
        }
        if (provider === 'anthropic') {
            return payload?.content?.[0]?.text || '';
        }
        return payload?.output || payload?.text || payload?.message || '';
    }

    function safeParseJSON(text) {
        const raw = String(text || '').trim();
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch (error) {
            const match = raw.match(/\{[\s\S]*\}/);
            if (!match) return null;
            try {
                return JSON.parse(match[0]);
            } catch (secondError) {
                return null;
            }
        }
    }

    function normalizeScore(value) {
        const num = Number(value);
        if (!Number.isFinite(num)) return 80;
        return Math.max(0, Math.min(100, Math.round(num)));
    }

    function buildLocalTrainerResponse(input, mode) {
        const text = normalizeSentence(input);
        const lower = text.toLowerCase();
        const question = isQuestionInput(text);

        const replacements = [
            { from: /\bi has\b/gi, to: 'I have', reason: 'Use "I have" with first person.' },
            { from: /\bi am agree\b/gi, to: 'I agree', reason: 'Agree is a verb, not an adjective here.' },
            { from: /\bhe go\b/gi, to: 'he goes', reason: 'Third person singular needs "-es".' },
            { from: /\bshe go\b/gi, to: 'she goes', reason: 'Third person singular needs "-es".' },
            { from: /\bthey goes\b/gi, to: 'they go', reason: 'Plural subject uses base verb.' },
            { from: /\bdidn\'t went\b/gi, to: "didn't go", reason: 'Use base verb after did not.' },
            { from: /\bmore better\b/gi, to: 'better', reason: 'Better is already comparative.' },
            { from: /\bdiscuss about\b/gi, to: 'discuss', reason: 'Discuss does not take about.' },
            { from: /\breturn back\b/gi, to: 'return', reason: 'Return already means go back.' }
        ];

        let corrected = text;
        let errorReason = '';

        replacements.forEach((item) => {
            if (item.from.test(corrected)) {
                corrected = corrected.replace(item.from, item.to);
                if (!errorReason) errorReason = item.reason;
            }
        });

        if (corrected.length > 0 && !/[.!?]$/.test(corrected)) {
            corrected = `${corrected}.`;
        }

        const natural = makeNatural(corrected, mode);
        const score = computeScore(text, corrected);

        return {
            corrected,
            natural,
            score,
            error: errorReason,
            tip: getTip(mode, lower, question),
            reply: question ? answerStudentQuestion(lower, corrected, mode) : getCoachReply(mode, lower),
            isQuestion: question
        };
    }

    function isQuestionInput(text) {
        const value = String(text || '').toLowerCase().trim();
        if (!value) return false;
        if (value.includes('?')) return true;
        return /^(what|why|how|when|where|who|which|can|could|should|would|is|are|do|does|did)\b/.test(value);
    }

    function answerStudentQuestion(lower, corrected, mode) {
        if (/how are you/.test(lower)) {
            return 'I am doing well, thank you. I am happy to practice with you. Tell me something about your day in English.';
        }
        if (/improve|confidence|speak(ing)? english/.test(lower)) {
            return 'A simple way to improve confidence is to speak for 2 minutes daily on one topic, record yourself, and repeat with small corrections.';
        }
        if (/difference between|difference/.test(lower) && /has|have/.test(lower)) {
            return 'Use "has" with he, she, and it. Use "have" with I, you, we, and they. Example: I have a pen, she has a pen.';
        }
        if (/introduce myself|introduction/.test(lower)) {
            return 'Start with your name, where you are from, what you do, and one interest. Then end with your goal. Keep each line short and clear.';
        }
        if (/pronunciation/.test(lower)) {
            return 'For better pronunciation, slow down first, stress key words, and repeat the same sentence three times with clear pauses.';
        }
        if (/grammar/.test(lower)) {
            return 'For grammar improvement, practice one pattern at a time, such as subject-verb agreement, then create five sentences using that pattern.';
        }
        if (mode === 'pronunciation') {
            return 'That is a good question. In pronunciation mode, we focus on clear sounds, word stress, and smooth pacing while speaking.';
        }

        return `Great question. Here is a clearer form: "${corrected}". My answer is: keep your sentence short, choose simple words, and speak with steady pace for clarity.`;
    }

    function computePronunciationScore(spoken, target) {
        const spokenWords = tokenizeWords(spoken);
        const targetWords = tokenizeWords(target);

        if (!spokenWords.length || !targetWords.length) {
            return { score: 0, detail: 'Insufficient speech data for phoneme scoring.' };
        }

        const spokenPhonemes = spokenWords.map(wordToPhoneme).join(' ');
        const targetPhonemes = targetWords.map(wordToPhoneme).join(' ');
        const distance = levenshtein(spokenPhonemes, targetPhonemes);
        const maxLen = Math.max(spokenPhonemes.length, targetPhonemes.length) || 1;
        const phonemeScore = Math.round((1 - distance / maxLen) * 100);

        const wordDetails = targetWords.map((targetWord, index) => {
            const spokenWord = spokenWords[index] || '';
            const similarity = phonemeSimilarity(wordToPhoneme(spokenWord), wordToPhoneme(targetWord));
            return { targetWord, spokenWord, similarity };
        });

        const weakWords = wordDetails
            .filter((item) => item.similarity < 0.62)
            .slice(0, 3)
            .map((item) => `${item.targetWord} (heard: ${item.spokenWord || 'missing'})`);

        const detail = weakWords.length
            ? `Needs work on: ${weakWords.join(', ')}`
            : 'Good phoneme match across most words.';

        return {
            score: Math.max(0, Math.min(100, phonemeScore)),
            detail
        };
    }

    function tokenizeWords(value) {
        return String(value || '')
            .toLowerCase()
            .replace(/[^a-z\s']/g, ' ')
            .split(/\s+/)
            .filter(Boolean);
    }

    function wordToPhoneme(word) {
        let out = String(word || '').toLowerCase();
        if (!out) return '';

        const rules = [
            [/tion/g, 'shun'],
            [/sion/g, 'zhun'],
            [/ough/g, 'off'],
            [/ph/g, 'f'],
            [/gh/g, 'g'],
            [/th/g, 'th'],
            [/ch/g, 'ch'],
            [/sh/g, 'sh'],
            [/ng/g, 'ng'],
            [/qu/g, 'kw'],
            [/ck/g, 'k'],
            [/c(?=[eiy])/g, 's'],
            [/c/g, 'k'],
            [/x/g, 'ks'],
            [/[^a-z]/g, '']
        ];

        rules.forEach(([pattern, replace]) => {
            out = out.replace(pattern, replace);
        });

        return out;
    }

    function phonemeSimilarity(a, b) {
        if (!a && !b) return 1;
        const dist = levenshtein(a, b);
        const maxLen = Math.max(a.length, b.length) || 1;
        return 1 - dist / maxLen;
    }

    function levenshtein(a, b) {
        const aa = String(a || '');
        const bb = String(b || '');
        const matrix = Array.from({ length: aa.length + 1 }, () => Array(bb.length + 1).fill(0));

        for (let i = 0; i <= aa.length; i += 1) matrix[i][0] = i;
        for (let j = 0; j <= bb.length; j += 1) matrix[0][j] = j;

        for (let i = 1; i <= aa.length; i += 1) {
            for (let j = 1; j <= bb.length; j += 1) {
                const cost = aa[i - 1] === bb[j - 1] ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j - 1] + cost
                );
            }
        }

        return matrix[aa.length][bb.length];
    }

    function makeNatural(sentence, mode) {
        if (mode === 'conversation') {
            return sentence.replace(/\bI am\b/g, "I'm");
        }
        if (mode === 'pronunciation') {
            return `Please repeat slowly: ${sentence}`;
        }
        return sentence;
    }

    function getTip(mode, lower, isQuestion) {
        if (isQuestion) {
            return 'When asking questions, start with a question word and keep the sentence direct and short.';
        }
        if (mode === 'pronunciation') {
            return 'Say it slowly first, stress the key words, and pause gently between ideas.';
        }
        if (mode === 'grammar') {
            return 'Focus on subject-verb agreement first, then check tense consistency.';
        }
        if (/introduce|myself/.test(lower)) {
            return 'Use a simple 4-part flow: name, background, interests, and your goal.';
        }
        return 'Start with short, clear sentences. Then add one extra detail confidently.';
    }

    function getCoachReply(mode, lower) {
        if (/how are you/.test(lower)) {
            return 'I am doing well, thank you. I am happy to practice English with you today.';
        }
        if (/introduce|myself/.test(lower)) {
            return 'Good start. Now introduce yourself in 5 simple lines, slowly and confidently.';
        }
        if (mode === 'pronunciation') {
            return 'Nice work. Please repeat the corrected sentence two times at a steady pace.';
        }
        if (mode === 'grammar') {
            return 'Good attempt. Send one more sentence and I will help polish the grammar.';
        }

        const defaultReplies = [
            'You are doing well. Send the next sentence, and we will improve it together.',
            'Nice effort. Let us continue with one more sentence at your pace.',
            'Great try. Give me another line, and I will guide you step by step.',
            'I can see progress already. Keep going with your next response.',
            'Good job. I am here, ready to coach your next sentence.'
        ];

        const options = defaultReplies.filter((item) => item !== state.lastCoachReply);
        const chosen = options[Math.floor(Math.random() * options.length)] || defaultReplies[0];
        state.lastCoachReply = chosen;
        return chosen;
    }

    function getFollowUpPrompt(isQuestion, mode) {
        if (isQuestion) {
            return 'Would you like to try saying your question in two different ways for practice?';
        }
        if (mode === 'pronunciation') {
            return 'Can you repeat that once more, a little slower, with clear word stress?';
        }
        if (mode === 'grammar') {
            return 'Now try a similar sentence using the same grammar pattern.';
        }
        return 'Tell me one more sentence about your day, and we will continue the conversation.';
    }

    function buildSpeechReply(payload) {
        const parts = [];

        if (payload.isQuestion) {
            parts.push(payload.answerOrReply);
            if (payload.hasError) {
                parts.push(`A better way to ask it is: ${payload.corrected}`);
            }
        } else {
            if (payload.hasError) {
                parts.push(`Nice try. A better way to say it is: ${payload.corrected}`);
            } else {
                parts.push('That sounded good.');
            }
            parts.push(payload.answerOrReply);
        }

        parts.push(`Quick tip: ${payload.tip}`);
        parts.push(payload.followUp);

        return parts.join(' ');
    }

    function initVoicePreference() {
        if (!hasSpeechSynthesis) return;

        const chooseVoice = () => {
            const voices = window.speechSynthesis.getVoices() || [];
            if (!voices.length) return;

            const preferred = voices.find((voice) => /en-US/i.test(voice.lang) && /female|samantha|zira|aria|jenny|google us english/i.test(voice.name))
                || voices.find((voice) => /en-US/i.test(voice.lang))
                || voices.find((voice) => /^en/i.test(voice.lang))
                || voices[0];

            state.preferredVoiceName = preferred ? preferred.name : '';
        };

        chooseVoice();
        window.speechSynthesis.onvoiceschanged = chooseVoice;
    }

    function computeScore(original, corrected) {
        const originalWords = original.trim().split(/\s+/).filter(Boolean).length || 1;
        const correctedWords = corrected.trim().split(/\s+/).filter(Boolean).length;
        const diff = Math.abs(correctedWords - originalWords);
        const punctuationBonus = /[.!?]$/.test(corrected) ? 6 : 0;
        const base = 82 - diff * 4 + punctuationBonus;
        return Math.max(55, Math.min(98, base));
    }

    function speakText(text) {
        if (!hasSpeechSynthesis || !text) return;

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.97;
        utterance.pitch = 1.03;
        utterance.volume = 1;

        if (state.preferredVoiceName) {
            const voices = window.speechSynthesis.getVoices() || [];
            const selected = voices.find((voice) => voice.name === state.preferredVoiceName);
            if (selected) utterance.voice = selected;
        }

        window.speechSynthesis.speak(utterance);
    }

    function renderSupportNote() {
        if (!ui.supportNote) return;

        if (hasRecognition && hasSpeechSynthesis) {
            ui.supportNote.textContent = 'All speaking tools are ready. You can talk naturally, and your coach will respond with supportive spoken guidance.';
            return;
        }

        if (!hasRecognition && hasSpeechSynthesis) {
            ui.supportNote.textContent = 'Voice playback is available, but microphone recognition is limited in this browser. You can still type and receive full coaching.';
            return;
        }

        ui.supportNote.textContent = 'Speech features are limited in this browser, but your coach can still guide you fully through text practice.';
    }

    function appendMessage(type, text) {
        const row = document.createElement('div');
        row.className = `chat-message ${type}`;

        const bubble = document.createElement('div');
        bubble.className = `chat-bubble ${type}`;
        bubble.textContent = text;

        row.appendChild(bubble);
        ui.messages.appendChild(row);
        ui.messages.scrollTop = ui.messages.scrollHeight;
        return row;
    }

    function loadSessionUser() {
        try {
            const raw = localStorage.getItem('edunova_session');
            if (!raw) {
                state.isAuthenticated = false;
                return;
            }
            const session = JSON.parse(raw);
            if (session && (session.id || session.email || session.name)) {
                state.currentUserId = String(session.id || session.email || session.name).toLowerCase();
                state.currentUserName = session.name || 'Student';
                state.isAuthenticated = true;
                return;
            }
            state.isAuthenticated = false;
        } catch (error) {
            state.currentUserId = 'guest';
            state.currentUserName = 'Guest';
            state.isAuthenticated = false;
        }
    }

    function enforceLoginGate() {
        if (state.isAuthenticated && hasEnglishLoginTicket()) return;

        const next = encodeURIComponent('english-speaking.html');
        window.location.href = `login.html?next=${next}&reason=english-agent-auth`;
    }

    function hasEnglishLoginTicket() {
        try {
            const raw = sessionStorage.getItem('edunova_english_login_ticket');
            if (!raw) return false;
            const ticket = JSON.parse(raw);
            if (!ticket || !ticket.userId) return false;
            return String(ticket.userId).toLowerCase() === state.currentUserId;
        } catch (error) {
            return false;
        }
    }

    function loadProfile() {
        try {
            const allProfiles = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            state.profile = allProfiles[state.currentUserId] || { attempts: [] };
        } catch (error) {
            state.profile = { attempts: [] };
        }
    }

    function persistProfile() {
        const allProfiles = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        allProfiles[state.currentUserId] = state.profile;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allProfiles));
    }

    function saveAttempt(attempt) {
        const attempts = state.profile.attempts || [];
        attempts.push(attempt);
        state.profile.attempts = attempts.slice(-200);
        persistProfile();
        renderAnalytics();
    }

    function renderAnalytics() {
        const attempts = state.profile.attempts || [];
        const total = attempts.length;
        const fluencyValues = attempts.map((a) => Number(a.fluencyScore)).filter((v) => Number.isFinite(v));
        const pronunciationValues = attempts
            .filter((a) => a.pronunciationScore !== null && a.pronunciationScore !== undefined)
            .map((a) => Number(a.pronunciationScore))
            .filter((v) => Number.isFinite(v));

        const avgFluency = fluencyValues.length
            ? Math.round(fluencyValues.reduce((sum, value) => sum + value, 0) / fluencyValues.length)
            : null;
        const avgPronunciation = pronunciationValues.length
            ? Math.round(pronunciationValues.reduce((sum, value) => sum + value, 0) / pronunciationValues.length)
            : null;

        if (ui.analyticsTotal) ui.analyticsTotal.textContent = String(total);
        if (ui.analyticsFluency) ui.analyticsFluency.textContent = avgFluency === null ? '--' : `${avgFluency}/100`;
        if (ui.analyticsPronunciation) ui.analyticsPronunciation.textContent = avgPronunciation === null ? '--' : `${avgPronunciation}/100`;
        if (ui.analyticsStreak) ui.analyticsStreak.textContent = `${computePracticeStreak(attempts)} days`;
        renderSuggestions(attempts, avgFluency, avgPronunciation);

        if (!ui.sessionHistory) return;
        if (!total) {
            ui.sessionHistory.textContent = 'No speaking attempts saved yet.';
            return;
        }

        ui.sessionHistory.innerHTML = attempts
            .slice(-8)
            .reverse()
            .map((item) => {
                const d = new Date(item.timestamp);
                const dateText = d.toLocaleDateString();
                const pronunciationText = Number.isFinite(item.pronunciationScore) ? `${item.pronunciationScore}/100` : '--';
                return `<div class="session-history-item"><strong>${escapeHtml(item.mode)}</strong> • ${escapeHtml(dateText)}<br>Fluency: ${escapeHtml(String(item.fluencyScore))}/100 | Pronunciation: ${escapeHtml(pronunciationText)}<br>${escapeHtml(item.corrected)}</div>`;
            })
            .join('');
    }

    function renderSuggestions(attempts, avgFluency, avgPronunciation) {
        if (!ui.improvementSuggestions) return;

        if (!attempts.length) {
            ui.improvementSuggestions.innerHTML = '<li>Start practicing to generate personalized suggestions.</li>';
            return;
        }

        const suggestions = [];

        if (avgFluency !== null && avgFluency < 75) {
            suggestions.push('Practice 5 short grammar-focused sentences daily before free speaking.');
        }

        if (avgPronunciation !== null && avgPronunciation < 70) {
            suggestions.push('Use pronunciation mode and repeat each corrected sentence at least 3 times slowly.');
        }

        const grammarModeCount = attempts.filter((a) => a.mode === 'grammar').length;
        if (grammarModeCount < Math.ceil(attempts.length * 0.3)) {
            suggestions.push('Increase Grammar Fix sessions to at least 30% of your practice for faster accuracy improvement.');
        }

        const pronunciationAttempts = attempts.filter((a) => Number.isFinite(Number(a.pronunciationScore)));
        if (pronunciationAttempts.length < Math.ceil(attempts.length * 0.4)) {
            suggestions.push('Use microphone input more often to unlock pronunciation scoring and targeted speaking feedback.');
        }

        const recentFluency = attempts.slice(-5).map((a) => Number(a.fluencyScore)).filter((v) => Number.isFinite(v));
        if (recentFluency.length >= 3) {
            const trend = recentFluency[recentFluency.length - 1] - recentFluency[0];
            if (trend >= 5) {
                suggestions.push('Great improvement trend. Keep current routine and try longer responses for the next level.');
            } else if (trend < 0) {
                suggestions.push('Your recent fluency dipped slightly; switch to shorter clear sentences and controlled pacing.');
            }
        }

        if (!suggestions.length) {
            suggestions.push('Strong progress. Next target: improve speaking speed while maintaining grammar accuracy.');
        }

        ui.improvementSuggestions.innerHTML = suggestions.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
    }

    function openScorecard() {
        renderAnalytics();
        if (!ui.scorecardModal) return;
        ui.scorecardModal.classList.add('active');
        ui.scorecardModal.setAttribute('aria-hidden', 'false');
    }

    function closeScorecard() {
        if (!ui.scorecardModal) return;
        ui.scorecardModal.classList.remove('active');
        ui.scorecardModal.setAttribute('aria-hidden', 'true');
    }

    function computePracticeStreak(attempts) {
        if (!attempts.length) return 0;

        const days = Array.from(new Set(attempts.map((item) => (new Date(item.timestamp)).toISOString().slice(0, 10)))).sort().reverse();
        let streak = 0;
        let cursor = new Date();

        for (let i = 0; i < days.length; i += 1) {
            const expected = cursor.toISOString().slice(0, 10);
            if (days[i] !== expected) break;
            streak += 1;
            cursor.setDate(cursor.getDate() - 1);
        }

        return streak;
    }

    function loadLlmConfig() {
        try {
            const all = JSON.parse(localStorage.getItem(LLM_KEY) || '{}');
            const userConfig = all[state.currentUserId];
            if (userConfig) {
                state.llmConfig = { ...state.llmConfig, ...userConfig };
            }
        } catch (error) {
            state.llmConfig = { ...state.llmConfig };
        }
    }

    function renderLlmConfig() {
        if (!ui.llmProvider) return;
        ui.llmProvider.value = state.llmConfig.provider;
        ui.llmModel.value = state.llmConfig.model;
        ui.llmEndpoint.value = state.llmConfig.endpoint;
        ui.llmApiKey.value = state.llmConfig.apiKey;
        setLlmStatus(state.llmConfig.apiKey ? `Configured for ${state.llmConfig.provider}.` : 'No API key saved. Local coaching fallback will be used.');
    }

    function saveLlmConfig() {
        state.llmConfig = {
            provider: ui.llmProvider.value,
            model: ui.llmModel.value.trim(),
            endpoint: ui.llmEndpoint.value.trim(),
            apiKey: ui.llmApiKey.value.trim()
        };

        const all = JSON.parse(localStorage.getItem(LLM_KEY) || '{}');
        all[state.currentUserId] = state.llmConfig;
        localStorage.setItem(LLM_KEY, JSON.stringify(all));

        setLlmStatus('LLM settings saved for this student profile.');
        closeSettingsModal();
    }

    function closeSettingsModal() {
        if (!ui.llmModal) return;
        ui.llmModal.classList.remove('active');
        ui.llmModal.setAttribute('aria-hidden', 'true');
    }

    function setLlmStatus(message) {
        if (ui.llmStatus) {
            ui.llmStatus.textContent = message;
        }
    }

    function normalizeSentence(text) {
        const normalized = String(text || '').trim().replace(/\s+/g, ' ');
        return normalized ? normalized.charAt(0).toUpperCase() + normalized.slice(1) : '';
    }

    function titleCase(value) {
        return String(value).charAt(0).toUpperCase() + String(value).slice(1);
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
