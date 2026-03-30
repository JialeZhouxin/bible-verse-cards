/**
 * 自定义卡牌UI渲染模块
 */

import { loadCustomCards, deleteCustomCard } from '../core/custom-card-service.js';

const CATEGORY_NAMES = {
    couple: '情侣',
    friend: '朋友',
    family: '家庭',
    self: '自我',
    clear_thinking: '清晰思考',
    custom: '自定义'
};

const LEVEL_NAMES = {
    1: '一级',
    2: '二级',
    3: '三级'
};

/**
 * 渲染自定义卡牌管理界面
 * @param {Object} options - 配置选项
 * @param {HTMLElement} options.container - 容器元素
 * @param {Function} options.onAdd - 添加卡牌回调
 * @param {Function} options.onEdit - 编辑卡牌回调
 * @param {Function} options.onDelete - 删除卡牌回调
 * @param {Function} options.onImport - 导入回调
 * @param {Function} options.onExport - 导出回调
 */
export function renderCustomCardManager({
    container,
    onAdd,
    onEdit,
    onDelete,
    onImport,
    onExport
}) {
    if (!container) return;

    const customCards = loadCustomCards();

    container.innerHTML = `
        <div class="custom-card-manager">
            <div class="custom-card-header">
                <h4>我的自定义卡牌 (${customCards.length})</h4>
                <div class="custom-card-actions">
                    <button class="filter-btn" id="importCustomCardsBtn">导入</button>
                    <button class="filter-btn" id="exportCustomCardsBtn">导出</button>
                    <button class="btn btn-small" id="addCustomCardBtn">+ 新建卡牌</button>
                </div>
            </div>
            <div class="custom-card-list">
                ${customCards.length === 0 ? renderEmptyState() : customCards.map(card => renderCustomCardItem(card)).join('')}
            </div>
            <input type="file" id="importCustomCardsInput" accept=".json" style="display: none;">
        </div>
    `;

    // 绑定事件
    bindCustomCardEvents(container, { onAdd, onEdit, onDelete, onImport, onExport });
}

/**
 * 渲染空状态
 */
function renderEmptyState() {
    return `
        <div class="custom-card-empty">
            <p>还没有自定义卡牌</p>
            <p>点击"新建卡牌"创建你的专属问题</p>
        </div>
    `;
}

/**
 * 渲染单个自定义卡牌项
 */
function renderCustomCardItem(card) {
    return `
        <div class="custom-card-item" data-id="${card.id}">
            <div class="custom-card-content">
                <div class="custom-card-meta">
                    <span class="custom-card-category">${CATEGORY_NAMES[card.category] || card.category}</span>
                    <span class="custom-card-level">${LEVEL_NAMES[card.level] || card.level}</span>
                </div>
                <div class="custom-card-question">${escapeHtml(card.question)}</div>
                <div class="custom-card-date">创建于 ${formatDate(card.createdAt)}</div>
            </div>
            <div class="custom-card-actions">
                <button class="filter-btn btn-edit" data-action="edit">编辑</button>
                <button class="filter-btn btn-delete" data-action="delete">删除</button>
            </div>
        </div>
    `;
}

/**
 * 渲染自定义卡牌表单
 * @param {Object} options - 配置选项
 * @param {HTMLElement} options.container - 容器元素
 * @param {Object} [options.card] - 编辑的卡牌（新增时为null）
 * @param {Function} options.onSave - 保存回调
 * @param {Function} options.onCancel - 取消回调
 */
export function renderCustomCardForm({ container, card, onSave, onCancel }) {
    if (!container) return;

    const isEdit = !!card;
    const categories = [
        { value: 'couple', label: '情侣' },
        { value: 'friend', label: '朋友' },
        { value: 'family', label: '家庭' },
        { value: 'self', label: '自我' },
        { value: 'clear_thinking', label: '清晰思考' },
        { value: 'custom', label: '自定义' }
    ];

    const levels = [
        { value: 1, label: '一级 - 轻松' },
        { value: 2, label: '二级 - 深入' },
        { value: 3, label: '三级 - 深度' }
    ];

    container.innerHTML = `
        <div class="custom-card-form">
            <h4>${isEdit ? '编辑自定义卡牌' : '新建自定义卡牌'}</h4>
            <div class="form-group">
                <label>问题内容</label>
                <textarea id="customCardQuestion" rows="3" placeholder="输入你的问题...">${isEdit ? escapeHtml(card.question) : ''}</textarea>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>类别</label>
                    <select id="customCardCategory">
                        ${categories.map(c => `
                            <option value="${c.value}" ${isEdit && card.category === c.value ? 'selected' : ''}>${c.label}</option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>深度级别</label>
                    <select id="customCardLevel">
                        ${levels.map(l => `
                            <option value="${l.value}" ${isEdit && card.level === l.value ? 'selected' : ''}>${l.label}</option>
                        `).join('')}
                    </select>
                </div>
            </div>
            <div class="form-actions">
                <button class="btn btn-secondary" id="cancelCustomCardBtn">取消</button>
                <button class="btn" id="saveCustomCardBtn">${isEdit ? '保存修改' : '创建卡牌'}</button>
            </div>
        </div>
    `;

    // 绑定事件
    const saveBtn = container.querySelector('#saveCustomCardBtn');
    const cancelBtn = container.querySelector('#cancelCustomCardBtn');

    saveBtn.addEventListener('click', () => {
        const question = container.querySelector('#customCardQuestion').value.trim();
        const category = container.querySelector('#customCardCategory').value;
        const level = parseInt(container.querySelector('#customCardLevel').value);

        if (!question) {
            alert('请输入问题内容');
            return;
        }

        onSave({ question, category, level });
    });

    cancelBtn.addEventListener('click', onCancel);
}

/**
 * 绑定自定义卡牌事件
 */
function bindCustomCardEvents(container, { onAdd, onEdit, onDelete, onImport, onExport }) {
    // 添加按钮
    const addBtn = container.querySelector('#addCustomCardBtn');
    if (addBtn) {
        addBtn.addEventListener('click', onAdd);
    }

    // 编辑和删除按钮
    container.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;

        const cardItem = btn.closest('.custom-card-item');
        if (!cardItem) return;

        const cardId = parseInt(cardItem.dataset.id);
        const action = btn.dataset.action;

        if (action === 'edit') {
            const cards = loadCustomCards();
            const card = cards.find(c => c.id === cardId);
            if (card) onEdit(card);
        } else if (action === 'delete') {
            onDelete(cardId);
        }
    });

    // 导入按钮
    const importBtn = container.querySelector('#importCustomCardsBtn');
    const importInput = container.querySelector('#importCustomCardsInput');
    if (importBtn && importInput) {
        importBtn.addEventListener('click', () => importInput.click());
        importInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                onImport(e.target.files[0]);
                e.target.value = ''; // 重置input
            }
        });
    }

    // 导出按钮
    const exportBtn = container.querySelector('#exportCustomCardsBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', onExport);
    }
}

/**
 * 渲染导入/导出结果提示
 */
export function renderImportExportToast(message, type = 'success') {
    // 使用main.js中的showToast函数
    if (window.showToast) {
        window.showToast(message, type);
    }
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
 * 格式化日期
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
