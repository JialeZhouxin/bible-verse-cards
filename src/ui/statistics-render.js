/**
 * 统计图表渲染模块 - 使用 ECharts 渲染数据可视化
 */

import { 
    calculateCategoryStats, 
    calculateTimeStats, 
    calculateStreak,
    generateRelationshipReport,
    generateSelfGrowthReport,
    generateFullStatistics,
    getCategoryConfig
} from '../core/statistics.js';

// 图表实例存储
const chartInstances = new Map();

// ResizeObserver 实例
let resizeObserver = null;

/**
 * 获取主题颜色配置
 * @returns {Object} 颜色配置
 */
function getThemeColors() {
    const root = document.documentElement;
    const styles = getComputedStyle(root);
    
    return {
        textPrimary: styles.getPropertyValue('--text-primary').trim() || '#3d2c1f',
        textSecondary: styles.getPropertyValue('--text-secondary').trim() || '#715740',
        textMuted: styles.getPropertyValue('--text-muted').trim() || '#9a7f67',
        accent: styles.getPropertyValue('--accent').trim() || '#c27a3a',
        paper: styles.getPropertyValue('--paper').trim() || '#fff9f1',
        line: styles.getPropertyValue('--line').trim() || '#e4ccb0'
    };
}

/**
 * 初始化 ResizeObserver
 */
function initResizeObserver() {
    if (resizeObserver) return;
    
    resizeObserver = new ResizeObserver(entries => {
        entries.forEach(entry => {
            const chartId = entry.target.dataset.chartId;
            if (chartId && chartInstances.has(chartId)) {
                const chart = chartInstances.get(chartId);
                chart.resize();
            }
        });
    });
}

/**
 * 注册图表容器
 * @param {HTMLElement} container - 图表容器
 * @param {string} chartId - 图表 ID
 */
function registerChartContainer(container, chartId) {
    container.dataset.chartId = chartId;
    if (resizeObserver) {
        resizeObserver.observe(container);
    }
}

/**
 * 销毁图表
 * @param {string} chartId - 图表 ID
 */
export function disposeChart(chartId) {
    if (chartInstances.has(chartId)) {
        chartInstances.get(chartId).dispose();
        chartInstances.delete(chartId);
    }
}

/**
 * 销毁所有图表
 */
export function disposeAllCharts() {
    chartInstances.forEach(chart => chart.dispose());
    chartInstances.clear();
    if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
    }
}

/**
 * 渲染饼图 - 类别分布
 * @param {HTMLElement} container - 容器元素
 * @param {Array} data - 统计数据 [{ name, value, color }]
 * @param {string} chartId - 图表 ID
 */
export function renderCategoryPieChart(container, data, chartId = 'categoryPie') {
    if (!container || !window.echarts) return;
    
    initResizeObserver();
    registerChartContainer(container, chartId);
    
    // 销毁旧实例
    disposeChart(chartId);
    
    const theme = getThemeColors();
    const isMobile = window.innerWidth < 600;
    
    const chart = window.echarts.init(container);
    chartInstances.set(chartId, chart);
    
    const option = {
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'item',
            formatter: '{b}: {c} ({d}%)',
            backgroundColor: theme.paper,
            borderColor: theme.line,
            textStyle: {
                color: theme.textPrimary
            }
        },
        legend: {
            orient: isMobile ? 'horizontal' : 'vertical',
            left: isMobile ? 'center' : 'right',
            top: isMobile ? 'bottom' : 'center',
            itemWidth: 12,
            itemHeight: 12,
            textStyle: {
                color: theme.textSecondary,
                fontSize: isMobile ? 11 : 12
            },
            itemGap: isMobile ? 8 : 16
        },
        series: [{
            name: '类别分布',
            type: 'pie',
            radius: isMobile ? ['35%', '55%'] : ['40%', '65%'],
            center: isMobile ? ['50%', '45%'] : ['40%', '50%'],
            avoidLabelOverlap: true,
            itemStyle: {
                borderRadius: 8,
                borderColor: theme.paper,
                borderWidth: 2
            },
            label: {
                show: !isMobile,
                formatter: '{b}\n{c}次',
                color: theme.textSecondary,
                fontSize: 12
            },
            labelLine: {
                show: !isMobile,
                length: 10,
                length2: 10
            },
            emphasis: {
                label: {
                    show: true,
                    fontSize: 14,
                    fontWeight: 'bold'
                },
                itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.2)'
                }
            },
            data: data.map(item => ({
                name: item.name,
                value: item.value,
                itemStyle: { color: item.color }
            }))
        }]
    };
    
    chart.setOption(option);
    return chart;
}

/**
 * 渲染柱状图 - 时间分布
 * @param {HTMLElement} container - 容器元素
 * @param {Object} timeStats - 时间统计数据 { labels, data }
 * @param {string} chartId - 图表 ID
 */
