/**
 * 每日推荐服务
 * 基于日期生成确定性的每日卡牌推荐
 */

import { drawRandomCard } from './card-service.js';

const DAILY_CARD_KEY = 'heartTalkDailyCard';
const DAILY_CARD_VERSION = 1;

/**
 * 每日卡牌数据结构
 * @typedef {Object} DailyCardRecord
 * @property {string} date - 日期字符串 YYYY-MM-DD
 * @property {number} cardId - 卡牌ID
 * @property {boolean} isAnswered - 是否已回答
 * @property {string} [answeredAt] - 回答时间
 */

/**
 * 基于日期生成确定性随机数（Mulberry32算法）
 * @param {string} dateStr - 日期字符串 YYYY-MM-DD
 * @returns {number} 0-1之间的随机数
 */
function seededRandom(dateStr) {
    // FNV-1a 哈希算法生成种子
    let seed = 2166136261;
    for (let i = 0; i < dateStr.length; i++) {
        seed ^= dateStr.charCodeAt(i);
        seed = Math.imul(seed, 16777619);
    }
    seed = seed >>> 0;

    // Mulberry32 算法
    return function() {
        let t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/**
 * 获取今日日期字符串
 * @returns {string} YYYY-MM-DD
 */
function getTodayString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * 从 localStorage 加载每日卡牌记录
 * @returns {Object} 每日卡牌数据
 */
function loadDailyCardData() {
    try {
        const raw = localStorage.getItem(DAILY_CARD_KEY);
        if (!raw) {
            return { version: DAILY_CARD_VERSION, records: {} };
        }

        const data = JSON.parse(raw);

        // 版本检查
        if (data.version && data.version !== DAILY_CARD_VERSION) {
            return migrateDailyCardData(data);
        }

        return data;
    } catch (error) {
        console.error('加载每日卡牌数据失败:', error);
        return { version: DAILY_CARD_VERSION, records: {} };
    }
}

/**
 * 保存每日卡牌记录到 localStorage
 * @param {Object} data - 每日卡牌数据
 * @returns {boolean} 是否保存成功
 */
function saveDailyCardData(data) {
    try {
        localStorage.setItem(DAILY_CARD_KEY, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('保存每日卡牌数据失败:', error);
        return false;
    }
}

/**
 * 获取今日卡牌
 * @param {Array} cards - 可用卡牌池
 * @returns {Object|null} 今日卡牌，失败返回null
 */
export function getTodayCard(cards) {
    if (!cards || cards.length === 0) {
        return null;
    }

    const today = getTodayString();
    const data = loadDailyCardData();

    // 检查今天是否已有记录
    if (data.records[today]) {
        const cardId = data.records[today].cardId;
        const card = cards.find(c => c.id === cardId);
        if (card) {
            return {
                ...card,
                isDailyCard: true,
                isAnswered: data.records[today].isAnswered
            };
        }
    }

    // 生成新的今日卡牌
    const random = seededRandom(today);
    const index = Math.floor(random() * cards.length);
    const selectedCard = cards[index];

    // 保存记录
    data.records[today] = {
        date: today,
        cardId: selectedCard.id,
        isAnswered: false
    };

    // 清理旧记录（保留最近30天）
    cleanupOldRecords(data);

    saveDailyCardData(data);

    return {
        ...selectedCard,
        isDailyCard: true,
        isAnswered: false
    };
}

/**
 * 标记今日卡牌已回答
 * @returns {boolean} 是否标记成功
 */
export function markTodayCardAnswered() {
    const today = getTodayString();
    const data = loadDailyCardData();

    if (data.records[today]) {
        data.records[today].isAnswered = true;
        data.records[today].answeredAt = new Date().toISOString();
        return saveDailyCardData(data);
    }

    return false;
}

/**
 * 检查今日卡牌是否已回答
 * @returns {boolean}
 */
export function isTodayCardAnswered() {
    const today = getTodayString();
    const data = loadDailyCardData();

    return data.records[today]?.isAnswered || false;
}

/**
 * 获取今日卡牌ID
 * @returns {number|null}
 */
export function getTodayCardId() {
    const today = getTodayString();
    const data = loadDailyCardData();

    return data.records[today]?.cardId || null;
}

/**
 * 检查是否应该显示今日卡牌
 * @returns {boolean}
 */
export function shouldShowDailyCard() {
    const today = getTodayString();
    const data = loadDailyCardData();

    // 如果今天没有记录，或者今天的卡牌未回答，则显示
    return !data.records[today] || !data.records[today].isAnswered;
}

/**
 * 获取今日卡牌状态
 * @returns {Object} 状态对象
 */
export function getDailyCardStatus() {
    const today = getTodayString();
    const data = loadDailyCardData();
    const record = data.records[today];

    return {
        hasTodayCard: !!record,
        isAnswered: record?.isAnswered || false,
        cardId: record?.cardId || null,
        answeredAt: record?.answeredAt || null
    };
}

/**
 * 获取连续打卡天数
 * @returns {number} 连续天数
 */
export function getDailyCardStreak() {
    const data = loadDailyCardData();
    const records = data.records;

    if (!records || Object.keys(records).length === 0) {
        return 0;
    }

    const today = new Date();
    let streak = 0;
    let checkDate = new Date(today);

    // 检查今天是否已回答
    const todayStr = getTodayString();
    if (records[todayStr]?.isAnswered) {
        streak = 1;
        checkDate.setDate(checkDate.getDate() - 1);
    } else {
        // 今天未回答，从昨天开始检查
        checkDate.setDate(checkDate.getDate() - 1);
    }

    // 向前检查连续天数
    while (true) {
        const year = checkDate.getFullYear();
        const month = String(checkDate.getMonth() + 1).padStart(2, '0');
        const day = String(checkDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        if (records[dateStr]?.isAnswered) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }

    return streak;
}

/**
 * 获取最近7天的打卡状态
 * @returns {Array} 最近7天的状态数组
 */
export function getRecentDailyStatus(days = 7) {
    const data = loadDailyCardData();
    const result = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);

        const year = checkDate.getFullYear();
        const month = String(checkDate.getMonth() + 1).padStart(2, '0');
        const day = String(checkDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        const record = data.records[dateStr];
        result.push({
            date: dateStr,
            dayOfWeek: checkDate.getDay(),
            isToday: i === 0,
            hasCard: !!record,
            isAnswered: record?.isAnswered || false
        });
    }

    return result;
}

/**
 * 清理旧记录（保留最近30天）
 * @param {Object} data - 每日卡牌数据
 */
function cleanupOldRecords(data) {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const cutoffStr = `${thirtyDaysAgo.getFullYear()}-${String(thirtyDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(thirtyDaysAgo.getDate()).padStart(2, '0')}`;

    Object.keys(data.records).forEach(dateStr => {
        if (dateStr < cutoffStr) {
            delete data.records[dateStr];
        }
    });
}

/**
 * 数据迁移
 * @param {Object} oldData - 旧数据
 * @returns {Object} 迁移后的数据
 */
function migrateDailyCardData(oldData) {
    // 当前版本是1，未来升级时添加迁移逻辑
    if (oldData.records) {
        return oldData;
    }

    // 旧格式直接是对象
    return {
        version: DAILY_CARD_VERSION,
        records: oldData
    };
}

/**
 * 清除所有每日卡牌记录
 * @returns {boolean}
 */
export function clearDailyCardRecords() {
    try {
        localStorage.removeItem(DAILY_CARD_KEY);
        return true;
    } catch (error) {
        console.error('清除每日卡牌记录失败:', error);
        return false;
    }
}

/**
 * 获取每日卡牌统计
 * @returns {Object} 统计信息
 */
export function getDailyCardStats() {
    const data = loadDailyCardData();
    const records = Object.values(data.records);

    return {
        totalDays: records.length,
        answeredDays: records.filter(r => r.isAnswered).length,
        currentStreak: getDailyCardStreak(),
        completionRate: records.length > 0
            ? Math.round((records.filter(r => r.isAnswered).length / records.length) * 100)
            : 0
    };
}
