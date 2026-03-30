/*
 * app.bundle.js
 * ??????? file:// ?????????
 * ???src/data + src/core + src/ui + src/main
 */


const cards = [
    { id: 1, level: 1, category: 'couple', question: '今天你做的哪一个举动最让对方开心？' },
    { id: 2, level: 1, category: 'couple', question: '你最欣赏对方的哪个小习惯？' },
    { id: 3, level: 1, category: 'couple', question: '你和对方一起做过最有趣的一件事是什么？' },
    { id: 4, level: 1, category: 'couple', question: '你是什么时候第一次对对方心动的？' },
    { id: 5, level: 1, category: 'couple', question: '用三个词形容你们现在的关系状态。' },
    { id: 6, level: 1, category: 'couple', question: '你最喜欢和对方一起做的哪件事？' },
    { id: 7, level: 1, category: 'couple', question: '今天你最想和对方分享的一件小事是什么？' },
    { id: 8, level: 1, category: 'couple', question: '最近有什么让你开心的事？' },
    { id: 9, level: 1, category: 'couple', question: '你理想中的周末通常怎么度过？' },
    { id: 10, level: 1, category: 'couple', question: '如果下一次旅行可任选目的地，你最想去哪里？' },
    { id: 11, level: 1, category: 'couple', question: '你最近看过最好的电影是什么？' },
    { id: 12, level: 1, category: 'couple', question: '在对方做的菜里，你最喜欢哪一道？' },
    { id: 13, level: 1, category: 'friend', question: '你和对方第一次见面时，你的第一印象是什么？' },
    { id: 14, level: 1, category: 'friend', question: '你最喜欢和对方一起做的活动是什么？' },
    { id: 15, level: 1, category: 'friend', question: '用三个词形容你们的友谊。' },
    { id: 16, level: 1, category: 'friend', question: '最近有什么让你开心的小事？' },
    { id: 17, level: 1, category: 'friend', question: '最近你最想分享的一件新鲜事是什么？' },
    { id: 18, level: 1, category: 'friend', question: '这周你的状态怎么样？' },
    { id: 19, level: 1, category: 'friend', question: '最近你新开始或重新拾起的一个爱好是什么？' },
    { id: 20, level: 1, category: 'friend', question: '最近你最喜欢的一本书是什么？为什么推荐？' },
    { id: 21, level: 1, category: 'family', question: '家里最让你感到温暖的时刻是什么？' },
    { id: 22, level: 1, category: 'family', question: '你最喜欢家里的哪个传统？为什么？' },
    { id: 23, level: 1, category: 'family', question: '用三个词形容你目前感受到的家庭氛围。' },
    { id: 24, level: 1, category: 'family', question: '小时候家里最让你温暖的传统是什么？' },
    { id: 25, level: 1, category: 'family', question: '家人做过哪道菜最让你怀念？' },
    { id: 26, level: 1, category: 'family', question: '你最想和家人一起完成的一件事是什么？' },
    { id: 27, level: 1, category: 'family', question: '家里有什么有趣的故事？' },
    { id: 28, level: 1, category: 'family', question: '最近和家人有什么开心的时刻？' },
    { id: 29, level: 1, category: 'self', question: '今天最让你开心的小事是什么？' },
    { id: 30, level: 1, category: 'self', question: '用三个词形容你当下的自己。' },
    { id: 31, level: 1, category: 'self', question: '最近你有什么新的发现或领悟？' },
    { id: 32, level: 1, category: 'self', question: '最近一件让你有成就感的事是什么？' },
    { id: 33, level: 1, category: 'self', question: '今天你最感激的一件事是什么？' },
    { id: 34, level: 1, category: 'self', question: '如果这个月能学会一个小技能，你想学什么？' },
    { id: 35, level: 1, category: 'self', question: '最近你最期待的一件事是什么？' },
    { id: 36, level: 1, category: 'self', question: '最近什么事最能让你放松下来？' },
    { id: 37, level: 2, category: 'couple', question: '这段关系让你成长最多的一点是什么？' },
    { id: 38, level: 2, category: 'couple', question: '你觉得你们之间最有效的沟通方式是什么？' },
    { id: 39, level: 2, category: 'couple', question: '未来三个月，你最希望这段关系出现什么变化？' },
    { id: 40, level: 2, category: 'couple', question: '最近一次让你被对方打动的时刻是什么？' },
    { id: 41, level: 2, category: 'couple', question: '当你们有冲突时，你最希望对方怎么做？' },
    { id: 42, level: 2, category: 'couple', question: '当你情绪低落时，你最希望对方怎样陪伴你？' },
    { id: 43, level: 2, category: 'couple', question: '在这段关系里，你什么时候最有“被理解”的感觉？' },
    { id: 44, level: 2, category: 'couple', question: '对你来说，亲密和独处的理想平衡是什么？' },
    { id: 45, level: 2, category: 'couple', question: '最近一次你在意但没说出口的事是什么？' },
    { id: 46, level: 2, category: 'couple', question: '对你最有效的“被爱表达方式”是什么？' },
    { id: 47, level: 2, category: 'couple', question: '你觉得哪一个小习惯最能提升关系质量？' },
    { id: 48, level: 2, category: 'couple', question: '你希望对方减少的一个相处方式是什么？' },
    { id: 49, level: 2, category: 'couple', question: '为了关系更好，你愿意先做的一个新尝试是什么？' },
    { id: 50, level: 2, category: 'couple', question: '如果要设一个边界，你最想先明确哪一条？' },
    { id: 51, level: 2, category: 'couple', question: '未来一年，你最想和对方完成的一个共同目标是什么？' },
    { id: 52, level: 2, category: 'couple', question: '出现分歧时，你希望你们按什么方式做决定？' },
    { id: 53, level: 2, category: 'couple', question: '在这段关系里，什么最能给你安全感？' },
    { id: 54, level: 2, category: 'couple', question: '本周你愿意为这段关系做的一件小行动是什么？' },
    { id: 55, level: 2, category: 'friend', question: '这段友谊里，你最珍惜的一点是什么？' },
    { id: 56, level: 2, category: 'friend', question: '当你压力很大时，你最希望朋友如何支持你？' },
    { id: 57, level: 2, category: 'friend', question: '未来你最希望和这位朋友多做的一件事是什么？' },
    { id: 58, level: 2, category: 'friend', question: '最近一次你需要帮助却没开口的时刻是什么？' },
    { id: 59, level: 2, category: 'friend', question: '在友谊中，你最看重的品质是什么？' },
    { id: 60, level: 2, category: 'friend', question: '如果出现误会，你希望你们怎么沟通并修复？' },
    { id: 61, level: 2, category: 'friend', question: '当你情绪复杂时，你最希望朋友先做哪一种回应？' },
    { id: 62, level: 2, category: 'friend', question: '你觉得你们现在最需要改善的一种沟通习惯是什么？' },
    { id: 63, level: 2, category: 'friend', question: '最近一次你对朋友感到失望的时刻是什么？你当时在意什么？' },
    { id: 64, level: 2, category: 'friend', question: '当你和朋友意见不同，你通常会怎样表达自己的立场？' },
    { id: 65, level: 2, category: 'friend', question: '你希望这段友谊里增加的一种相处频率是什么？' },
    { id: 66, level: 2, category: 'friend', question: '如果要让友谊更稳定，你认为最关键的一条边界是什么？' },
    { id: 67, level: 2, category: 'family', question: '在家庭里，你最希望被理解的一点是什么？' },
    { id: 68, level: 2, category: 'family', question: '最近一次家庭分歧中，你最真实的感受是什么？' },
    { id: 69, level: 2, category: 'family', question: '当家人表达关心时，哪种方式最让你能接受？' },
    { id: 70, level: 2, category: 'family', question: '你最希望家里减少的一种沟通方式是什么？' },
    { id: 71, level: 2, category: 'family', question: '如果可以调整一个家庭规则，你最想改哪一条？' },
    { id: 72, level: 2, category: 'family', question: '面对家庭压力时，你最需要家人提供什么支持？' },
    { id: 73, level: 2, category: 'family', question: '你现在和家人最需要修复的一件小事是什么？' },
    { id: 74, level: 2, category: 'family', question: '在家庭关系里，你最重视的边界是什么？' },
    { id: 75, level: 2, category: 'family', question: '未来半年，你最希望和家人达成的一个共识是什么？' },
    { id: 76, level: 2, category: 'family', question: '为了让家庭氛围更好，你愿意先做的一个行动是什么？' },
    { id: 77, level: 2, category: 'self', question: '最近你反复出现的一种情绪模式是什么？' },
    { id: 78, level: 2, category: 'self', question: '当你压力上来时，最常见的自动反应是什么？' },
    { id: 79, level: 2, category: 'self', question: '你最近在回避的一件事是什么？为什么？' },
    { id: 80, level: 2, category: 'self', question: '现在最消耗你精力的一个念头是什么？' },
    { id: 81, level: 2, category: 'self', question: '你最近一次清晰表达自己需求是在什么场景？' },
    { id: 82, level: 2, category: 'self', question: '你最想优化的一个日常习惯是什么？' },
    { id: 83, level: 2, category: 'self', question: '当你自我怀疑时，哪句话最容易影响你？' },
    { id: 84, level: 2, category: 'self', question: '最近一个让你卡住的决定是什么？' },
    { id: 85, level: 2, category: 'self', question: '你目前最想守住的一条个人边界是什么？' },
    { id: 86, level: 2, category: 'self', question: '过去一个月，你最满意的一个选择是什么？' },
    { id: 87, level: 2, category: 'self', question: '你最希望在接下来四周改变的一件事是什么？' },
    { id: 88, level: 2, category: 'self', question: '如果只做一件事来改善状态，你会选什么？' },
    { id: 89, level: 2, category: 'self', question: '你现在最需要放下的一种执念是什么？' },
    { id: 90, level: 2, category: 'self', question: '为了成为更稳定的自己，你准备先做哪一步？' },
    { id: 91, level: 3, category: 'couple', question: '在这段关系里，你最害怕失去的东西是什么？' },
    { id: 92, level: 3, category: 'couple', question: '如果只能说一句你一直没说出口的话，你会说什么？' },
    { id: 93, level: 3, category: 'couple', question: '你最希望对方真正理解、但你还没表达清楚的一点是什么？' },
    { id: 94, level: 3, category: 'couple', question: '当你们关系紧张时，你内心最深的担心通常是什么？' },
    { id: 95, level: 3, category: 'couple', question: '你在亲密关系中最难启齿的需求是什么？' },
    { id: 96, level: 3, category: 'couple', question: '你最希望这段关系保持不变的一点是什么？' },
    { id: 97, level: 3, category: 'couple', question: '当你感到被忽视时，你最希望对方怎样回应你？' },
    { id: 98, level: 3, category: 'couple', question: '如果要重来一次最近的冲突，你最想改变自己哪一步？' },
    { id: 99, level: 3, category: 'couple', question: '你认为你们最需要建立的一个长期沟通机制是什么？' },
    { id: 100, level: 3, category: 'couple', question: '为了让关系走得更远，你现在最愿意承担的一份责任是什么？' },
    { id: 101, level: 2, category: 'couple', question: '当对方没及时回应你时，你第一反应通常是什么？' },
    { id: 102, level: 2, category: 'couple', question: '今天你最希望从对方那里获得哪一种支持？' },
    { id: 103, level: 2, category: 'friend', question: '当朋友与你意见不同，你最希望被如何对待？' },
    { id: 104, level: 2, category: 'friend', question: '最近一次你感到被朋友理解是在什么情境？' },
    { id: 105, level: 1, category: 'family', question: '在家庭交流里，什么语气最容易让你放松？' },
    { id: 106, level: 2, category: 'family', question: '最近一次你真切感到被家人看见是什么时候？' },
    { id: 107, level: 2, category: 'self', question: '你现在最需要先照顾好的一个感受是什么？' },
    { id: 108, level: 2, category: 'self', question: '今天你最想对自己说的一句支持性话语是什么？' },
    { id: 109, level: 2, category: 'couple', question: '当你提出需求时，最担心被对方误解成什么？' },
    { id: 110, level: 2, category: 'couple', question: '在关系里，你更希望先被理解，还是先被建议？为什么？' },
    { id: 111, level: 2, category: 'friend', question: '当朋友情绪激动时，你通常会怎么回应，效果如何？' },
    { id: 112, level: 2, category: 'friend', question: '为了让友谊更稳，你最想改进的一种表达方式是什么？' },
    { id: 113, level: 2, category: 'family', question: '在家庭分歧中，你最容易忽略的一个真实需求是什么？' },
    { id: 114, level: 3, category: 'family', question: '你希望家人以后遇到冲突时，优先遵守哪条沟通规则？' },
    { id: 115, level: 2, category: 'self', question: '当你感到委屈时，你通常如何表达才能既清楚又不失控？' },
    { id: 116, level: 3, category: 'self', question: '你最想练习的一项沟通能力是什么？你准备怎么开始？' },
    { id: 117, level: 3, category: 'couple', question: '在亲密关系里，你最深层的情感底线是什么？' },
    { id: 118, level: 3, category: 'couple', question: '如果关系只能优先满足一个核心需要，你会选什么？为什么？' },
    { id: 119, level: 3, category: 'friend', question: '在友谊里，你最不能妥协的一条原则是什么？' },
    { id: 120, level: 3, category: 'friend', question: '如果这段友谊进入低谷，你最希望先修复的是什么？' },
    { id: 121, level: 3, category: 'family', question: '在家庭中，你最希望被长期尊重的一条边界是什么？' },
    { id: 122, level: 3, category: 'family', question: '为了减轻家庭中的误解，你最愿意先改变哪一种说法？' },
    { id: 123, level: 3, category: 'self', question: '当你情绪失衡时，你最有效的自我安顿方式是什么？' },
    { id: 124, level: 3, category: 'self', question: '未来三个月，你最想建立的一个稳定内在习惯是什么？' },
    { id: 125, level: 1, category: 'clear_thinking', question: '遇到复杂问题时，你通常先问自己的第一个问题是什么？' },
    { id: 126, level: 2, category: 'clear_thinking', question: '最近一次你判断失误，是因为什么信息没看见？' },
    { id: 127, level: 2, category: 'clear_thinking', question: '当你很确定自己是对的时，你会如何自我校验？' },
    { id: 128, level: 2, category: 'clear_thinking', question: '你最近在哪个决定里把情绪当成了事实？' },
    { id: 129, level: 2, category: 'clear_thinking', question: '现在这个问题里，哪些是事实，哪些是解释？' },
    { id: 130, level: 1, category: 'clear_thinking', question: '如果把问题缩小到今天，你最该先做哪一步？' },
    { id: 131, level: 2, category: 'clear_thinking', question: '你最常见的一个思维盲点是什么？' },
    { id: 132, level: 2, category: 'clear_thinking', question: '当信息不足时，你会用什么标准先做临时决策？' },
    { id: 133, level: 2, category: 'clear_thinking', question: '这个判断背后，你默认了哪些前提？' },
    { id: 134, level: 2, category: 'clear_thinking', question: '如果与你立场相反的人来分析，会得出什么结论？' },
    { id: 135, level: 2, category: 'clear_thinking', question: '你现在更像是在求真，还是在证明自己没错？' },
    { id: 136, level: 3, category: 'clear_thinking', question: '哪一条证据最可能推翻你当前结论？' },
    { id: 137, level: 2, category: 'clear_thinking', question: '在这个选择里，短期收益和长期代价分别是什么？' },
    { id: 138, level: 2, category: 'clear_thinking', question: '你是否把“紧急”误当成了“重要”？体现在哪里？' },
    { id: 139, level: 2, category: 'clear_thinking', question: '若必须删掉一个目标，删哪一个能让整体更清晰？' },
    { id: 140, level: 2, category: 'clear_thinking', question: '这个决定是否可逆？可逆和不可逆部分分别是什么？' },
    { id: 141, level: 3, category: 'clear_thinking', question: '为了避免重复犯错，你要为这件事建立什么检查点？' },
    { id: 142, level: 3, category: 'clear_thinking', question: '如果一年后回看今天，你最可能后悔忽视了什么？' },
    { id: 143, level: 3, category: 'clear_thinking', question: '你现在坚持的观点里，哪一条最需要被重新检验？' },
    { id: 144, level: 3, category: 'clear_thinking', question: '当价值观冲突时，你排序前三的原则是什么？' },
    { id: 145, level: 3, category: 'clear_thinking', question: '在高压情境下，你如何区分“真实风险”和“想象风险”？' },
    { id: 146, level: 3, category: 'clear_thinking', question: '如果只能保留一个长期习惯来提升判断力，你选什么？' },
    { id: 147, level: 3, category: 'clear_thinking', question: '你准备如何设计一个机制，防止自己被惯性带着走？' },
    { id: 148, level: 3, category: 'clear_thinking', question: '面对不确定未来，你愿意坚持的最小行动单位是什么？' },
    { id: 149, level: 3, category: 'clear_thinking', question: '从今天开始，你决定停止的一种低质量思考模式是什么？' },
];

