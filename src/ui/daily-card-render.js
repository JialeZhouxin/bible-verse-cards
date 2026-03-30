/**
 * 每日推荐UI渲染模块
 */

import {
    getTodayCard, getDailyCardStatus, getDailyCardStreak,
    getRecentDailyStatus, markTodayCardAnswered
} from '../core/daily-card-service.js';

const CATEGORY_NAMES = {
    couple: '情侣',
    friend: '朋友',
    family: '家庭',
    self: '自我',
    clear_thinking: '清晰思考',
    custom: '自定义'
};

const WEEKDAY_NAMES = ['日', '一', '二', '三', '四', '五', '六'];

/**
 * 渲染每日推荐区域
 * @param {Object} options - 配置选项
 * @param {HTMLElement} options.container - 容器元素
 * @param {Object} options.todayCard - 今日卡牌
 * @param {Function} options.onDraw - 抽取今日卡牌回调
 * @param {Function} options.onAnswer - 回答今日卡牌回调
 */
export function renderDailyCardSection({ container, todayCard, onDraw, onAnswer }) {
    if (!container) return;

    const status = getDailyCardStatus();
    const streak = getDailyCardStreak();
    const recentStatus = getRecentDailyStatus(7);

    container.innerHTML = `
        <div class="daily-card-section">
            <div class="daily-card-header">
                <div class="daily-card-title">
                    <span class="daily-icon">📅</span>
                    <span>今日推荐</span>
                    ${streak > 0 ? `<span class="daily-streak">🔥 ${streak} 天</span>` : ''}
                </div>
                <div class="daily-calendar-mini">
                    ${renderMiniCalendar(recentStatus)}
                </div>
            </div>
            <div class="daily-card-content">
                ${todayCard ? renderTodayCard(todayCard, status) : renderNoCard(onDraw)}
            </div>
        </div>
    `;

    // 绑定事件
    bindDailyCardEvents(container, { onDraw, onAnswer });
}

/**
 * 渲染今日卡牌
 */
function renderTodayCard(card, status) {
    const isAnswered = status.isAnswered;

    return `
        <div class="daily-card-display ${isAnswered ? 'answered' : ''}">
            <div class="daily-card-badge">今日卡牌</div>
            <div class="daily-card-category">${CATEGORY_NAMES[card.category] || card.category}</div>
            <div class="daily-card-question">${escapeHtml(card.question)}</div>
            <div class="daily-card-level">难度: ${card.level}级</div>
            ${isAnswered ? `
                <div class="daily-card-status answered">
                    <span>✓ 已完成今日回答</span>
                </div>
            ` : `
                <div class="daily-card-actions">
                    <button class="btn btn-daily" data-action="draw">抽取这张卡牌</button>
                </div>
            `}
        </div>
    `;
}

/**
 * 渲染无卡牌状态
 */
function renderNoCard(onDraw) {
    return `
        <div class="daily-card-empty">
            <p>今日卡牌尚未抽取</p>
            <button class="btn" data-action="draw">查看今日推荐</button>
        </div>
    `;
}

/**
 * 渲染迷你日历
 */
function renderMiniCalendar(recentStatus) {
    return recentStatus.map(day => {
        let statusClass = '';
        if (day.isToday) statusClass = 'today';
        else if (day.isAnswered) statusClass = 'completed';
        else if (day.hasCard) statusClass = 'missed';

        return `
            <div class="calendar-day ${statusClass}" title="${day.date}">
                <span class="day-label">${WEEKDAY_NAMES[day.dayOfWeek]}</span>
                <span class="day-dot"></span>
            </div>
        `;
    }).join('');
}

/**
 * 渲染每日打卡日历（完整版）
 */
export function renderDailyCalendar({ container, days = 30 }) {
    if (!container) return;

    const recentStatus = getRecentDailyStatus(days);
    const streak = getDailyCardStreak();

    container.innerHTML = `
        <div class="daily-calendar">
            <div class="calendar-header">
                <h5>每日打卡</h5>
                <span class="calendar-streak">连续 ${streak} 天</span>
            </div>
            <div class="calendar-grid">
                ${recentStatus.map(day => {
                    let statusClass = '';
                    let statusText = '';

                    if (day.isToday) {
                        statusClass = 'today';
                        statusText = day.isAnswered ? '已完成' : '今日';
                    } else if (day.isAnswered) {
                        statusClass = 'completed';
                        statusText = '已打卡';
                    } else if (day.hasCard) {
                        statusClass = 'missed';
                        statusText = '未打卡';
                    } else {
                        statusText = '无记录';
                    }

                    return `
                        <div class="calendar-cell ${statusClass}" title="${day.date} - ${statusText}">
                            <span class="cell-date">${day.date.slice(5)}</span>
                            <span class="cell-status"></span>
                        </div>
                    `;
                }).join('')}
            </div>
            <div class="calendar-legend">
                <span class="legend-item"><span class="dot completed"></span> 已打卡</span>
                <span class="legend-item"><span class="dot missed"></span> 未打卡</span>
                <span class="legend-item"><span class="dot today"></span> 今日</span>
            </div>
        </div>
    `;
}

/**
 * 渲染每日推荐模态框
 */
export function renderDailyCardModal({ container, onClose }) {
    if (!container) return;

    const status = getDailyCardStatus();
    const streak = getDailyCardStreak();
    const stats = getDailyCardStats();

    container.innerHTML = `
        <div class="daily-modal-content">
            <div class="daily-modal-header">
                <h3>📅 每日推荐</h3>
                <button class="filter-btn" id="closeDailyModalBtn">关闭</button>
            </div>
            <div class="daily-modal-body">
                <div class="daily-stats">
                    <div class="stat-item">
                        <span class="stat-value">${stats.totalDays}</span>
                        <span class="stat-label">总天数</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${stats.answeredDays}</span>
                        <span class="stat-label">已打卡</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${streak}</span>
                        <span class="stat-label">连续天数</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${stats.completionRate}%</span>
                        <span class="stat-label">完成率</span>
                    </div>
                </div>
                <div id="dailyCalendarContainer"></div>
            </div>
        </div>
    `;

    // 渲染日历
    const calendarContainer = container.querySelector('#dailyCalendarContainer');
    if (calendarContainer) {
        renderDailyCalendar({ container: calendarContainer, days: 14 });
    }

    // 绑定关闭事件
    const closeBtn = container.querySelector('#closeDailyModalBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', onClose);
    }
}

/**
 * 绑定每日卡牌事件
 */
function bindDailyCardEvents(container, { onDraw, onAnswer }) {
    container.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;

        const action = btn.dataset.action;
        if (action === 'draw') {
            onDraw();
        } else if (action === 'answer') {
            onAnswer();
        }
    });
}

/**
 * 获取每日卡牌统计
 */
function getDailyCardStats() {
    const recentStatus = getRecentDailyStatus(30);
    const totalDays = recentStatus.filter(d => d.hasCard).length;
    const answeredDays = recentStatus.filter(d => d.isAnswered).length;

    return {
        totalDays,
        answeredDays,
        completionRate: totalDays > 0 ? Math.round((answeredDays / totalDays) * 100) : 0
    };
}

/**
 * HTML转义
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * 刷新每日卡牌显示
 * 用于外部调用更新UI
 */
export function refreshDailyCardDisplay(container) {
    if (!container) return;

    const status = getDailyCardStatus();
    const todayCard = status.cardId ? { id: status.cardId } : null;

    renderDailyCardSection({
        container,
        todayCard,
        onDraw: () => {},
        onAnswer: () => {}
    });
}
