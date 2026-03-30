/**
 * 卡牌包服务
 * 管理主题卡牌包的导入、导出和存储
 */

const CARD_PACKS_KEY = 'heartTalkCardPacks';
const ACTIVE_PACK_KEY = 'heartTalkActivePack';
const CARD_PACK_VERSION = 1;

/**
 * 卡牌包数据结构
 * @typedef {Object} CardPack
 * @property {string} id - 唯一标识（UUID或时间戳字符串）
 * @property {string} name - 卡牌包名称
 * @property {string} description - 描述
 * @property {string[]} tags - 标签数组（如["初次约会", "深夜谈心"]）
 * @property {Array} cards - 卡牌数组
 * @property {boolean} isBuiltIn - 是否内置卡牌包
 * @property {string} createdAt - 创建时间
 * @property {string} [icon] - 图标emoji
 */

// 内置卡牌包数据
export const BUILT_IN_PACKS = [
    {
        id: 'builtin-first-date',
        name: '初次约会',
        description: '轻松破冰，开启第一次对话',
        tags: ['约会', '破冰', '轻松'],
        icon: '💕',
        isBuiltIn: true,
        cards: [
            { id: 'fd-1', level: 1, category: 'couple', question: '如果可以瞬间学会一项技能，你想学什么？' },
            { id: 'fd-2', level: 1, category: 'couple', question: '你平时周末最喜欢怎么度过？' },
            { id: 'fd-3', level: 1, category: 'couple', question: '最近有什么让你开心的小事吗？' },
            { id: 'fd-4', level: 1, category: 'couple', question: '你最喜欢的电影类型是什么？为什么？' },
            { id: 'fd-5', level: 1, category: 'couple', question: '如果可以去世界上任何一个地方旅行，你最想去哪里？' },
            { id: 'fd-6', level: 1, category: 'couple', question: '你小时候的梦想是什么？' },
            { id: 'fd-7', level: 1, category: 'couple', question: '你最喜欢的季节是哪个？为什么？' },
            { id: 'fd-8', level: 1, category: 'couple', question: '有什么美食是你特别喜欢的吗？' }
        ]
    },
    {
        id: 'builtin-late-night',
        name: '深夜谈心',
        description: '深度交流，走进彼此内心',
        tags: ['深度', '情感', '深夜'],
        icon: '🌙',
        isBuiltIn: true,
        cards: [
            { id: 'ln-1', level: 2, category: 'couple', question: '你觉得自己最大的优点和缺点分别是什么？' },
            { id: 'ln-2', level: 2, category: 'couple', question: '过去的一年里，你觉得自己成长最多的是哪方面？' },
            { id: 'ln-3', level: 2, category: 'couple', question: '有什么事情是你一直想做但还没开始的？' },
            { id: 'ln-4', level: 2, category: 'couple', question: '你觉得什么是理想的生活状态？' },
            { id: 'ln-5', level: 2, category: 'couple', question: '在你的人生中，谁对你影响最大？为什么？' },
            { id: 'ln-6', level: 3, category: 'couple', question: '你最害怕失去的是什么？' },
            { id: 'ln-7', level: 3, category: 'couple', question: '如果可以回到过去某个时刻，你想回到什么时候？' },
            { id: 'ln-8', level: 2, category: 'couple', question: '你觉得两个人之间最重要的是什么？' }
        ]
    },
    {
        id: 'builtin-family-gathering',
        name: '家庭聚会',
        description: '温馨互动，增进家人感情',
        tags: ['家庭', '温馨', '聚会'],
        icon: '👨‍👩‍👧‍👦',
        isBuiltIn: true,
        cards: [
            { id: 'fg-1', level: 1, category: 'family', question: '家里有什么有趣的传统或习俗吗？' },
            { id: 'fg-2', level: 1, category: 'family', question: '你小时候最喜欢和家人一起做什么？' },
            { id: 'fg-3', level: 1, category: 'family', question: '家里谁做的哪道菜最好吃？' },
            { id: 'fg-4', level: 1, category: 'family', question: '最近家里有什么开心的事情吗？' },
            { id: 'fg-5', level: 2, category: 'family', question: '你觉得家人之间最重要的是什么？' },
            { id: 'fg-6', level: 2, category: 'family', question: '有什么想对家人说但还没说出口的话吗？' },
            { id: 'fg-7', level: 1, category: 'family', question: '如果全家一起旅行，你最想去哪里？' },
            { id: 'fg-8', level: 2, category: 'family', question: '你觉得家庭的意义是什么？' }
        ]
    },
    {
        id: 'builtin-friends-party',
        name: '朋友聚会',
        description: '轻松有趣，加深友谊',
        tags: ['朋友', '轻松', '聚会'],
        icon: '🎉',
        isBuiltIn: true,
        cards: [
            { id: 'fp-1', level: 1, category: 'friend', question: '最近有什么好笑的事情可以分享吗？' },
            { id: 'fp-2', level: 1, category: 'friend', question: '如果可以拥有超能力，你想要什么能力？' },
            { id: 'fp-3', level: 1, category: 'friend', question: '你最近在看什么剧或综艺吗？推荐一下！' },
            { id: 'fp-4', level: 1, category: 'friend', question: '有什么游戏是你特别擅长的？' },
            { id: 'fp-5', level: 2, category: 'friend', question: '你觉得我们认识以来，最难忘的一次经历是什么？' },
            { id: 'fp-6', level: 1, category: 'friend', question: '如果明天是周末，你最想做什么？' },
            { id: 'fp-7', level: 2, category: 'friend', question: '你觉得朋友之间最重要的是什么？' },
            { id: 'fp-8', level: 1, category: 'friend', question: '有什么美食是你最近特别想吃的？' }
        ]
    }
];