export function renderTimeBarChart(container, timeStats, chartId = 'timeBar') {
    if (!container || !window.echarts) return;
    
    initResizeObserver();
    registerChartContainer(container, chartId);
    
    disposeChart(chartId);
    
    const theme = getThemeColors();
    const isMobile = window.innerWidth < 600;
    
    const chart = window.echarts.init(container);
    chartInstances.set(chartId, chart);
    
    const option = {
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            },
            formatter: '{b}: {c}次',
            backgroundColor: theme.paper,
            borderColor: theme.line,
            textStyle: {
                color: theme.textPrimary
            }
        },
        grid: {
            left: isMobile ? '3%' : '5%',
            right: isMobile ? '3%' : '5%',
            bottom: isMobile ? '15%' : '10%',
            top: '10%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: timeStats.labels,
            axisLine: {
                lineStyle: {
                    color: theme.line
                }
            },
            axisLabel: {
                color: theme.textMuted,
                fontSize: isMobile ? 10 : 11,
                rotate: isMobile && timeStats.labels.length > 10 ? 45 : 0
            },
            axisTick: {
                show: false
            }
        },
        yAxis: {
            type: 'value',
            minInterval: 1,
            axisLine: {
                show: false
            },
            axisLabel: {
                color: theme.textMuted,
                fontSize: 11
            },
            splitLine: {
                lineStyle: {
                    color: theme.line,
                    type: 'dashed',
                    opacity: 0.5
                }
            }
        },
        series: [{
            name: '回答次数',
            type: 'bar',
            data: timeStats.data,
            barWidth: isMobile ? '60%' : '50%',
            itemStyle: {
                color: new window.echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: theme.accent },
                    { offset: 1, color: theme.accent + '80' }
                ]),
                borderRadius: [4, 4, 0, 0]
            },
            emphasis: {
                itemStyle: {
                    color: theme.accent
                }
            }
        }]
    };
    
    chart.setOption(option);
    return chart;
}

/**
 * 渲染连续打卡组件
 * @param {HTMLElement} container - 容器元素
 * @param {Object} streakData - 打卡数据 { currentStreak, longestStreak }
 */
