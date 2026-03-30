import { cards } from './data/cards.js';
import { filterCards, drawRandomCard, getFullCardPool } from './core/card-service.js';
import { loadHistory, saveHistory, clearHistoryStore, updateHistoryItem, deleteHistoryItem } from './core/history-store.js';
import { filterHistory, exportToJSON, downloadJSON } from './core/history-filter.js';
import { generateHistoryAlbumImage, downloadAlbumImage } from './core/history-export.js';
import { renderCard, renderHistory, renderHistoryFilters, renderExportControls } from './ui/render.js';
import { renderFullStatsReport } from './ui/stats-render.js';
import { checkInOnSave, getStreakDays } from './core/check-in.js';
import {
    loadCustomCards, addCustomCard, updateCustomCard, deleteCustomCard,
    getCustomCardCount, exportCustomCardsToJSON, importCustomCardsFromJSON
} from './core/custom-card-service.js';
import {
    getAllCardPacks, importCardPackFromJSON, downloadCardPack,
    setActiveCardPack, getActiveCardPack, clearActiveCardPack,
    deleteCardPack, BUILT_IN_PACKS
} from './core/card-pack-service.js';
import {
    getTodayCard, markTodayCardAnswered, getDailyCardStatus,
    getDailyCardStreak, getRecentDailyStatus
} from './core/daily-card-service.js';
import { renderCustomCardManager, renderCustomCardForm } from './ui/custom-card-render.js';
import { renderCardPackManager, renderCardPackPreview, renderActivePackIndicator } from './ui/card-pack-render.js';
import { renderDailyCardSection, renderDailyCalendar } from './ui/daily-card-render.js';
import {
    createSpeechSynthesizer,
    createSpeechRecognizer,
    isSpeechRecognitionSupported,
    requestMicrophonePermission
} from './core/voice-service.js';
import {
    renderCardVoiceControls,
    renderModalVoiceControls,
    updateVoiceButtonState,
    updateVoiceStatusIndicator
} from './ui/voice-render.js';

const state = {
    currentCard: null,
    currentCategory: 'all',
    currentLevel: 'all',
    history: loadHistory(),
    historyFilters: {
        date: 'all',
        category: 'all'
    },
    editingItem: null,
    customCards: loadCustomCards(),
    cardPacks: getAllCardPacks(),
    todayCard: null,
    voice: {
        isReading: false,
        isListening: false,
        synthesizer: null,
        recognizer: null,
        currentUtterance: null
    }
};

const UI_TIMING = {
    toastVisibleMs: 1800,
    toastExitMs: 180
};

const THEME_KEY = 'heartTalkTheme';
const THEME_CHOICES = ['forest', 'warm', 'dark'];
const THEME_LABELS = {
    forest: '\u6d45\u7eff\u68ee\u6797',
    warm: '\u6696\u7eb8\u6cbb\u6108',
    dark: '\u591c\u95f4\u62a4\u773c'
};