/**
 * 从 localStorage 加载用户卡牌包
 * @returns {CardPack[]} 用户卡牌包数组
 */
export function loadUserCardPacks() {
    try {
        const raw = localStorage.getItem(CARD_PACKS_KEY);
        if (!raw) return [];

        const data = JSON.parse(raw);

        if (data.version && data.version !== CARD_PACK_VERSION) {
            return migrateCardPacks(data);
        }

        if (data.packs && Array.isArray(data.packs)) {
            return data.packs;
        }

        if (Array.isArray(data)) {
            return data;
        }

        return [];
    } catch (error) {
        console.error('加载用户卡牌包失败:', error);
        return [];
    }
}

/**
 * 保存用户卡牌包到 localStorage
 * @param {CardPack[]} packs - 卡牌包数组
 * @returns {boolean} 是否保存成功
 */
export function saveUserCardPacks(packs) {
    try {
        const data = {
            version: CARD_PACK_VERSION,
            packs: packs,
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem(CARD_PACKS_KEY, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('保存用户卡牌包失败:', error);
        return false;
    }
}

/**
 * 获取所有可用卡牌包（内置 + 用户导入）
 * @returns {CardPack[]} 所有卡牌包
 */
export function getAllCardPacks() {
    const userPacks = loadUserCardPacks();
    return [...BUILT_IN_PACKS, ...userPacks];
}

/**
 * 导入卡牌包
 * @param {CardPack} packData - 卡牌包数据
 * @returns {CardPack|null} 导入成功的卡牌包，失败返回null
 */
export function importCardPack(packData) {
    try {
        // 验证数据
        if (!packData.name || !packData.cards || !Array.isArray(packData.cards)) {
            console.error('无效的卡牌包数据');
            return null;
        }

        const packs = loadUserCardPacks();

        // 检查是否已存在同名卡牌包
        const existingIndex = packs.findIndex(p => p.name === packData.name);

        const newPack = {
            ...packData,
            id: `user-${Date.now()}`,
            isBuiltIn: false,
            createdAt: new Date().toISOString(),
            // 为导入的卡牌生成新ID，避免冲突
            cards: packData.cards.map((card, index) => ({
                ...card,
                id: `imported-${Date.now()}-${index}`,
                isImported: true
            }))
        };

        if (existingIndex >= 0) {
            // 更新现有卡牌包
            packs[existingIndex] = newPack;
        } else {
            // 添加新卡牌包
            packs.unshift(newPack);
        }

        if (!saveUserCardPacks(packs)) {
            return null;
        }

        return newPack;
    } catch (error) {
        console.error('导入卡牌包失败:', error);
        return null;
    }
}

/**
 * 删除用户卡牌包
 * @param {string} packId - 卡牌包ID
 * @returns {boolean} 是否删除成功
 */
export function deleteCardPack(packId) {
    try {
        // 不能删除内置卡牌包
        const builtInIds = BUILT_IN_PACKS.map(p => p.id);
        if (builtInIds.includes(packId)) {
            console.warn('不能删除内置卡牌包');
            return false;
        }

        const packs = loadUserCardPacks();
        const filtered = packs.filter(p => p.id !== packId);

        if (filtered.length === packs.length) {
            console.warn(`未找到ID为 ${packId} 的卡牌包`);
            return false;
        }

        // 如果删除的是当前激活的卡牌包，清除激活状态
        const activePackId = getActiveCardPack();
        if (activePackId === packId) {
            clearActiveCardPack();
        }

        return saveUserCardPacks(filtered);
    } catch (error) {
        console.error('删除卡牌包失败:', error);
        return false;
    }
}

/**
 * 导出卡牌包为JSON
 * @param {string} packId - 卡牌包ID
 * @returns {string|null} JSON字符串，失败返回null
 */
export function exportCardPackToJSON(packId) {
    const pack = getAllCardPacks().find(p => p.id === packId);
    if (!pack) {
        console.warn(`未找到ID为 ${packId} 的卡牌包`);
        return null;
    }

    return JSON.stringify({
        type: 'heart-talk-card-pack',
        version: CARD_PACK_VERSION,
        exportDate: new Date().toISOString(),
        pack: {
            name: pack.name,
            description: pack.description,
            tags: pack.tags,
            icon: pack.icon,
            cards: pack.cards
        }
    }, null, 2);
}

/**
 * 从JSON文件导入卡牌包
 * @param {string} jsonString - JSON字符串
 * @returns {CardPack|null} 导入的卡牌包，失败返回null
 */
export function importCardPackFromJSON(jsonString) {
    try {
        const data = JSON.parse(jsonString);

        // 验证格式
        if (data.type !== 'heart-talk-card-pack' || !data.pack) {
            throw new Error('无效的卡牌包文件格式');
        }

        return importCardPack(data.pack);
    } catch (error) {
        console.error('从JSON导入卡牌包失败:', error);
        return null;
    }
}

/**
 * 设置当前激活的卡牌包
 * @param {string} packId - 卡牌包ID，null表示使用默认卡牌
 */
export function setActiveCardPack(packId) {
    try {
        if (packId === null) {
            localStorage.removeItem(ACTIVE_PACK_KEY);
        } else {
            localStorage.setItem(ACTIVE_PACK_KEY, packId);
        }
    } catch (error) {
        console.error('设置激活卡牌包失败:', error);
    }
}

/**
 * 获取当前激活的卡牌包ID
 * @returns {string|null} 卡牌包ID，无则返回null
 */
export function getActiveCardPack() {
    try {
        return localStorage.getItem(ACTIVE_PACK_KEY);
    } catch (error) {
        console.error('获取激活卡牌包失败:', error);
        return null;
    }
}

/**
 * 清除激活的卡牌包
 */
export function clearActiveCardPack() {
    try {
        localStorage.removeItem(ACTIVE_PACK_KEY);
    } catch (error) {
        console.error('清除激活卡牌包失败:', error);
    }
}

/**
 * 获取当前激活卡牌包的卡牌
 * @returns {Array|null} 卡牌数组，无激活包则返回null
 */
export function getActivePackCards() {
    const activePackId = getActiveCardPack();
    if (!activePackId) return null;

    const pack = getAllCardPacks().find(p => p.id === activePackId);
    return pack ? pack.cards : null;
}

/**
 * 获取卡牌包统计信息
 * @returns {Object} 统计信息
 */
export function getCardPackStats() {
    const userPacks = loadUserCardPacks();
    const totalCards = userPacks.reduce((sum, pack) => sum + pack.cards.length, 0);

    return {
        builtInCount: BUILT_IN_PACKS.length,
        userPackCount: userPacks.length,
        totalUserCards: totalCards
    };
}

/**
 * 数据迁移
 * @param {Object} oldData - 旧数据
 * @returns {CardPack[]} 迁移后的卡牌包数组
 */
function migrateCardPacks(oldData) {
    if (Array.isArray(oldData)) {
        return oldData;
    }
    return oldData.packs || [];
}

/**
 * 下载卡牌包文件
 * @param {string} packId - 卡牌包ID
 * @returns {boolean} 是否下载成功
 */
export function downloadCardPack(packId) {
    const jsonString = exportCardPackToJSON(packId);
    if (!jsonString) return false;

    const pack = getAllCardPacks().find(p => p.id === packId);
    const filename = `心语卡牌包-${pack.name}-${new Date().toISOString().split('T')[0]}.json`;

    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 100);

    return true;
}
