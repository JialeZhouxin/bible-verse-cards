/**
 * 统计计算模块
 * 提供历史数据的统计分析和报告生成功能
 */

const CATEGORY_NAMES = {
    couple: '情侣',
    friend: '朋友',
    family: '家庭',
    self: '自我',
    clear_thinking: '清晰思考'
};

const LEVEL_NAMES = {
    1: '一级',
    2: '二级',
    3: '三级'
};

/**
 * 解析历史记录时间戳为 Date 对象
 * @param {string} timestamp - 本地时间字符串 (zh-CN 格式)
 * @returns {Date}
 */
function parseTimestamp(timestamp) {
    return new Date(timestamp);
}

/**
 * 获取日期字符串 (YYYY-MM-DD)
 * @param {Date} date
 * @returns {string}
 */
function getDateString(date) {
    return date.toISOString().split('T')[0];
}

/**
 * 计算基础统计数据
 * @param {Array} history - 历史记录数组
 * @returns {Object}
 */
export function calculateBasicStats(history) {
    if (!history || history.length === 0) {
        return {
            totalCount: 0,
            todayCount: 0,
            weekCount: 0,
            monthCount: 0
        };
    }

    const now = new Date();
    const today = getDateString(now);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    let todayCount = 0;
    let weekCount = 0;
    let monthCount = 0;

    history.forEach(item => {
        const itemDate = parseTimestamp(item.timestamp);
        const itemDateStr = getDateString(itemDate);

        if (itemDateStr === today) {
            todayCount++;
        }
        if (itemDate >= weekAgo) {
            weekCount++;
        }
        if (itemDate >= monthAgo) {
            monthCount++;
        }
    });

    return {
        totalCount: history.length,
        todayCount,
        weekCount,
        monthCount
    };
}

/**
 * 计算类别分布
 * @param {Array} history - 历史记录数组
 * @returns {Array} - 饼图数据格式 [{name, value, color}]
 */
export function calculateCategoryDistribution(history) {
    if (!history || history.length === 0) {
        return [];
    }

    const counts = {};
    history.forEach(item => {
        const cat = item.card?.category || 'unknown';
        counts[cat] = (counts[cat] || 0) + 1;
    });

    const colors = {
        couple: '#c2185b',
        friend: '#1976d2',
        family: '#f57c00',
        self: '#7b1fa2',
        clear_thinking: '#388e3c'
    };

    return Object.entries(counts).map(([category, count]) => ({
        name: CATEGORY_NAMES[category] || category,
        value: count,
        color: colors[category] || '#999',
        category
    })).sort((a, b) => b.value - a.value);
}

/**
 * 计算难度分布
 * @param {Array} history - 历史记录数组
 * @returns {Array} - 柱状图数据
 */
export function calculateLevelDistribution(history) {
    if (!history || history.length === 0) {
        return [];
    }

    const counts = { 1: 0, 2: 0, 3: 0 };
    history.forEach(item => {
        const level = item.card?.level;
        if (level && counts[level] !== undefined) {
            counts[level]++;
        }
    });

    return [
        { name: '一级', value: counts[1], level: 1 },
        { name: '二级', value: counts[2], level: 2 },
        { name: '三级', value: counts[3], level: 3 }
    ];
}

/**
 * 计算每日活跃度（最近 N 天）
 * @param {Array} history - 历史记录数组
 * @param {number} days - 天数
 * @returns {Array}
 */
export function calculateDailyActivity(history, days = 7) {
    if (!history || history.length === 0) {
        return [];
    }

    const result = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = getDateString(date);
        const dayName = i === 0 ? '今天' : i === 1 ? '昨天' : `${date.getMonth() + 1}/${date.getDate()}`;

        const count = history.filter(item => {
            const itemDate = getDateString(parseTimestamp(item.timestamp));
            return itemDate === dateStr;
        }).length;

        result.push({
            date: dateStr,
            dayName,
            count,
            isToday: i === 0
        });
    }

    return result;
}