const elements = {
    cardContainer: document.getElementById('cardContainer'),
    emptyState: document.getElementById('emptyState'),
    cardContent: document.getElementById('cardContent'),
    cardCategory: document.getElementById('cardCategory'),
    cardLevel: document.getElementById('cardLevel'),
    cardQuestion: document.getElementById('cardQuestion'),
    drawBtn: document.getElementById('drawBtn'),
    saveBtn: document.getElementById('saveBtn'),
    shareBtn: document.getElementById('shareBtn'),
    historyList: document.getElementById('historyList'),
    historyFiltersContainer: document.getElementById('historyFiltersContainer'),
    historyExportContainer: document.getElementById('historyExportContainer'),
    saveModal: document.getElementById('saveModal'),
    shareModal: document.getElementById('shareModal'),
    editModal: document.getElementById('editModal'),
    saveModalQuestion: document.getElementById('saveModalQuestion'),
    answerInput: document.getElementById('answerInput'),
    editModalQuestion: document.getElementById('editModalQuestion'),
    editAnswerInput: document.getElementById('editAnswerInput'),
    confirmSaveBtn: document.getElementById('confirmSaveBtn'),
    cancelSaveBtn: document.getElementById('cancelSaveBtn'),
    confirmEditBtn: document.getElementById('confirmEditBtn'),
    cancelEditBtn: document.getElementById('cancelEditBtn'),
    shareQuestion: document.getElementById('shareQuestion'),
    shareAnswer: document.getElementById('shareAnswer'),
    copyShareBtn: document.getElementById('copyShareBtn'),
    closeShareBtn: document.getElementById('closeShareBtn'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn'),
    categoryFilters: document.getElementById('categoryFilters'),
    levelFilters: document.getElementById('levelFilters'),
    toastContainer: document.getElementById('toastContainer'),
    confirmModal: document.getElementById('confirmModal'),
    confirmMessage: document.getElementById('confirmMessage'),
    confirmOkBtn: document.getElementById('confirmOkBtn'),
    confirmCancelBtn: document.getElementById('confirmCancelBtn'),
    themeSelector: document.getElementById('themeSelector'),
    // 分享增强功能元素
    generateImageBtn: document.getElementById('generateImageBtn'),
    copyLinkBtn: document.getElementById('copyLinkBtn'),
    imagePreviewContainer: document.getElementById('imagePreviewContainer'),
    generatedImagePreview: document.getElementById('generatedImagePreview'),
    downloadImageBtn: document.getElementById('downloadImageBtn'),
    shareCardTemplate: document.getElementById('shareCardTemplate'),
    shareCardCategory: document.getElementById('shareCardCategory'),
    shareCardQuestion: document.getElementById('shareCardQuestion'),
    shareCardAnswer: document.getElementById('shareCardAnswer'),
    shareCardAnswerSection: document.getElementById('shareCardAnswerSection'),
    // 统计功能元素
    statsBtn: document.getElementById('statsBtn'),
    statsModal: document.getElementById('statsModal'),
    statsContainer: document.getElementById('statsContainer'),
    closeStatsBtn: document.getElementById('closeStatsBtn'),
    // 自定义卡牌元素
    customCardBtn: document.getElementById('customCardBtn'),
    customCardModal: document.getElementById('customCardModal'),
    customCardContainer: document.getElementById('customCardContainer'),
    closeCustomCardBtn: document.getElementById('closeCustomCardBtn'),
    // 卡牌包元素
    cardPackBtn: document.getElementById('cardPackBtn'),
    cardPackModal: document.getElementById('cardPackModal'),
    cardPackContainer: document.getElementById('cardPackContainer'),
    closeCardPackBtn: document.getElementById('closeCardPackBtn'),
    // 每日推荐元素
    dailyCardSection: document.getElementById('dailyCardSection'),
    dailyCardContainer: document.getElementById('dailyCardContainer'),
    // 语音功能元素
    cardVoiceControls: document.getElementById('cardVoiceControls'),
    saveVoiceWrapper: document.getElementById('saveVoiceWrapper'),
    editVoiceWrapper: document.getElementById('editVoiceWrapper')
};

// 当前生成的图片数据
let currentGeneratedImage = null;

function buildNamesMap(selector, dataKey) {
    const map = {};
    document.querySelectorAll(selector).forEach((btn) => {
        const key = btn.dataset[dataKey];
        if (key && key !== 'all') {
            map[key] = btn.textContent.trim();
        }
    });
    return map;
}

const categoryNames = buildNamesMap('#categoryFilters .filter-btn', 'category');
const levelNames = buildNamesMap('#levelFilters .filter-btn', 'level');

function getSavedAnswerForCurrentCard() {
    if (!state.currentCard) return '';
    const item = state.history.find((entry) => entry.card.id === state.currentCard.id);
    return item ? item.answer : '';
}

function refreshCardView() {
    renderCard({
        currentCard: state.currentCard,
        categoryNames,
        levelNames,
        elements
    });

    // 渲染语音控制按钮
    renderCardVoiceSection();
}

function getFilteredHistory() {
    return filterHistory(state.history, state.historyFilters);
}

function refreshHistoryView() {
    const filteredHistory = getFilteredHistory();
    renderHistory({
        history: filteredHistory,
        levelNames,
        categoryNames,
        historyList: elements.historyList,
        onEdit: openEditModal,
        onDelete: handleDeleteHistoryItem
    });
}

function handleHistoryFilterChange(filters) {
    state.historyFilters = { ...state.historyFilters, ...filters };
    refreshHistoryView();
}

function openEditModal(item) {
    state.editingItem = item;
    elements.editModalQuestion.textContent = item.card.question;
    elements.editAnswerInput.value = item.answer;
    elements.editModal.classList.add('active');
    elements.editAnswerInput.focus();

    // 渲染语音输入按钮
    renderEditModalVoiceControls();
}

function closeEditModal() {
    // 停止语音输入
    stopVoiceInput();
    elements.editModal.classList.remove('active');
    state.editingItem = null;
}

function saveEditedAnswer() {
    if (!state.editingItem) return;
    
    const newAnswer = elements.editAnswerInput.value.trim();
    if (!newAnswer) {
        showToast('回答内容不能为空', 'error');
        return;
    }
    
    const newHistory = updateHistoryItem(state.history, state.editingItem.id, newAnswer);
    if (newHistory === null) {
        showToast('保存失败，请重试', 'error');
        return;
    }
    
    state.history = newHistory;
    refreshHistoryView();
    closeEditModal();
    showToast('回答已更新', 'success');
}

async function handleDeleteHistoryItem(item) {
    const confirmed = await showConfirm('确定要删除这条历史记录吗？此操作不可恢复。');
    if (!confirmed) return;
    
    const newHistory = deleteHistoryItem(state.history, item.id);
    if (newHistory === null) {
        showToast('删除失败，请重试', 'error');
        return;
    }
    
    state.history = newHistory;
    refreshHistoryView();
    showToast('记录已删除', 'success');
}

function handleExportJSON() {
    const filteredHistory = getFilteredHistory();
    if (!filteredHistory.length) {
        showToast('没有可导出的记录', 'error');
        return;
    }
    
    const jsonString = exportToJSON(filteredHistory);
    downloadJSON(jsonString);
    showToast('JSON文件已下载', 'success');
}

async function handleExportImage() {
    const filteredHistory = getFilteredHistory();
    if (!filteredHistory.length) {
        showToast('没有可导出的记录', 'error');
        return;
    }
    
    try {
        showToast('正在生成图片...', 'info');
        const imageData = await generateHistoryAlbumImage(filteredHistory, categoryNames, levelNames);
        downloadAlbumImage(imageData);
        showToast('图片已下载', 'success');
    } catch (error) {
        console.error('导出图片失败:', error);
        showToast(error.message || '生成图片失败，请重试', 'error');
    }
}

async function handleExportAlbum() {
    const filteredHistory = getFilteredHistory();
    if (!filteredHistory.length) {
        showToast('没有可导出的记录', 'error');
        return;
    }
    
    // 纪念册功能与导出图片相同
    await handleExportImage();
}

function getStoredTheme() {
    const value = localStorage.getItem(THEME_KEY);
    return THEME_CHOICES.includes(value) ? value : 'forest';
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (!elements.themeSelector) return;
    elements.themeSelector.querySelectorAll('[data-theme-choice]').forEach((button) => {
        const active = button.dataset.themeChoice === theme;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
    });
}

function setTheme(theme) {
    if (!THEME_CHOICES.includes(theme)) return;
    localStorage.setItem(THEME_KEY, theme);
    applyTheme(theme);
    showToast(`\u5df2\u5207\u6362\u5230${THEME_LABELS[theme]}\u98ce\u683c\u3002`, 'success');
}

function showToast(message, type = 'info') {
    const oldToasts = elements.toastContainer.querySelectorAll('.toast');
    if (oldToasts.length >= 2) {
        oldToasts[0].remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'toast-error' : type === 'success' ? 'toast-success' : ''}`.trim();
    toast.textContent = message;
    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('toast-hide');
        setTimeout(() => {
            toast.remove();
        }, UI_TIMING.toastExitMs);
    }, UI_TIMING.toastVisibleMs);
}

function showConfirm(message) {
    return new Promise((resolve) => {
        elements.confirmMessage.textContent = message;
        elements.confirmModal.classList.add('active');

        const cleanUp = () => {
            elements.confirmModal.classList.remove('active');
            elements.confirmOkBtn.removeEventListener('click', onConfirm);
            elements.confirmCancelBtn.removeEventListener('click', onCancel);
            elements.confirmModal.removeEventListener('click', onOverlayClick);
            document.removeEventListener('keydown', onKeyDown);
        };

        const onConfirm = () => {
            cleanUp();
            resolve(true);
        };

        const onCancel = () => {
            cleanUp();
            resolve(false);
        };

        const onOverlayClick = (event) => {
            if (event.target === elements.confirmModal) {
                onCancel();
            }
        };

        const onKeyDown = (event) => {
            if (event.key === 'Escape') {
                onCancel();
            }
        };

        elements.confirmOkBtn.addEventListener('click', onConfirm);
        elements.confirmCancelBtn.addEventListener('click', onCancel);
        elements.confirmModal.addEventListener('click', onOverlayClick);
        document.addEventListener('keydown', onKeyDown);
    });
}

function drawCard() {
    // 获取完整的卡牌池（官方 + 自定义 + 激活的卡牌包）
    const fullCardPool = getFullCardPool(cards);
    const filtered = filterCards(fullCardPool, state.currentCategory, state.currentLevel);

    if (!filtered.length) {
        showToast('当前筛选条件下没有可用卡牌，请调整筛选后重试。', 'error');
        return;
    }

    state.currentCard = drawRandomCard(filtered);
    refreshCardView();
    elements.cardContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/**
 * 抽取今日卡牌
 */
function drawTodayCard() {
    const fullCardPool = getFullCardPool(cards);
    const todayCard = getTodayCard(fullCardPool);

    if (!todayCard) {
        showToast('获取今日卡牌失败', 'error');
        return;
    }

    state.currentCard = todayCard;
    state.todayCard = todayCard;
    refreshCardView();
    elements.cardContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    showToast('🌟 今日推荐卡牌', 'success');
}

function openSaveModal() {
    if (!state.currentCard) return;
    elements.saveModalQuestion.textContent = state.currentCard.question;
    elements.answerInput.value = '';
    elements.saveModal.classList.add('active');
    elements.answerInput.focus();

    // 渲染语音输入按钮
    renderSaveModalVoiceControls();
}

function closeSaveModal() {
    // 停止语音输入
    stopVoiceInput();
    elements.saveModal.classList.remove('active');
}

function saveAnswer() {
    if (!state.currentCard) return;

    const answer = elements.answerInput.value.trim();
    if (!answer) {
        showToast('请先输入你的回答。', 'error');
        return;
    }

    const historyItem = {
        id: Date.now(),
        timestamp: new Date().toLocaleString('zh-CN'),
        card: state.currentCard,
        answer
    };

    state.history.unshift(historyItem);
    if (!saveHistory(state.history)) {
        showToast('保存失败，请检查浏览器存储权限。', 'error');
        return;
    }

    refreshHistoryView();
    closeSaveModal();

    // 检查是否是今日卡牌
    if (state.currentCard.isDailyCard) {
        markTodayCardAnswered();
    }

    // 打卡
    const checkInResult = checkInOnSave();
    if (checkInResult.isNewCheckIn) {
        showToast(`打卡成功！已连续打卡 ${checkInResult.data.streak} 天`, 'success');
    } else {
        showToast('回答已保存。', 'success');
    }

    // 刷新每日卡牌显示
    refreshDailyCardView();
}

function openShareModal() {
    if (!state.currentCard) return;

    elements.shareQuestion.textContent = state.currentCard.question;
    const answer = getSavedAnswerForCurrentCard() || '（点击“保存回答”后可展示你的回答）';
    elements.shareAnswer.textContent = answer;
    elements.shareModal.classList.add('active');
}

function closeShareModal() {
    elements.shareModal.classList.remove('active');
}

function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    let ok = false;
    try {
        ok = document.execCommand('copy');
    } catch {
        ok = false;
    }

    document.body.removeChild(textarea);
    return ok;
}

async function copyShareLink() {
    if (!state.currentCard) return;

    const text = `心语卡牌\n\n${state.currentCard.question}\n\n来自心语卡牌`;

    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            showToast('已复制到剪贴板。', 'success');
            return;
        }

        if (fallbackCopy(text)) {
            showToast('已复制到剪贴板。', 'success');
            return;
        }

        showToast('复制失败，请手动复制。', 'error');
    } catch {
        if (fallbackCopy(text)) {
            showToast('已复制到剪贴板。', 'success');
            return;
        }
        showToast('复制失败，请手动复制。', 'error');
    }
}

// ==================== 分享功能增强 ====================

/**
 * 生成分享图片
 * 使用 html2canvas 将隐藏模板转为图片
 */
async function generateShareImage() {
    if (!state.currentCard) {
        showToast('请先抽取一张卡牌', 'error');
        return;
    }

    try {
        showToast('正在生成分享图片...', 'info');

        // 更新分享卡片模板内容
        elements.shareCardCategory.textContent = categoryNames[state.currentCard.category] || state.currentCard.category;
        elements.shareCardQuestion.textContent = state.currentCard.question;

        // 获取用户回答
        const answer = getSavedAnswerForCurrentCard();
        if (answer) {
            elements.shareCardAnswer.textContent = answer;
            elements.shareCardAnswerSection.style.display = 'block';
        } else {
            elements.shareCardAnswerSection.style.display = 'none';
        }

        // 临时将模板移到可视区域以便 html2canvas 渲染
        const originalPosition = elements.shareCardTemplate.style.position;
        const originalLeft = elements.shareCardTemplate.style.left;
        elements.shareCardTemplate.style.position = 'fixed';
        elements.shareCardTemplate.style.left = '-9999px';
        elements.shareCardTemplate.style.top = '-9999px';

        // 等待字体加载完成
        await document.fonts.ready;

        // 检测是否在 file:// 协议下运行
        const isFileProtocol = window.location.protocol === 'file:';
        if (isFileProtocol) {
            showToast('请使用 HTTP 服务器访问以生成图片（如 python -m http.server 8080）', 'error');
            // 恢复模板位置
            elements.shareCardTemplate.style.position = originalPosition;
            elements.shareCardTemplate.style.left = originalLeft;
            return;
        }

        // 使用 html2canvas 生成图片
        const canvas = await html2canvas(elements.shareCardTemplate.querySelector('.share-card-visual'), {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: null,
            logging: false,
            width: 600,
            height: 800
        });

        // 恢复模板位置
        elements.shareCardTemplate.style.position = originalPosition;
        elements.shareCardTemplate.style.left = originalLeft;

        // 转换为图片数据
        currentGeneratedImage = canvas.toDataURL('image/png');

        // 显示预览
        elements.generatedImagePreview.src = currentGeneratedImage;
        elements.imagePreviewContainer.style.display = 'block';

        showToast('分享图片生成成功！', 'success');
    } catch (error) {
        console.error('生成图片失败:', error);
        showToast('生成图片失败，请重试', 'error');
    }
}

/**
 * 下载生成的分享图片
 */
function downloadShareImage() {
    if (!currentGeneratedImage) {
        showToast('请先生成分享图片', 'error');
        return;
    }

    const link = document.createElement('a');
    link.download = `心语卡牌_${Date.now()}.png`;
    link.href = currentGeneratedImage;
    link.click();

    showToast('图片下载已开始', 'success');
}

/**
 * 生成分享链接（Base64 编码）
 * 包含卡牌信息和用户回答
 */
function generateShareLink() {
    if (!state.currentCard) {
        showToast('请先抽取一张卡牌', 'error');
        return;
    }

    try {
        // 获取用户回答
        const answer = getSavedAnswerForCurrentCard();

        // 构建分享数据
        const shareData = {
            cardId: state.currentCard.id,
            category: state.currentCard.category,
            level: state.currentCard.level,
            question: state.currentCard.question,
            answer: answer || '',
            timestamp: Date.now()
        };

        // Base64 编码
        const encoded = btoa(encodeURIComponent(JSON.stringify(shareData)));
        const shareUrl = `${window.location.origin}${window.location.pathname}#share=${encoded}`;

        // 复制到剪贴板
        if (navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(shareUrl).then(() => {
                showToast('分享链接已复制到剪贴板', 'success');
            }).catch(() => {
                fallbackCopy(shareUrl);
                showToast('分享链接已复制到剪贴板', 'success');
            });
        } else if (fallbackCopy(shareUrl)) {
            showToast('分享链接已复制到剪贴板', 'success');
        } else {
            showToast('复制失败，请手动复制', 'error');
        }
    } catch (error) {
        console.error('生成分享链接失败:', error);
        showToast('生成分享链接失败', 'error');
    }
}

