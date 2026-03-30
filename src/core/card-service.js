import { loadCustomCards } from './custom-card-service.js';
import { getActivePackCards } from './card-pack-service.js';

/**
 * 筛选卡牌
 * @param {Array} cards - 卡牌数组
 * @param {string} category - 类别筛选
 * @param {string} level - 级别筛选
 * @returns {Array} 筛选后的卡牌数组
 */
export function filterCards(cards, category, level) {
    return cards.filter((card) => {
        const categoryMatched = category === 'all' || card.category === category;
        const levelMatched = level === 'all' || String(card.level) === String(level);
        return categoryMatched && levelMatched;
    });
}

/**
 * 随机抽取一张卡牌
 * @param {Array} cards - 卡牌数组
 * @returns {Object|null} 随机选中的卡牌
 */
export function drawRandomCard(cards) {
    if (!cards.length) return null;
    const index = Math.floor(Math.random() * cards.length);
    return cards[index];
}

/**
 * 获取完整的卡牌池（官方 + 自定义 + 激活的卡牌包）
 * @param {Array} officialCards - 官方卡牌数组
 * @returns {Array} 完整的卡牌池
 */
export function getFullCardPool(officialCards) {
    const customCards = loadCustomCards();
    const activePackCards = getActivePackCards();

    let pool = [...officialCards];

    // 添加自定义卡牌
    if (customCards && customCards.length > 0) {
        pool = [...pool, ...customCards];
    }

    // 如果有激活的卡牌包，使用卡牌包的卡牌（替代默认卡牌）
    if (activePackCards && activePackCards.length > 0) {
        // 卡牌包模式：只使用卡牌包中的卡牌
        pool = activePackCards;
    }

    return pool;
}

/**
 * 带权重的随机抽取（可用于特殊需求）
 * @param {Array} cards - 卡牌数组
 * @param {Function} weightFn - 权重计算函数
 * @returns {Object|null} 选中的卡牌
 */
export function drawWeightedCard(cards, weightFn) {
    if (!cards.length) return null;

    const weights = cards.map(weightFn);
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);

    let random = Math.random() * totalWeight;

    for (let i = 0; i < cards.length; i++) {
        random -= weights[i];
        if (random <= 0) {
            return cards[i];
        }
    }

    return cards[cards.length - 1];
}

/**
 * 获取卡牌统计信息
 * @param {Array} officialCards - 官方卡牌数组
 * @returns {Object} 统计信息
 */
export function getCardPoolStats(officialCards) {
    const customCards = loadCustomCards();
    const activePackCards = getActivePackCards();

    return {
        officialCount: officialCards.length,
        customCount: customCards.length,
        activePackCount: activePackCards ? activePackCards.length : 0,
        totalCount: activePackCards
            ? activePackCards.length
            : officialCards.length + customCards.length,
        hasActivePack: !!activePackCards,
        categories: [...new Set([...officialCards, ...customCards].map(c => c.category))]
    };
}