/**
 * 判断报告类型
 * @param {Array} history - 历史记录数组
 * @returns {Object} - { type: 'relationship'|'growth'|'mixed', name: string }
 */
export function determineReportType(history) {
    if (!history || history.length === 0) {
        return { type: 'mixed', name: '综合报告' };
    }

    const relationshipCats = ['couple', 'friend', 'family'];
    const growthCats = ['self', 'clear_thinking'];

    let relCount = 0;
    let growthCount = 0;

    history.forEach(item => {
        const cat = item.card?.category;
        if (relationshipCats.includes(cat)) {
            relCount++;
        } else if (growthCats.includes(cat)) {
            growthCount++;
        }
    });

    if (relCount > growthCount * 1.5) {
        return { type: 'relationship', name: '关系报告' };
    } else if (growthCount > relCount * 1.5) {
        return { type: 'growth', name: '自我成长报告' };
    } else {
        return { type: 'mixed', name: '综合报告' };
    }
}

/**
 * 生成报告洞察文字
 * @param {Array} history - 历史记录数组
 * @param {Object} stats - 统计数据
 * @returns {Array<string>}
 */
export function generateInsights(history, stats) {
    if (!history || history.length === 0) {
        return ['开始回答卡牌，生成你的专属报告吧！'];
    }

    const insights = [];
    const catDist = calculateCategoryDistribution(history);
    const levelDist = calculateLevelDistribution(history);
    const reportType = determineReportType(history);

    // 基础统计洞察
    if (stats.totalCount < 10) {
        insights.push(`你已回答 ${stats.totalCount} 张卡牌，继续保持！`);
    } else if (stats.totalCount < 50) {
        insights.push(`很棒！你已积累 ${stats.totalCount} 条回答，探索之旅渐入佳境。`);
    } else {
        insights.push(`太厉害了！你已完成 ${stats.totalCount} 张卡牌的深度思考。`);
    }

    // 类别洞察
    if (catDist.length > 0) {
        const topCat = catDist[0];
        const percentage = Math.round((topCat.value / stats.totalCount) * 100);
        insights.push(`你在「${topCat.name}」类问题上最活跃，占比 ${percentage}%。`);
    }

    // 难度洞察
    const level3Count = levelDist.find(l => l.level === 3)?.value || 0;
    if (level3Count > 0) {
        const level3Percentage = Math.round((level3Count / stats.totalCount) * 100);
        if (level3Percentage > 30) {
            insights.push(`你勇于挑战深度问题，三级难度卡牌占比 ${level3Percentage}%。`);
        }
    }

    // 活跃度洞察
    if (stats.weekCount >= 5) {
        insights.push('本周非常活跃，保持这种探索节奏！');
    } else if (stats.todayCount > 0) {
        insights.push('今天也有新的思考，继续加油！');
    }

    // 报告类型特定洞察
    if (reportType.type === 'relationship') {
        insights.push('你的探索重心在关系领域，这对深化人际连接很有帮助。');
    } else if (reportType.type === 'growth') {
        insights.push('你专注于自我成长，这种向内探索的旅程很有价值。');
    } else {
        insights.push('你在关系与自我成长之间保持平衡，这种全面的探索很难得。');
    }

    return insights;
}

/**
 * 生成完整报告数据
 * @param {Array} history - 历史记录数组
 * @param {number} streakDays - 连续打卡天数
 * @returns {Object}
 */
export function generateFullReport(history, streakDays = 0) {
    const basicStats = calculateBasicStats(history);
    const categoryDist = calculateCategoryDistribution(history);
    const levelDist = calculateLevelDistribution(history);
    const dailyActivity = calculateDailyActivity(history, 7);
    const reportType = determineReportType(history);
    const insights = generateInsights(history, basicStats);

    return {
        type: reportType,
        stats: {
            ...basicStats,
            streakDays
        },
        categoryDistribution: categoryDist,
        levelDistribution: levelDist,
        dailyActivity,
        insights,
        generatedAt: new Date().toLocaleString('zh-CN')
    };
}

export { CATEGORY_NAMES, LEVEL_NAMES };