/**
 * 处理分享链接
 * 解析 URL hash 中的分享数据并加载卡牌
 */
function handleShareLink() {
    const hash = window.location.hash;
    if (!hash.startsWith('#share=')) return;

    try {
        const encoded = hash.slice(7); // 移除 '#share='
        const decoded = decodeURIComponent(atob(encoded));
        const shareData = JSON.parse(decoded);

        // 查找卡牌
        const card = cards.find(c => c.id === shareData.cardId);
        if (!card) {
            showToast('分享的卡牌不存在或已被删除', 'error');
            return;
        }

        // 设置当前卡牌
        state.currentCard = card;
        refreshCardView();

        // 如果有回答，添加到历史中
        if (shareData.answer) {
            const historyItem = {
                id: Date.now(),
                timestamp: new Date(shareData.timestamp || Date.now()).toLocaleString('zh-CN'),
                card: card,
                answer: shareData.answer
            };

            // 检查是否已存在相同卡牌的回答
            const existingIndex = state.history.findIndex(h => h.card.id === card.id);
            if (existingIndex === -1) {
                state.history.unshift(historyItem);
                saveHistory(state.history);
                refreshHistoryView();
            }
        }

        // 清除 hash
        window.history.replaceState(null, null, window.location.pathname);

        showToast('已加载分享的卡牌', 'success');
        elements.cardContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (error) {
        console.error('解析分享链接失败:', error);
        showToast('分享链接无效或已过期', 'error');
    }
}

async function clearHistory() {
    const confirmed = await showConfirm('确定要清空所有历史记录吗？此操作不可恢复。');
    if (!confirmed) return;

    state.history = [];
    clearHistoryStore();
    refreshHistoryView();
    showToast('历史记录已清空。', 'success');
}

// ==================== 统计功能 ====================

function openStatsModal() {
    if (elements.statsModal && elements.statsContainer) {
        elements.statsModal.classList.add('active');
        renderFullStatsReport({
            container: elements.statsContainer,
            history: state.history,
            onExportImage: exportStatsImage
        });
    }
}

function closeStatsModal() {
    if (elements.statsModal) {
        elements.statsModal.classList.remove('active');
    }
}

async function exportStatsImage() {
    const statsContent = document.getElementById('statsReportContent');
    if (!statsContent) {
        showToast('报告内容未加载', 'error');
        return;
    }

    try {
        showToast('正在生成报告图片...', 'info');

        // 检测是否在 file:// 协议下运行
        const isFileProtocol = window.location.protocol === 'file:';
        if (isFileProtocol) {
            showToast('请使用 HTTP 服务器访问以生成图片（如 python -m http.server 8080）', 'error');
            return;
        }

        // 等待字体加载完成
        await document.fonts.ready;

        // 使用 html2canvas 生成图片
        const canvas = await html2canvas(statsContent, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false
        });

        // 转换为图片数据并下载
        const imageData = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `心语卡牌报告_${Date.now()}.png`;
        link.href = imageData;
        link.click();

        showToast('报告图片已下载', 'success');
    } catch (error) {
        console.error('生成报告图片失败:', error);
        showToast('生成图片失败，请重试', 'error');
    }
}

