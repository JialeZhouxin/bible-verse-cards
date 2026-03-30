/**
 * 卡牌包UI渲染模块
 */

import {
    getAllCardPacks, setActiveCardPack, getActiveCardPack,
    clearActiveCardPack, BUILT_IN_PACKS, deleteCardPack
} from '../core/card-pack-service.js';

/**
 * 渲染卡牌包管理界面
 * @param {Object} options - 配置选项
 * @param {HTMLElement} options.container - 容器元素
 * @param {Function} options.onActivate - 激活卡牌包回调
 * @param {Function} options.onDeactivate - 取消激活回调
 * @param {Function} options.onImport - 导入回调
 * @param {Function} options.onExport - 导出回调
 * @param {Function} options.onDelete - 删除回调
 * @param {Function} options.onPreview - 预览回调
 */
export function renderCardPackManager({
    container,
    onActivate,
    onDeactivate,
    onImport,
    onExport,
    onDelete,
    onPreview
}) {
    if (!container) return;

    const allPacks = getAllCardPacks();
    const activePackId = getActiveCardPack();

    container.innerHTML = `
        <div class="card-pack-manager">
            <div class="card-pack-header">
                <h4>卡牌包 (${allPacks.length})</h4>
                <div class="card-pack-actions">
                    <button class="filter-btn" id="importCardPackBtn">导入卡牌包</button>
                    ${activePackId ? `<button class="filter-btn" id="deactivateCardPackBtn">恢复默认</button>` : ''}
                </div>
            </div>
            <div class="card-pack-list">
                ${allPacks.map(pack => renderCardPackItem(pack, activePackId === pack.id)).join('')}
            </div>
            <input type="file" id="importCardPackInput" accept=".json" style="display: none;">
        </div>
    `;

    bindCardPackEvents(container, { onActivate, onDeactivate, onImport, onExport, onDelete, onPreview });
}

/**
 * 渲染单个卡牌包项
 */
function renderCardPackItem(pack, isActive) {
    const isBuiltIn = pack.isBuiltIn;
    const cardCount = pack.cards ? pack.cards.length : 0;

    return `
        <div class="card-pack-item ${isActive ? 'active' : ''}" data-id="${pack.id}">
            <div class="card-pack-icon">${pack.icon || '📦'}</div>
            <div class="card-pack-info">
                <div class="card-pack-name">
                    ${pack.name}
                    ${isBuiltIn ? '<span class="card-pack-badge">官方</span>' : ''}
                    ${isActive ? '<span class="card-pack-badge active">使用中</span>' : ''}
                </div>
                <div class="card-pack-description">${pack.description || ''}</div>
                <div class="card-pack-meta">
                    <span>${cardCount} 张卡牌</span>
                    ${pack.tags ? pack.tags.map(tag => `<span class="card-pack-tag">${tag}</span>`).join('') : ''}
                </div>
            </div>
            <div class="card-pack-actions">
                <button class="filter-btn" data-action="preview">预览</button>
                ${!isActive ? `<button class="filter-btn btn-primary" data-action="activate">使用</button>` : ''}
                <button class="filter-btn" data-action="export">导出</button>
                ${!isBuiltIn ? `<button class="filter-btn btn-danger" data-action="delete">删除</button>` : ''}
            </div>
        </div>
    `;
}

/**
 * 渲染卡牌包预览
 */
export function renderCardPackPreview({ container, pack, onClose }) {
    if (!container || !pack) return;

    container.innerHTML = `
        <div class="card-pack-preview">
            <div class="preview-header">
                <h4>${pack.icon || '📦'} ${pack.name}</h4>
                <button class="filter-btn" id="closePreviewBtn">关闭</button>
            </div>
            <div class="preview-description">${pack.description || ''}</div>
            <div class="preview-cards">
                <h5>包含卡牌 (${pack.cards.length})</h5>
                <div class="preview-card-list">
                    ${pack.cards.map((card, index) => `
                        <div class="preview-card-item">
                            <span class="preview-card-number">${index + 1}</span>
                            <span class="preview-card-category">${getCategoryName(card.category)}</span>
                            <span class="preview-card-level">${card.level}级</span>
                            <span class="preview-card-question">${escapeHtml(card.question)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    const closeBtn = container.querySelector('#closePreviewBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', onClose);
    }
}

/**
 * 渲染卡牌包导入界面
 */
export function renderCardPackImport({ container, onImport, onCancel }) {
    if (!container) return;

    container.innerHTML = `
        <div class="card-pack-import">
            <h4>导入卡牌包</h4>
            <div class="import-instructions">
                <p>选择要导入的卡牌包文件 (.json)</p>
                <p class="import-hint">支持从其他用户分享的卡牌包文件导入</p>
            </div>
            <div class="import-actions">
                <button class="btn btn-secondary" id="cancelImportBtn">取消</button>
                <label class="btn" for="cardPackFileInput">选择文件</label>
                <input type="file" id="cardPackFileInput" accept=".json" style="display: none;">
            </div>
        </div>
    `;

    const fileInput = container.querySelector('#cardPackFileInput');
    const cancelBtn = container.querySelector('#cancelImportBtn');

    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                onImport(e.target.files[0]);
            }
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', onCancel);
    }
}

/**
 * 绑定卡牌包事件
 */
function bindCardPackEvents(container, { onActivate, onDeactivate, onImport, onExport, onDelete, onPreview }) {
    // 导入按钮
    const importBtn = container.querySelector('#importCardPackBtn');
    const importInput = container.querySelector('#importCardPackInput');
    if (importBtn && importInput) {
        importBtn.addEventListener('click', () => importInput.click());
        importInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                onImport(e.target.files[0]);
                e.target.value = '';
            }
        });
    }

    // 取消激活按钮
    const deactivateBtn = container.querySelector('#deactivateCardPackBtn');
    if (deactivateBtn) {
        deactivateBtn.addEventListener('click', onDeactivate);
    }

    // 卡牌包操作按钮
    container.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;

        const packItem = btn.closest('.card-pack-item');
        if (!packItem) return;

        const packId = packItem.dataset.id;
        const action = btn.dataset.action;

        switch (action) {
            case 'activate':
                onActivate(packId);
                break;
            case 'export':
                onExport(packId);
                break;
            case 'delete':
                onDelete(packId);
                break;
            case 'preview':
                onPreview(packId);
                break;
        }
    });
}

/**
 * 渲染激活状态提示
 */
export function renderActivePackIndicator(container, packName) {
    if (!container) return;

    if (packName) {
        container.innerHTML = `
            <div class="active-pack-indicator">
                <span>当前使用: <strong>${packName}</strong></span>
                <button class="filter-btn btn-small" id="clearActivePackBtn">恢复默认</button>
            </div>
        `;
    } else {
        container.innerHTML = '';
    }
}

/**
 * 获取类别名称
 */
function getCategoryName(category) {
    const names = {
        couple: '情侣',
        friend: '朋友',
        family: '家庭',
        self: '自我',
        clear_thinking: '清晰思考'
    };
    return names[category] || category;
}

/**
 * HTML转义
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