export function renderStreakComponent(container, streakData) {
    if (!container) return;
    
    const { currentStreak, longestStreak } = streakData;
    const theme = getThemeColors();
    
    const html = `
        <div class="streak-container">
            <div class="streak-item streak-current">
                <div class="streak-icon">🔥</div>
                <div class="streak-number">${currentStreak}</div>
                <div class="streak-label">连续打卡</div>
                <div class="streak-unit">天</div>
            </div>
            <div class="streak-divider"></div>
            <div class="streak-item streak-longest">
                <div class="streak-icon">🏆</div>
                <div class="streak-number">${longestStreak}</div>
                <div class="streak-label">最长记录</div>
                <div class="streak-unit">天</div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

/**
 * 渲染统计概览卡片
 * @param {HTMLElement} container - 容器元素
 * @param {Object} stats - 统计数据
 */
export function renderStatsOverview(container, stats) {
    if (!container) return;
    
    const { total, streak } = stats;
    const categoryCount = stats.categoryStats.length;
    
    const html = `
        <div class="stats-overview">
            <div class="stat-card">
                <div class="stat-icon">📝</div>
                <div class="stat-value">${total}</div>
                <div class="stat-label">总回答数</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">📂</div>
                <div class="stat-value">${categoryCount}</div>
                <div class="stat-label">探索类别</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">🔥</div>
                <div class="stat-value">${streak.currentStreak}</div>
                <div class="stat-label">连续打卡</div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

/**
 * 渲染完整统计面板
 * @param {HTMLElement} container - 容器元素
 * @param {Array} history - 历史记录
 */
export function renderStatisticsPanel(container, history) {
    if (!container || !history.length) {
        if (container) {
            container.innerHTML = `
                <div class="stats-empty-state">
                    <div class="stats-empty-icon">📊</div>
                    <p>还没有足够的记录来生成统计</p>
                    <p class="stats-empty-hint">开始回答问题后，这里会显示你的数据分析</p>
                </div>
            `;
        }
        return;
    }
    
    const stats = generateFullStatistics(history);
    
    container.innerHTML = `
        <div class="statistics-panel">
            <div class="stats-section">
                <h4 class="stats-section-title">📊 数据概览</h4>
                <div id="statsOverviewContainer"></div>
            </div>
            
            <div class="stats-section">
                <h4 class="stats-section-title">🔥 打卡记录</h4>
                <div id="streakContainer"></div>
            </div>
            
            <div class="stats-section">
                <h4 class="stats-section-title">📈 类别分布</h4>
                <div id="categoryChartContainer" class="chart-container"></div>
            </div>
            
            <div class="stats-section">
                <h4 class="stats-section-title">📅 最近7天</h4>
                <div id="timeChart7Container" class="chart-container"></div>
            </div>
            
            <div class="stats-section">
                <h4 class="stats-section-title">📅 最近30天</h4>
                <div id="timeChart30Container" class="chart-container"></div>
            </div>
        </div>
    `;
    
    // 渲染各个组件
    renderStatsOverview(
        container.querySelector('#statsOverviewContainer'),
        stats
    );
    
    renderStreakComponent(
        container.querySelector('#streakContainer'),
        stats.streak
    );
    
    // 渲染图表（需要 DOM 已插入）
    setTimeout(() => {
        const categoryContainer = container.querySelector('#categoryChartContainer');
        if (categoryContainer && stats.categoryStats.length) {
            renderCategoryPieChart(categoryContainer, stats.categoryStats, 'categoryPie');
        }
        
        const time7Container = container.querySelector('#timeChart7Container');
        if (time7Container) {
            renderTimeBarChart(time7Container, stats.timeStats7, 'timeBar7');
        }
        
        const time30Container = container.querySelector('#timeChart30Container');
        if (time30Container) {
            renderTimeBarChart(time30Container, stats.timeStats30, 'timeBar30');
        }
    }, 0);
}

/**
 * 渲染报告内容
 * @param {HTMLElement} container - 容器元素
 * @param {Object} report - 报告数据
 */
export function renderReportContent(container, report) {
    if (!container || !report) {
        if (container) {
            container.innerHTML = `
                <div class="report-empty">
                    <div class="report-empty-icon">📋</div>
                    <p>还没有相关记录</p>
                    <p class="report-empty-hint">回答更多问题后生成报告</p>
                </div>
            `;
        }
        return;
    }
    
    const isRelationship = report.type === 'relationship';
    const themeIcon = isRelationship ? '💕' : '🌱';
    const themeColor = isRelationship ? '#c2185b' : '#388e3c';
    
    container.innerHTML = `
        <div class="report-content" data-report-type="${report.type}">
            <div class="report-header" style="--report-theme-color: ${themeColor}">
                <div class="report-icon">${themeIcon}</div>
                <h3 class="report-title">${report.title}</h3>
                <p class="report-subtitle">${report.subtitle}</p>
            </div>
            
            <div class="report-stats-grid">
                <div class="report-stat-item">
                    <div class="report-stat-value">${report.total}</div>
                    <div class="report-stat-label">总记录数</div>
                </div>
                <div class="report-stat-item">
                    <div class="report-stat-value">${report.avgPerWeek}</div>
                    <div class="report-stat-label">每周平均</div>
                </div>
                <div class="report-stat-item">
                    <div class="report-stat-value">${report.streak.currentStreak}</div>
                    <div class="report-stat-label">连续打卡</div>
                </div>
            </div>
            
            <div class="report-highlight">
                <div class="highlight-label">最关注的领域</div>
                <div class="highlight-value" style="color: ${report.topCategory.color}">
                    ${report.topCategory.icon} ${report.topCategory.name}
                </div>
                <div class="highlight-count">${report.topCategory.value} 次记录</div>
            </div>
            
            <div class="report-suggestion">
                <div class="suggestion-icon">💡</div>
                <p class="suggestion-text">${report.suggestion}</p>
            </div>
            
            <div class="report-chart-section">
                <h5>类别分布</h5>
                <div id="reportCategoryChart" class="chart-container"></div>
            </div>
            
            <div class="report-footer">
                <p>生成于 ${report.generatedAt || new Date().toLocaleString('zh-CN')}</p>
            </div>
        </div>
    `;
    
    // 渲染图表
    setTimeout(() => {
        const chartContainer = container.querySelector('#reportCategoryChart');
        if (chartContainer && report.categoryStats.length) {
            renderCategoryPieChart(chartContainer, report.categoryStats, 'reportCategoryPie');
        }
    }, 0);
}

/**
 * 生成报告图片数据（用于下载）
 * @param {HTMLElement} reportElement - 报告元素
 * @returns {Promise<string>} 图片 data URL
 */
export async function generateReportImage(reportElement) {
    if (!reportElement || !window.html2canvas) {
        throw new Error('html2canvas 未加载');
    }
    
    // 等待字体加载
    await document.fonts.ready;
    
    const canvas = await window.html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: getComputedStyle(document.documentElement)
            .getPropertyValue('--paper').trim() || '#fff9f1',
        logging: false
    });
    
    return canvas.toDataURL('image/png');
}

export {
    calculateCategoryStats,
    calculateTimeStats,
    calculateStreak,
    generateRelationshipReport,
    generateSelfGrowthReport,
    generateFullStatistics
};
