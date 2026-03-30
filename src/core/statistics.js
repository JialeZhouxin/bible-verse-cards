/**
 * 数据统计模块 - 处理历史记录的数据分析和可视化
 */

// 类别配置
const CATEGORY_CONFIG = {
    couple: { label: '情侣', color: '#c2185b', icon: '💕' },
    friend: { label: '朋友', color: '#1976d2', icon: '🤝' },
    family: { label: '家庭', color: '#f57c00', icon: '🏠' },
    self: { label: '自我', color: '#7b1fa2', icon: '🌟' },
    clear_thinking: { label: '清晰思考', color: '#388e3c', icon: '🧠' }
};

// 关系型类别（用于生成关系报告）
const RELATIONSHIP_CATEGORIES = ['couple', 'friend', 'family'];
// 成长型类别（用于生成自我成长报告）
const GROWTH_CATEGORIES = ['self', 'clear_thinking'];

/**
 * 解析时间戳为 Date 对象
 * @param {string} timestamp - zh-CN 格式的时间戳
 * @returns {Date}
 */
function parseTimestamp(timestamp) {
    // 处理 "2024/3/30 14:30:00" 格式
    return new Date(timestamp.replace(/\//g, '-'));
}

/**
 * 获取日期字符串（用于分组）
 * @param {Date} date
 * @returns {string} YYYY-MM-DD
 */
function getDateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/**
 * 计算类别分布统计
 * @param {Array} history - 历史记录数组
 * @returns {Array} [{ name, value, color, icon }]
 */
export function calculateCategoryStats(history) {
    const stats = {};
    
    // 初始化所有类别为 0
    Object.keys(CATEGORY_CONFIG).forEach(key => {
        stats[key] = 0;
    });
    
    // 统计
    history.forEach(item => {
        if (item.card && item.card.category) {
            stats[item.card.category] = (stats[item.card.category] || 0) + 1;
        }
    });
    
    // 转换为数组格式
    return Object.entries(stats)
        .filter(([_, value]) => value > 0)
        .map(([key, value]) => ({
            name: CATEGORY_CONFIG[key].label,
            value,
            color: CATEGORY_CONFIG[key].color,
            icon: CATEGORY_CONFIG[key].icon,
            key
        }))
        .sort((a, b) => b.value - a.value);
}

/**
 * 计算时间分布统计（最近 N 天）
 * @param {Array} history - 历史记录数组
 * @param {number} days - 天数（7 或 30）
 * @returns {Object} { labels, data, total }
 */
export function calculateTimeStats(history, days = 7) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const labels = [];
    const data = [];
    let total = 0;
    
    // 生成日期标签和数据
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateKey = getDateKey(date);
        
        // 格式化标签（今天显示"今天"，其他显示 "M/D"）
        if (i === 0) {
            labels.push('今天');
        } else if (i === 1) {
            labels.push('昨天');
        } else {
            labels.push(`${date.getMonth() + 1}/${date.getDate()}`);
        }
        
        // 统计该日期的回答数
        const count = history.filter(item => {
            const itemDate = parseTimestamp(item.timestamp);
            return getDateKey(itemDate) === dateKey;
        }).length;
        
        data.push(count);
        total += count;
    }
    
    return { labels, data, total };
}

/**
 * 计算连续打卡天数（Streak）
 * @param {Array} history - 历史记录数组
 * @returns {Object} { currentStreak, longestStreak, streakDates }
 */
export function calculateStreak(history) {
    if (!history.length) {
        return { currentStreak: 0, longestStreak: 0, streakDates: [] };
    }
    
    // 获取所有有记录的日期（去重）
    const datesWithActivity = new Set();
    history.forEach(item => {
        const date = parseTimestamp(item.timestamp);
        datesWithActivity.add(getDateKey(date));
    });
    
    const sortedDates = Array.from(datesWithActivity).sort();
    const today = getDateKey(new Date());
    const yesterday = getDateKey(new Date(Date.now() - 86400000));
    
    // 计算当前连续天数
    let currentStreak = 0;
    const streakDates = [];
    
    // 检查今天或昨天是否有活动
    const hasActivityToday = datesWithActivity.has(today);
    const hasActivityYesterday = datesWithActivity.has(yesterday);
    
    if (hasActivityToday || hasActivityYesterday) {
        // 从今天开始往前数
        let checkDate = hasActivityToday ? new Date() : new Date(Date.now() - 86400000);
        
        while (true) {
            const dateKey = getDateKey(checkDate);
            if (datesWithActivity.has(dateKey)) {
                currentStreak++;
                streakDates.push(dateKey);
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }
    }
    
    // 计算最长连续天数
    let longestStreak = 0;
    let tempStreak = 1;
    
    for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = new Date(sortedDates[i - 1]);
        const currDate = new Date(sortedDates[i]);
        const diffDays = (currDate - prevDate) / (1000 * 60 * 60 * 24);
        
        if (diffDays === 1) {
            tempStreak++;
        } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
        }
    }
    longestStreak = Math.max(longestStreak, tempStreak, currentStreak);
    
    return { currentStreak, longestStreak, streakDates };
}