function filterCards(cards, category, level) {
    return cards.filter((card) => {
        const categoryMatched = category === 'all' || card.category === category;
        const levelMatched = level === 'all' || String(card.level) === String(level);
        return categoryMatched && levelMatched;
    });
}

function drawRandomCard(cards) {
    if (!cards.length) return null;
    const index = Math.floor(Math.random() * cards.length);
    return cards[index];
}


const HISTORY_KEY = 'heartTalkHistory';

function loadHistory() {
    try {
        const raw = localStorage.getItem(HISTORY_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function saveHistory(history) {
    try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        return true;
    } catch {
        return false;
    }
}

function clearHistoryStore() {
    try {
        localStorage.removeItem(HISTORY_KEY);
        return true;
    } catch {
        return false;
    }
}


function createElement(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}

function renderCard({ currentCard, categoryNames, levelNames, elements }) {
    const {
        emptyState,
        cardContent,
        cardCategory,
        cardLevel,
        cardQuestion,
        saveBtn,
        shareBtn
    } = elements;

    if (!currentCard) {
        emptyState.style.display = 'block';
        cardContent.style.display = 'none';
        saveBtn.style.display = 'none';
        shareBtn.style.display = 'none';
        return;
    }

    emptyState.style.display = 'none';
    cardContent.style.display = 'block';
    cardCategory.textContent = categoryNames[currentCard.category] || currentCard.category;
    cardLevel.textContent = levelNames[String(currentCard.level)] || `第${currentCard.level}级`;
    cardLevel.className = `card-level level-${currentCard.level}`;
    
    // For Bible verse cards, display verse text and reference
    if (currentCard.text && currentCard.reference) {
        cardQuestion.innerHTML = `
            <div class="verse-text">${currentCard.text}</div>
            <div class="verse-reference">${currentCard.reference}</div>
        `;
    } else {
        cardQuestion.textContent = currentCard.question;
    }
    
    saveBtn.style.display = 'inline-block';
    shareBtn.style.display = 'inline-block';
}

function renderHistory({ history, levelNames, historyList }) {
    historyList.replaceChildren();

    if (!history.length) {
        const empty = createElement('div', 'empty-state');
        empty.appendChild(createElement('p', '', '暂无对话记录'));
        historyList.appendChild(empty);
        return;
    }

    const fragment = document.createDocumentFragment();
    history.forEach((item) => {
        const wrapper = createElement('div', 'history-item');
        wrapper.appendChild(createElement('div', 'timestamp', item.timestamp));

        const badge = createElement('span', `level-badge level-${item.card.level}`);
        badge.textContent = levelNames[String(item.card.level)] || `第${item.card.level}级`;
        wrapper.appendChild(badge);

        wrapper.appendChild(createElement('div', 'question', item.card.question));
        wrapper.appendChild(createElement('div', 'answer', item.answer));
        fragment.appendChild(wrapper);
    });

    historyList.appendChild(fragment);
}



const state = {
    currentCard: null,
    currentCategory: 'all',
    currentLevel: 'all',
    history: loadHistory()
};

const UI_TIMING = {
    toastVisibleMs: 1800,
    toastExitMs: 180
};

const THEME_KEY = 'heartTalkTheme';
const THEME_CHOICES = ['forest', 'warm', 'dark'];
const THEME_LABELS = {
    forest: '\u6d45\u7eff\u68ee\u6797',
    warm: '\u6696\u7eb8\u6cbb\u6108',
    dark: '\u591c\u95f4\u62a4\u773c'
};

const elements = {
    cardContainer: document.getElementById('cardContainer'),
    emptyState: document.getElementById('emptyState'),
    cardContent: document.getElementById('cardContent'),
    cardCategory: document.getElementById('cardCategory'),
    cardLevel: document.getElementById('cardLevel'),
    cardQuestion: document.getElementById('cardQuestion'),
    drawBtn: document.getElementById('drawBtn'),
    saveBtn: document.getElementById('saveBtn'),
    shareBtn: document.getElementById('shareBtn'),
    historyList: document.getElementById('historyList'),
    saveModal: document.getElementById('saveModal'),
    shareModal: document.getElementById('shareModal'),
    saveModalQuestion: document.getElementById('saveModalQuestion'),
    answerInput: document.getElementById('answerInput'),
    confirmSaveBtn: document.getElementById('confirmSaveBtn'),
    cancelSaveBtn: document.getElementById('cancelSaveBtn'),
    shareQuestion: document.getElementById('shareQuestion'),
    shareAnswer: document.getElementById('shareAnswer'),
    copyShareBtn: document.getElementById('copyShareBtn'),
    closeShareBtn: document.getElementById('closeShareBtn'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn'),
    categoryFilters: document.getElementById('categoryFilters'),
    levelFilters: document.getElementById('levelFilters'),
    toastContainer: document.getElementById('toastContainer'),
    confirmModal: document.getElementById('confirmModal'),
    confirmMessage: document.getElementById('confirmMessage'),
    confirmOkBtn: document.getElementById('confirmOkBtn'),
    confirmCancelBtn: document.getElementById('confirmCancelBtn'),
    themeSelector: document.getElementById('themeSelector')
};

function buildNamesMap(selector, dataKey) {
    const map = {};
    document.querySelectorAll(selector).forEach((btn) => {
        const key = btn.dataset[dataKey];
        if (key && key !== 'all') {
            map[key] = btn.textContent.trim();
        }
    });
    return map;
}

const categoryNames = buildNamesMap('#categoryFilters .filter-btn', 'category');
const levelNames = buildNamesMap('#levelFilters .filter-btn', 'level');

function getSavedAnswerForCurrentCard() {
    if (!state.currentCard) return '';
    const item = state.history.find((entry) => entry.card.id === state.currentCard.id);
    return item ? item.answer : '';
}

function refreshCardView() {
    renderCard({
        currentCard: state.currentCard,
        categoryNames,
        levelNames,
        elements
    });
}

function refreshHistoryView() {
    renderHistory({
        history: state.history,
        levelNames,
        historyList: elements.historyList
    });
}

function getStoredTheme() {
    const value = localStorage.getItem(THEME_KEY);
    return THEME_CHOICES.includes(value) ? value : 'forest';
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (!elements.themeSelector) return;
    elements.themeSelector.querySelectorAll('[data-theme-choice]').forEach((button) => {
        const active = button.dataset.themeChoice === theme;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
    });
}

function setTheme(theme) {
    if (!THEME_CHOICES.includes(theme)) return;
    localStorage.setItem(THEME_KEY, theme);
    applyTheme(theme);
    showToast(`\u5df2\u5207\u6362\u5230${THEME_LABELS[theme]}\u98ce\u683c\u3002`, 'success');
}

function showToast(message, type = 'info') {
    const oldToasts = elements.toastContainer.querySelectorAll('.toast');
    if (oldToasts.length >= 2) {
        oldToasts[0].remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'toast-error' : type === 'success' ? 'toast-success' : ''}`.trim();
    toast.textContent = message;
    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('toast-hide');
        setTimeout(() => {
            toast.remove();
        }, UI_TIMING.toastExitMs);
    }, UI_TIMING.toastVisibleMs);
}

function showConfirm(message) {
    return new Promise((resolve) => {
        elements.confirmMessage.textContent = message;
        elements.confirmModal.classList.add('active');

        const cleanUp = () => {
            elements.confirmModal.classList.remove('active');
            elements.confirmOkBtn.removeEventListener('click', onConfirm);
            elements.confirmCancelBtn.removeEventListener('click', onCancel);
            elements.confirmModal.removeEventListener('click', onOverlayClick);
            document.removeEventListener('keydown', onKeyDown);
        };

        const onConfirm = () => {
            cleanUp();
            resolve(true);
        };

        const onCancel = () => {
            cleanUp();
            resolve(false);
        };

        const onOverlayClick = (event) => {
            if (event.target === elements.confirmModal) {
                onCancel();
            }
        };

        const onKeyDown = (event) => {
            if (event.key === 'Escape') {
                onCancel();
            }
        };

        elements.confirmOkBtn.addEventListener('click', onConfirm);
        elements.confirmCancelBtn.addEventListener('click', onCancel);
        elements.confirmModal.addEventListener('click', onOverlayClick);
        document.addEventListener('keydown', onKeyDown);
    });
}

function drawCard() {
    const filtered = filterCards(cards, state.currentCategory, state.currentLevel);
    if (!filtered.length) {
        showToast('当前筛选条件下没有可用卡牌，请调整筛选后重试。', 'error');
        return;
    }

    state.currentCard = drawRandomCard(filtered);
    refreshCardView();
    elements.cardContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function openSaveModal() {
    if (!state.currentCard) return;
    elements.saveModalQuestion.textContent = state.currentCard.question;
    elements.answerInput.value = '';
    elements.saveModal.classList.add('active');
    elements.answerInput.focus();
}

function closeSaveModal() {
    elements.saveModal.classList.remove('active');
}

function saveAnswer() {
    if (!state.currentCard) return;

    const answer = elements.answerInput.value.trim();
    if (!answer) {
        showToast('请先输入你的回答。', 'error');
        return;
    }

    const historyItem = {
        id: Date.now(),
        timestamp: new Date().toLocaleString('zh-CN'),
        card: state.currentCard,
        answer
    };

    state.history.unshift(historyItem);
    if (!saveHistory(state.history)) {
        showToast('保存失败，请检查浏览器存储权限。', 'error');
        return;
    }

    refreshHistoryView();
    closeSaveModal();
    showToast('回答已保存。', 'success');
}

function openShareModal() {
    if (!state.currentCard) return;

    elements.shareQuestion.textContent = state.currentCard.question;
    const answer = getSavedAnswerForCurrentCard() || '（点击“保存回答”后可展示你的回答）';
    elements.shareAnswer.textContent = answer;
    elements.shareModal.classList.add('active');
}

function closeShareModal() {
    elements.shareModal.classList.remove('active');
}

function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    let ok = false;
    try {
        ok = document.execCommand('copy');
    } catch {
        ok = false;
    }

    document.body.removeChild(textarea);
    return ok;
}

async function copyShareLink() {
    if (!state.currentCard) return;

    const text = `心语卡牌\n\n${state.currentCard.question}\n\n来自心语卡牌`;

    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            showToast('已复制到剪贴板。', 'success');
            return;
        }

        if (fallbackCopy(text)) {
            showToast('已复制到剪贴板。', 'success');
            return;
        }

        showToast('复制失败，请手动复制。', 'error');
    } catch {
        if (fallbackCopy(text)) {
            showToast('已复制到剪贴板。', 'success');
            return;
        }
        showToast('复制失败，请手动复制。', 'error');
    }
}

async function clearHistory() {
    const confirmed = await showConfirm('确定要清空所有历史记录吗？此操作不可恢复。');
    if (!confirmed) return;

    state.history = [];
    clearHistoryStore();
    refreshHistoryView();
    showToast('历史记录已清空。', 'success');
}

function setActiveFilterButton(container, target) {
    if (!target.classList.contains('filter-btn')) return;
    container.querySelectorAll('.filter-btn').forEach((btn) => btn.classList.remove('active'));
    target.classList.add('active');
}

function setupEventListeners() {
    elements.drawBtn.addEventListener('click', drawCard);
    elements.saveBtn.addEventListener('click', openSaveModal);
    elements.shareBtn.addEventListener('click', openShareModal);
    elements.confirmSaveBtn.addEventListener('click', saveAnswer);
    elements.cancelSaveBtn.addEventListener('click', closeSaveModal);
    elements.closeShareBtn.addEventListener('click', closeShareModal);
    elements.copyShareBtn.addEventListener('click', copyShareLink);
    elements.clearHistoryBtn.addEventListener('click', clearHistory);
    elements.themeSelector.addEventListener('click', (event) => {
        const button = event.target.closest('[data-theme-choice]');
        if (!button) return;
        setTheme(button.dataset.themeChoice);
    });

    elements.categoryFilters.addEventListener('click', (event) => {
        setActiveFilterButton(elements.categoryFilters, event.target);
        if (event.target.dataset.category) {
            state.currentCategory = event.target.dataset.category;
        }
    });

    elements.levelFilters.addEventListener('click', (event) => {
        setActiveFilterButton(elements.levelFilters, event.target);
        if (event.target.dataset.level) {
            state.currentLevel = event.target.dataset.level;
        }
    });

    elements.saveModal.addEventListener('click', (event) => {
        if (event.target === elements.saveModal) closeSaveModal();
    });

    elements.shareModal.addEventListener('click', (event) => {
        if (event.target === elements.shareModal) closeShareModal();
    });
}

function init() {
    applyTheme(getStoredTheme());
    refreshCardView();
    refreshHistoryView();
    setupEventListeners();
}

init();