function setActiveFilterButton(container, target) {
    if (!target.classList.contains('filter-btn')) return;
    container.querySelectorAll('.filter-btn').forEach((btn) => btn.classList.remove('active'));
    target.classList.add('active');
}

function setupEventListeners() {
    elements.drawBtn.addEventListener('click', drawCard);
    elements.saveBtn.addEventListener('click', openSaveModal);
    elements.shareBtn.addEventListener('click', openShareModal);
    elements.confirmSaveBtn.addEventListener('click', saveAnswer);
    elements.cancelSaveBtn.addEventListener('click', closeSaveModal);
    elements.closeShareBtn.addEventListener('click', closeShareModal);
    elements.copyShareBtn.addEventListener('click', copyShareLink);
    elements.clearHistoryBtn.addEventListener('click', clearHistory);
    
    // 编辑模态框事件
    if (elements.confirmEditBtn) {
        elements.confirmEditBtn.addEventListener('click', saveEditedAnswer);
    }
    if (elements.cancelEditBtn) {
        elements.cancelEditBtn.addEventListener('click', closeEditModal);
    }
    if (elements.editModal) {
        elements.editModal.addEventListener('click', (event) => {
            if (event.target === elements.editModal) closeEditModal();
        });
    }

    // 分享增强功能事件监听
    if (elements.generateImageBtn) {
        elements.generateImageBtn.addEventListener('click', generateShareImage);
    }
    if (elements.copyLinkBtn) {
        elements.copyLinkBtn.addEventListener('click', generateShareLink);
    }
    if (elements.downloadImageBtn) {
        elements.downloadImageBtn.addEventListener('click', downloadShareImage);
    }

    elements.themeSelector.addEventListener('click', (event) => {
        const button = event.target.closest('[data-theme-choice]');
        if (!button) return;
        setTheme(button.dataset.themeChoice);
    });

    elements.categoryFilters.addEventListener('click', (event) => {
        setActiveFilterButton(elements.categoryFilters, event.target);
        if (event.target.dataset.category) {
            state.currentCategory = event.target.dataset.category;
        }
    });

    elements.levelFilters.addEventListener('click', (event) => {
        setActiveFilterButton(elements.levelFilters, event.target);
        if (event.target.dataset.level) {
            state.currentLevel = event.target.dataset.level;
        }
    });

    elements.saveModal.addEventListener('click', (event) => {
        if (event.target === elements.saveModal) closeSaveModal();
    });

    elements.shareModal.addEventListener('click', (event) => {
        if (event.target === elements.shareModal) closeShareModal();
    });

    // 统计功能事件监听
    if (elements.statsBtn) {
        elements.statsBtn.addEventListener('click', openStatsModal);
    }
    if (elements.closeStatsBtn) {
        elements.closeStatsBtn.addEventListener('click', closeStatsModal);
    }
    if (elements.statsModal) {
        elements.statsModal.addEventListener('click', (event) => {
            if (event.target === elements.statsModal) closeStatsModal();
        });
    }

    // 自定义卡牌事件监听
    if (elements.customCardBtn) {
        elements.customCardBtn.addEventListener('click', openCustomCardModal);
    }
    if (elements.closeCustomCardBtn) {
        elements.closeCustomCardBtn.addEventListener('click', closeCustomCardModal);
    }
    if (elements.customCardModal) {
        elements.customCardModal.addEventListener('click', (event) => {
            if (event.target === elements.customCardModal) closeCustomCardModal();
        });
    }

    // 卡牌包事件监听
    if (elements.cardPackBtn) {
        elements.cardPackBtn.addEventListener('click', openCardPackModal);
    }
    if (elements.closeCardPackBtn) {
        elements.closeCardPackBtn.addEventListener('click', closeCardPackModal);
    }
    if (elements.cardPackModal) {
        elements.cardPackModal.addEventListener('click', (event) => {
            if (event.target === elements.cardPackModal) closeCardPackModal();
        });
    }
}

