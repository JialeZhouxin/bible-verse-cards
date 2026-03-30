/**
 * 每日经文 UI 渲染模块
 */

import { 
    fetchRandomVerse, 
    fetchDailyVerse, 
    fetchVerseFromBook,
    convertToCardFormat 
} from '../core/daily-bible-api.js';

/**
 * 渲染每日经文区域
 * @param {HTMLElement} container - 容器元素
 */
export function renderDailyVerseSection(container) {
    container.innerHTML = `
        <div class="daily-verse-section">
            <div class="daily-verse-header">
                <span class="daily-verse-icon">📖</span>
                <span class="daily-verse-title">今日灵粮</span>
                <span class="daily-verse-badge">来自 bible-api.com</span>
            </div>
            <div class="daily-verse-content" id="dailyVerseContent">
                <div class="daily-verse-loading">
                    <span class="loading-spinner">⏳</span>
                    <span>正在获取今日经文...</span>
                </div>
            </div>
            <div class="daily-verse-actions">
                <button class="filter-btn" id="refreshDailyVerseBtn" title="获取新的经文">
                    🔄 换一句
                </button>
                <button class="filter-btn" id="saveDailyVerseBtn" title="保存到灵修记录">
                    💾 保存
                </button>
            </div>
        </div>
    `;
    
    // 绑定事件
    bindDailyVerseEvents(container);
    
    // 加载每日经文
    loadDailyVerse();
}

/**
 * 加载并显示每日经文
 */
async function loadDailyVerse() {
    const contentEl = document.getElementById('dailyVerseContent');
    if (!contentEl) return;
    
    try {
        const verse = await fetchDailyVerse();
        renderVerse(contentEl, verse);
    } catch (error) {
        contentEl.innerHTML = `
            <div class="daily-verse-error">
                <span>😔</span>
                <p>获取经文失败，请检查网络连接</p>
                <button class="filter-btn" onclick="location.reload()">重试</button>
            </div>
        `;
    }
}

/**
 * 渲染经文内容
 * @param {HTMLElement} container - 容器元素
 * @param {Object} verse - 经文数据
 */
function renderVerse(container, verse) {
    if (!verse) {
        container.innerHTML = '<p class="daily-verse-empty">暂无经文</p>';
        return;
    }
    
    container.innerHTML = `
        <div class="daily-verse-text">${verse.text}</div>
        <div class="daily-verse-reference">
            <span class="verse-book">${verse.book}</span>
            <span class="verse-chapter-verse">${verse.chapter}:${verse.verse}</span>
            <span class="verse-translation">${verse.translation}</span>
        </div>
    `;
    
    // 存储当前经文供保存使用
    container.dataset.currentVerse = JSON.stringify(verse);
}

/**
 * 绑定每日经文事件
 * @param {HTMLElement} container - 容器元素
 */
function bindDailyVerseEvents(container) {
    // 换一句按钮
    const refreshBtn = container.querySelector('#refreshDailyVerseBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
            const contentEl = document.getElementById('dailyVerseContent');
            if (!contentEl) return;
            
            // 显示加载状态
            contentEl.innerHTML = `
                <div class="daily-verse-loading">
                    <span class="loading-spinner">⏳</span>
                    <span>正在获取经文...</span>
                </div>
            `;
            
            try {
                const verse = await fetchRandomVerse();
                renderVerse(contentEl, verse);
            } catch (error) {
                contentEl.innerHTML = `
                    <div class="daily-verse-error">
                        <span>😔</span>
                        <p>获取失败，请稍后重试</p>
                    </div>
                `;
            }
        });
    }
    
    // 保存按钮
    const saveBtn = container.querySelector('#saveDailyVerseBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const contentEl = document.getElementById('dailyVerseContent');
            if (!contentEl || !contentEl.dataset.currentVerse) return;
            
            try {
                const verse = JSON.parse(contentEl.dataset.currentVerse);
                const card = convertToCardFormat(verse);
                
                // 触发保存事件，让主应用处理保存逻辑
                window.dispatchEvent(new CustomEvent('saveDailyVerse', { 
                    detail: { card, verse } 
                }));
            } catch (error) {
                console.error('保存经文失败:', error);
            }
        });
    }
}

/**
 * 渲染 API 经文卡片（用于主抽卡区域）
 * @param {Object} verse - API 经文数据
 * @returns {string} HTML 字符串
 */
export function renderApiVerseCard(verse) {
    return `
        <div class="card-category api-verse-badge">✨ 每日灵粮</div>
        <div class="card-verse-text">${verse.text}</div>
        <div class="card-verse-reference">
            <span>${verse.reference}</span>
            <span class="verse-translation">${verse.translation}</span>
        </div>
    `;
}

/**
 * 显示 API 加载状态
 * @returns {string} HTML 字符串
 */
export function renderApiLoadingState() {
    return `
        <div class="api-loading">
            <div class="loading-spinner-large">⏳</div>
            <p>正在从 bible-api.com 获取经文...</p>
        </div>
    `;
}

/**
 * 显示 API 错误状态
 * @param {string} message - 错误信息
 * @returns {string} HTML 字符串
 */
export function renderApiErrorState(message = '获取经文失败') {
    return `
        <div class="api-error">
            <span class="error-icon">😔</span>
            <p>${message}</p>
            <button class="btn btn-secondary" onclick="window.drawApiVerse()">重试</button>
        </div>
    `;
}
