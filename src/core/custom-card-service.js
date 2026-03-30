/**
 * 自定义卡牌服务
 * 管理用户创建的自定义卡牌
 */

const CUSTOM_CARDS_KEY = 'heartTalkCustomCards';
const CUSTOM_CARD_VERSION = 1;

/**
 * 自定义卡牌数据结构
 * @typedef {Object} CustomCard
 * @property {number} id - 唯一标识（时间戳）
 * @property {number} level - 深度级别 1|2|3
 * @property {string} category - 类别 couple|friend|family|self|clear_thinking|custom
 * @property {string} question - 问题内容
 * @property {string} createdAt - 创建时间 ISO 字符串
 * @property {string} [updatedAt] - 更新时间 ISO 字符串
 */

/**
 * 从 localStorage 加载自定义卡牌
 * @returns {CustomCard[]} 自定义卡牌数组
 */
export function loadCustomCards() {
    try {
        const raw = localStorage.getItem(CUSTOM_CARDS_KEY);
        if (!raw) return [];

        const data = JSON.parse(raw);

        // 版本检查和迁移
        if (data.version && data.version !== CUSTOM_CARD_VERSION) {
            return migrateCustomCards(data);
        }

        // 新格式：{ version: 1, cards: [...] }
        if (data.cards && Array.isArray(data.cards)) {
            return data.cards;
        }

        // 旧格式：直接是数组
        if (Array.isArray(data)) {
            return data;
        }

        return [];
    } catch (error) {
        console.error('加载自定义卡牌失败:', error);
        return [];
    }
}

/**
 * 保存自定义卡牌到 localStorage
 * @param {CustomCard[]} cards - 自定义卡牌数组
 * @returns {boolean} 是否保存成功
 */
export function saveCustomCards(cards) {
    try {
        const data = {
            version: CUSTOM_CARD_VERSION,
            cards: cards,
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem(CUSTOM_CARDS_KEY, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('保存自定义卡牌失败:', error);
        return false;
    }
}

/**
 * 添加自定义卡牌
 * @param {Omit<CustomCard, 'id' | 'createdAt'>} card - 卡牌数据（不含id和创建时间）
 * @returns {CustomCard|null} 添加成功的卡牌，失败返回null
 */
export function addCustomCard(card) {
    try {
        const cards = loadCustomCards();
        const newCard = {
            ...card,
            id: Date.now(),
            createdAt: new Date().toISOString()
        };

        cards.unshift(newCard);

        if (!saveCustomCards(cards)) {
            return null;
        }

        return newCard;
    } catch (error) {
        console.error('添加自定义卡牌失败:', error);
        return null;
    }
}

/**
 * 更新自定义卡牌
 * @param {number} id - 卡牌ID
 * @param {Partial<CustomCard>} updates - 更新字段
 * @returns {CustomCard|null} 更新后的卡牌，失败返回null
 */
export function updateCustomCard(id, updates) {
    try {
        const cards = loadCustomCards();
        const index = cards.findIndex(c => c.id === id);

        if (index === -1) {
            console.warn(`未找到ID为 ${id} 的自定义卡牌`);
            return null;
        }

        const updatedCard = {
            ...cards[index],
            ...updates,
            id, // 确保ID不变
            updatedAt: new Date().toISOString()
        };

        cards[index] = updatedCard;

        if (!saveCustomCards(cards)) {
            return null;
        }

        return updatedCard;
    } catch (error) {
        console.error('更新自定义卡牌失败:', error);
        return null;
    }
}

/**
 * 删除自定义卡牌
 * @param {number} id - 卡牌ID
 * @returns {boolean} 是否删除成功
 */
export function deleteCustomCard(id) {
    try {
        const cards = loadCustomCards();
        const filtered = cards.filter(c => c.id !== id);

        if (filtered.length === cards.length) {
            console.warn(`未找到ID为 ${id} 的自定义卡牌`);
            return false;
        }

        return saveCustomCards(filtered);
    } catch (error) {
        console.error('删除自定义卡牌失败:', error);
        return false;
    }
}

/**
 * 获取自定义卡牌数量
 * @returns {number} 自定义卡牌总数
 */
export function getCustomCardCount() {
    return loadCustomCards().length;
}

/**
 * 按类别筛选自定义卡牌
 * @param {string} category - 类别
 * @returns {CustomCard[]} 筛选后的卡牌
 */
export function getCustomCardsByCategory(category) {
    const cards = loadCustomCards();
    if (category === 'all' || category === 'custom') {
        return cards;
    }
    return cards.filter(c => c.category === category);
}

/**
 * 按级别筛选自定义卡牌
 * @param {string|number} level - 级别
 * @returns {CustomCard[]} 筛选后的卡牌
 */
export function getCustomCardsByLevel(level) {
    const cards = loadCustomCards();
    if (level === 'all') {
        return cards;
    }
    return cards.filter(c => String(c.level) === String(level));
}

/**
 * 合并官方卡牌和自定义卡牌
 * @param {Array} officialCards - 官方卡牌数组
 * @returns {Array} 合并后的卡牌数组
 */
export function mergeWithOfficialCards(officialCards) {
    const customCards = loadCustomCards();
    return [...officialCards, ...customCards];
}

/**
 * 数据迁移（处理版本升级）
 * @param {Object} oldData - 旧数据
 * @returns {CustomCard[]} 迁移后的卡牌数组
 */
function migrateCustomCards(oldData) {
    // 当前版本是1，未来版本升级时在这里添加迁移逻辑
    if (Array.isArray(oldData)) {
        return oldData;
    }
    return oldData.cards || [];
}

/**
 * 清空所有自定义卡牌
 * @returns {boolean} 是否清空成功
 */
export function clearCustomCards() {
    try {
        localStorage.removeItem(CUSTOM_CARDS_KEY);
        return true;
    } catch (error) {
        console.error('清空自定义卡牌失败:', error);
        return false;
    }
}

/**
 * 导出自定义卡牌为JSON
 * @returns {string} JSON字符串
 */
export function exportCustomCardsToJSON() {
    const cards = loadCustomCards();
    return JSON.stringify({
        type: 'heart-talk-custom-cards',
        version: CUSTOM_CARD_VERSION,
        exportDate: new Date().toISOString(),
        cards: cards
    }, null, 2);
}

/**
 * 从JSON导入自定义卡牌
 * @param {string} jsonString - JSON字符串
 * @param {boolean} merge - 是否合并（true）还是替换（false）
 * @returns {number} 导入的卡牌数量，失败返回-1
 */
export function importCustomCardsFromJSON(jsonString, merge = true) {
    try {
        const data = JSON.parse(jsonString);

        // 验证数据格式
        if (!data.cards || !Array.isArray(data.cards)) {
            throw new Error('无效的自定义卡牌数据格式');
        }

        const importedCards = data.cards.map(card => ({
            ...card,
            id: Date.now() + Math.floor(Math.random() * 1000), // 重新生成ID避免冲突
            createdAt: card.createdAt || new Date().toISOString()
        }));

        if (merge) {
            const existingCards = loadCustomCards();
            const merged = [...importedCards, ...existingCards];
            if (!saveCustomCards(merged)) {
                return -1;
            }
        } else {
            if (!saveCustomCards(importedCards)) {
                return -1;
            }
        }

        return importedCards.length;
    } catch (error) {
        console.error('导入自定义卡牌失败:', error);
        return -1;
    }
}