/**
 * 生成关系报告数据
 * @param {Array} history - 历史记录数组
 * @returns {Object} 报告数据
 */
export function generateRelationshipReport(history) {
    const relationshipHistory = history.filter(item => 
        RELATIONSHIP_CATEGORIES.includes(item.card?.category)
    );
    
    if (!relationshipHistory.length) {
        return null;
    }
    
    const categoryStats = calculateCategoryStats(relationshipHistory);
    const timeStats7 = calculateTimeStats(relationshipHistory, 7);
    const timeStats30 = calculateTimeStats(relationshipHistory, 30);
    const streak = calculateStreak(relationshipHistory);
    
    // 找出最活跃的类别
    const topCategory = categoryStats[0];
    
    // 计算平均每周互动次数
    const totalDays = Math.max(1, timeStats30.total);
    const avgPerWeek = Math.round((timeStats30.total / 30) * 7 * 10) / 10;
    
    // 生成建议
    let suggestion = '';
    if (topCategory.key === 'couple') {
        suggestion = '你们很注重情感交流，继续保持这份用心！';
    } else if (topCategory.key === 'friend') {
        suggestion = '友谊需要经营，你们的互动很温暖。';
    } else if (topCategory.key === 'family') {
        suggestion = '家庭时光很珍贵，多陪伴家人。';
    }
    
    return {
        type: 'relationship',
        title: '关系成长报告',
        subtitle: '记录你与他人的温暖连接',
        total: relationshipHistory.length,
        categoryStats,
        timeStats7,
        timeStats30,
        streak,
        topCategory,
        avgPerWeek,
        suggestion,
        lastActivity: relationshipHistory[0]?.timestamp
    };
}

/**
 * 生成自我成长报告数据
 * @param {Array} history - 历史记录数组
 * @returns {Object} 报告数据
 */
export function generateSelfGrowthReport(history) {
    const growthHistory = history.filter(item => 
        GROWTH_CATEGORIES.includes(item.card?.category)
    );
    
    if (!growthHistory.length) {
        return null;
    }
    
    const categoryStats = calculateCategoryStats(growthHistory);
    const timeStats7 = calculateTimeStats(growthHistory, 7);
    const timeStats30 = calculateTimeStats(growthHistory, 30);
    const streak = calculateStreak(growthHistory);
    
    // 找出最活跃的类别
    const topCategory = categoryStats[0];
    
    // 计算自我反思频率
    const avgPerWeek = Math.round((timeStats30.total / 30) * 7 * 10) / 10;
    
    // 生成建议
    let suggestion = '';
    if (topCategory.key === 'self') {
        suggestion = '你正在认真探索自己，这是成长的开始。';
    } else if (topCategory.key === 'clear_thinking') {
        suggestion = '理性思考让你更清醒，继续保持这份觉察。';
    }
    
    return {
        type: 'self-growth',
        title: '自我成长报告',
        subtitle: '记录你与自己的深度对话',
        total: growthHistory.length,
        categoryStats,
        timeStats7,
        timeStats30,
        streak,
        topCategory,
        avgPerWeek,
        suggestion,
        lastActivity: growthHistory[0]?.timestamp
    };
}

/**
 * 生成完整统计报告
 * @param {Array} history - 历史记录数组
 * @returns {Object} 完整统计数据
 */
export function generateFullStatistics(history) {
    const categoryStats = calculateCategoryStats(history);
    const timeStats7 = calculateTimeStats(history, 7);
    const timeStats30 = calculateTimeStats(history, 30);
    const streak = calculateStreak(history);
    const relationshipReport = generateRelationshipReport(history);
    const selfGrowthReport = generateSelfGrowthReport(history);
    
    return {
        total: history.length,
        categoryStats,
        timeStats7,
        timeStats30,
        streak,
        relationshipReport,
        selfGrowthReport,
        generatedAt: new Date().toLocaleString('zh-CN')
    };
}

/**
 * 获取类别配置
 * @returns {Object}
 */
export function getCategoryConfig() {
    return CATEGORY_CONFIG;
}

/**
 * 获取类别颜色（用于图表）
 * @param {string} category - 类别 key
 * @returns {string} 颜色值
 */
export function getCategoryColor(category) {
    return CATEGORY_CONFIG[category]?.color || '#999';
}

/**
 * 获取类别标签
 * @param {string} category - 类别 key
 * @returns {string} 中文标签
 */
export function getCategoryLabel(category) {
    return CATEGORY_CONFIG[category]?.label || category;
}