// ==================== 自定义卡牌功能 ====================

function openCustomCardModal() {
    if (!elements.customCardModal || !elements.customCardContainer) return;

    renderCustomCardManager({
        container: elements.customCardContainer,
        onAdd: () => openCustomCardForm(),
        onEdit: (card) => openCustomCardForm(card),
        onDelete: handleDeleteCustomCard,
        onImport: handleImportCustomCards,
        onExport: handleExportCustomCards
    });

    elements.customCardModal.classList.add('active');
}

function closeCustomCardModal() {
    if (elements.customCardModal) {
        elements.customCardModal.classList.remove('active');
    }
}

function openCustomCardForm(card = null) {
    if (!elements.customCardContainer) return;

    renderCustomCardForm({
        container: elements.customCardContainer,
        card,
        onSave: (data) => handleSaveCustomCard(data, card?.id),
        onCancel: () => openCustomCardModal() // 返回列表
    });
}

function handleSaveCustomCard(data, editId = null) {
    let result;

    if (editId) {
        result = updateCustomCard(editId, data);
        if (result) {
            showToast('自定义卡牌已更新', 'success');
        } else {
            showToast('更新失败，请重试', 'error');
            return;
        }
    } else {
        result = addCustomCard(data);
        if (result) {
            showToast('自定义卡牌已创建', 'success');
        } else {
            showToast('创建失败，请重试', 'error');
            return;
        }
    }

    // 刷新状态
    state.customCards = loadCustomCards();
    openCustomCardModal(); // 返回列表
}

