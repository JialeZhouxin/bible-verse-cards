/**
 * 历史记录筛选和导出功能
 */

/**
 * 按日期范围筛选历史记录
 * @param {Array} history - 历史记录数组
 * @param {string} dateFilter - 日期筛选条件: 'all' | 'today' | 'week' | 'month' | 'year'
 * @returns {Array} 筛选后的历史记录
 */
export function filterByDate(history, dateFilter) {
    if (dateFilter === 'all' || !dateFilter) {
        return history;
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return history.filter(item => {
        const itemDate = new Date(item.timestamp);
        
        switch (dateFilter) {
            case 'today':
                return itemDate >= today;
            case 'week': {
                const weekAgo = new Date(today);
                weekAgo.setDate(weekAgo.getDate() - 7);
                return itemDate >= weekAgo;
            }
            case 'month': {
                const monthAgo = new Date(today);
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                return itemDate >= monthAgo;
            }
            case 'year': {
                const yearAgo = new Date(today);
                yearAgo.setFullYear(yearAgo.getFullYear() - 1);
                return itemDate >= yearAgo;
            }
            default:
                return true;
        }
    });
}

/**
 * 按类别筛选历史记录
 * @param {Array} history - 历史记录数组
 * @param {string} categoryFilter - 类别筛选条件: 'all' | 'couple' | 'friend' | 'family' | 'self' | 'clear_thinking'
 * @returns {Array} 筛选后的历史记录
 */
export function filterByCategory(history, categoryFilter) {
    if (categoryFilter === 'all' || !categoryFilter) {
        return history;
    }
    return history.filter(item => item.card.category === categoryFilter);
}

/**
 * 组合筛选（日期 + 类别）
 * @param {Array} history - 历史记录数组
 * @param {Object} filters - 筛选条件 { date: string, category: string }
 * @returns {Array} 筛选后的历史记录
 */
export function filterHistory(history, filters = {}) {
    let result = [...history];
    
    if (filters.date && filters.date !== 'all') {
        result = filterByDate(result, filters.date);
    }
    
    if (filters.category && filters.category !== 'all') {
        result = filterByCategory(result, filters.category);
    }
    
    return result;
}

/**
 * 将历史记录导出为JSON
 * @param {Array} history - 历史记录数组
 * @returns {string} JSON字符串
 */
export function exportToJSON(history) {
    const exportData = {
        exportDate: new Date().toISOString(),
        totalCount: history.length,
        records: history
    };
    return JSON.stringify(exportData, null, 2);
}

/**
 * 下载JSON文件
 * @param {string} jsonString - JSON字符串
 * @param {string} filename - 文件名
 */
export function downloadJSON(jsonString, filename = '心语卡牌历史记录.json') {
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * 生成历史记录统计信息
 * @param {Array} history - 历史记录数组
 * @returns {Object} 统计信息
 */
export function generateHistoryStats(history) {
    const stats = {
        totalCount: history.length,
        byCategory: {},
        byLevel: {},
        byDate: {}
    };

    history.forEach(item => {
        // 按类别统计
        const category = item.card.category;
        stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;

        // 按难度统计
        const level = item.card.level;
        stats.byLevel[level] = (stats.byLevel[level] || 0) + 1;

        // 按日期统计（按月）
        const date = new Date(item.timestamp);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        stats.byDate[monthKey] = (stats.byDate[monthKey] || 0) + 1;
    });

    return stats;
}