async function handleDeleteCustomCard(cardId) {
    const confirmed = await showConfirm('确定要删除这张自定义卡牌吗？此操作不可恢复。');
    if (!confirmed) return;

    const success = deleteCustomCard(cardId);
    if (success) {
        state.customCards = loadCustomCards();
        openCustomCardModal(); // 刷新列表
        showToast('自定义卡牌已删除', 'success');
    } else {
        showToast('删除失败，请重试', 'error');
    }
}

function handleExportCustomCards() {
    const jsonString = exportCustomCardsToJSON();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `心语自定义卡牌_${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    URL.revokeObjectURL(url);
    showToast('自定义卡牌已导出', 'success');
}

async function handleImportCustomCards(file) {
    try {
        const text = await file.text();
        const result = importCustomCardsFromJSON(text, true); // true = 合并模式

        if (result >= 0) {
            state.customCards = loadCustomCards();
            openCustomCardModal(); // 刷新列表
            showToast(`成功导入 ${result} 张自定义卡牌`, 'success');
        } else {
            showToast('导入失败，请检查文件格式', 'error');
        }
    } catch (error) {
        console.error('导入自定义卡牌失败:', error);
        showToast('导入失败，请检查文件格式', 'error');
    }
}

// ==================== 卡牌包功能 ====================

function openCardPackModal() {
    if (!elements.cardPackModal || !elements.cardPackContainer) return;

    renderCardPackManager({
        container: elements.cardPackContainer,
        onActivate: handleActivateCardPack,
        onDeactivate: handleDeactivateCardPack,
        onImport: handleImportCardPack,
        onExport: handleExportCardPack,
        onDelete: handleDeleteCardPack,
        onPreview: handlePreviewCardPack
    });

    elements.cardPackModal.classList.add('active');
}

function closeCardPackModal() {
    if (elements.cardPackModal) {
        elements.cardPackModal.classList.remove('active');
    }
}

function handleActivateCardPack(packId) {
    setActiveCardPack(packId);
    state.cardPacks = getAllCardPacks();
    openCardPackModal(); // 刷新
    showToast('卡牌包已激活', 'success');
}

function handleDeactivateCardPack() {
    clearActiveCardPack();
    state.cardPacks = getAllCardPacks();
    openCardPackModal(); // 刷新
    showToast('已恢复默认卡牌', 'success');
}

async function handleDeleteCardPack(packId) {
    const confirmed = await showConfirm('确定要删除这个卡牌包吗？此操作不可恢复。');
    if (!confirmed) return;

    const success = deleteCardPack(packId);
    if (success) {
        state.cardPacks = getAllCardPacks();
        openCardPackModal(); // 刷新
        showToast('卡牌包已删除', 'success');
    } else {
        showToast('删除失败，请重试', 'error');
    }
}

function handleExportCardPack(packId) {
    const success = downloadCardPack(packId);
    if (success) {
        showToast('卡牌包导出成功', 'success');
    } else {
        showToast('导出失败，请重试', 'error');
    }
}

async function handleImportCardPack(file) {
    try {
        const text = await file.text();
        const result = importCardPackFromJSON(text);

        if (result) {
            state.cardPacks = getAllCardPacks();
            openCardPackModal(); // 刷新
            showToast(`卡牌包 "${result.name}" 导入成功`, 'success');
        } else {
            showToast('导入失败，请检查文件格式', 'error');
        }
    } catch (error) {
        console.error('导入卡牌包失败:', error);
        showToast('导入失败，请检查文件格式', 'error');
    }
}

function handlePreviewCardPack(packId) {
    const pack = getAllCardPacks().find(p => p.id === packId);
    if (!pack) return;

    // 在卡牌包容器中显示预览
    renderCardPackPreview({
        container: elements.cardPackContainer,
        pack,
        onClose: () => openCardPackModal() // 返回列表
    });
}

// ==================== 每日推荐功能 ====================

function initDailyCard() {
    if (!elements.dailyCardContainer) return;

    // 获取今日卡牌但不自动抽取
    const fullCardPool = getFullCardPool(cards);
    const todayCard = getTodayCard(fullCardPool);

    renderDailyCardSection({
        container: elements.dailyCardContainer,
        todayCard,
        onDraw: () => drawTodayCard(),
        onAnswer: () => openSaveModal()
    });
}

function refreshDailyCardView() {
    if (!elements.dailyCardContainer) return;
    initDailyCard();
}

// ==================== 语音功能 ====================

/**
 * 初始化语音服务
 */
function initVoiceService() {
    state.voice.synthesizer = createSpeechSynthesizer();
}

/**
 * 处理朗读按钮点击
 */
function handleReadAloud() {
    if (!state.voice.synthesizer) {
        showToast('您的浏览器不支持语音朗读功能', 'error');
        return;
    }

    if (!state.currentCard) {
        showToast('请先抽取一张卡牌', 'error');
        return;
    }

    // 如果正在朗读，则停止
    if (state.voice.isReading) {
        state.voice.synthesizer.cancel();
        state.voice.isReading = false;
        renderCardVoiceControls({
            container: elements.cardVoiceControls,
            onReadAloud: handleReadAloud,
            isReading: false,
            disabled: false
        });
        return;
    }

    // 开始朗读
    state.voice.isReading = true;
    renderCardVoiceControls({
        container: elements.cardVoiceControls,
        onReadAloud: handleReadAloud,
        isReading: true,
        disabled: false
    });

    state.voice.synthesizer.speak(state.currentCard.question, {
        rate: 0.9,
        pitch: 1.0,
        onEnd: () => {
            state.voice.isReading = false;
            renderCardVoiceControls({
                container: elements.cardVoiceControls,
                onReadAloud: handleReadAloud,
                isReading: false,
                disabled: false
            });
        },
        onError: (error) => {
            console.error('语音朗读错误:', error);
            showToast('朗读失败，请重试', 'error');
            state.voice.isReading = false;
            renderCardVoiceControls({
                container: elements.cardVoiceControls,
                onReadAloud: handleReadAloud,
                isReading: false,
                disabled: false
            });
        }
    });
}

/**
 * 渲染卡牌区域的语音控制
 */
function renderCardVoiceSection() {
    if (!elements.cardVoiceControls) return;

    const hasTTS = state.voice.synthesizer !== null;
    renderCardVoiceControls({
        container: elements.cardVoiceControls,
        onReadAloud: hasTTS ? handleReadAloud : null,
        isReading: state.voice.isReading,
        disabled: !hasTTS
    });
}

/**
 * 渲染保存模态框的语音输入控制
 */
function renderSaveModalVoiceControls() {
    if (!elements.saveVoiceWrapper) return;

    const hasASR = isSpeechRecognitionSupported();
    renderModalVoiceControls({
        container: elements.saveVoiceWrapper,
        onVoiceInput: hasASR ? () => handleVoiceInput(elements.answerInput, 'save') : null,
        isListening: state.voice.isListening,
        status: state.voice.isListening ? '正在聆听...' : ''
    });
}

/**
 * 渲染编辑模态框的语音输入控制
 */
function renderEditModalVoiceControls() {
    if (!elements.editVoiceWrapper) return;

    const hasASR = isSpeechRecognitionSupported();
    renderModalVoiceControls({
        container: elements.editVoiceWrapper,
        onVoiceInput: hasASR ? () => handleVoiceInput(elements.editAnswerInput, 'edit') : null,
        isListening: state.voice.isListening,
        status: state.voice.isListening ? '正在聆听...' : ''
    });
}

/**
 * 处理语音输入
 * @param {HTMLTextAreaElement} textarea - 目标文本域
 * @param {string} context - 上下文 ('save' | 'edit')
 */
async function handleVoiceInput(textarea, context) {
    // 检查浏览器支持
    if (!isSpeechRecognitionSupported()) {
        showToast('您的浏览器不支持语音输入功能', 'error');
        return;
    }

    // 如果正在录音，则停止
    if (state.voice.isListening) {
        stopVoiceInput();
        return;
    }

    // 请求麦克风权限
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) {
        showToast('需要麦克风权限才能使用语音输入', 'error');
        return;
    }

    // 创建识别器
    const recognizer = createSpeechRecognizer();
    if (!recognizer) {
        showToast('语音识别初始化失败', 'error');
        return;
    }

    state.voice.recognizer = recognizer;
    state.voice.isListening = true;

    // 更新UI
    if (context === 'save') {
        renderSaveModalVoiceControls();
    } else {
        renderEditModalVoiceControls();
    }

    // 保存原始值，用于追加
    let currentValue = textarea.value;
    if (currentValue && !currentValue.endsWith(' ')) {
        currentValue += ' ';
    }

    recognizer.start({
        onResult: (finalTranscript, interimTranscript) => {
            // 更新文本域内容
            const newText = currentValue + finalTranscript + interimTranscript;
            textarea.value = newText;

            // 触发 input 事件以更新任何监听器
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
        },
        onError: (error, message) => {
            console.error('语音识别错误:', error, message);
            showToast(message, 'error');
            stopVoiceInput();
        },
        onEnd: () => {
            // 识别结束（可能是自动停止或用户停止）
            if (state.voice.isListening) {
                // 如果还在监听状态，重新启动以持续识别
                try {
                    recognizer.native.start();
                } catch (e) {
                    // 可能已经达到最大识别时间
                    stopVoiceInput();
                }
            }
        }
    });
}

/**
 * 停止语音输入
 */
function stopVoiceInput() {
    if (state.voice.recognizer) {
        state.voice.recognizer.stop();
        state.voice.recognizer = null;
    }
    state.voice.isListening = false;

    // 刷新UI
    if (elements.saveModal.classList.contains('active')) {
        renderSaveModalVoiceControls();
    }
    if (elements.editModal.classList.contains('active')) {
        renderEditModalVoiceControls();
    }
}

function init() {
    applyTheme(getStoredTheme());
    refreshCardView();
    refreshHistoryView();
    setupEventListeners();

    // 初始化筛选控件
    if (elements.historyFiltersContainer) {
        renderHistoryFilters({
            container: elements.historyFiltersContainer,
            categoryNames,
            onFilterChange: handleHistoryFilterChange
        });
    }

    // 初始化导出控件
    if (elements.historyExportContainer) {
        renderExportControls({
            container: elements.historyExportContainer,
            onExportJSON: handleExportJSON,
            onExportImage: handleExportImage,
            onExportAlbum: handleExportAlbum,
            onShowStats: openStatsModal
        });
    }

    // 初始化每日推荐
    initDailyCard();

    // 初始化语音服务
    initVoiceService();

    // 处理分享链接
    handleShareLink();
}

init();



