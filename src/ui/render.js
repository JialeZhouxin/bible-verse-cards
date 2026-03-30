function createElement(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}

export function renderCard({ currentCard, categoryNames, levelNames, elements }) {
    const {
        emptyState,
        cardContent,
        cardCategory,
        cardLevel,
        cardQuestion,
        saveBtn,
        shareBtn
    } = elements;

    if (!currentCard) {
        emptyState.style.display = 'block';
        cardContent.style.display = 'none';
        saveBtn.style.display = 'none';
        shareBtn.style.display = 'none';
        return;
    }

    emptyState.style.display = 'none';
    cardContent.style.display = 'block';
    cardCategory.textContent = categoryNames[currentCard.category] || currentCard.category;
    
    // 对于圣经金句卡片，显示经文出处作为级别/副标题
    if (currentCard.text && currentCard.reference) {
        cardLevel.textContent = currentCard.reference;
        cardLevel.className = 'card-level verse-reference-label';
    } else {
        // 原始问题卡片格式
        cardLevel.textContent = levelNames[String(currentCard.level)] || `第${currentCard.level}级`;
        cardLevel.className = `card-level level-${currentCard.level}`;
    }
    
    // 对于圣经金句卡片，显示经文内容和出处
    if (currentCard.text && currentCard.reference) {
        //  Bible verse card format
        cardQuestion.innerHTML = `
            <div class="verse-text">${currentCard.text}</div>
            <div class="verse-reference">${currentCard.reference}</div>
        `;
    } else {
        // Original question card format
        cardQuestion.textContent = currentCard.question;
    }
    
    saveBtn.style.display = 'inline-block';
    shareBtn.style.display = 'inline-block';
}

export function renderHistory({ history, levelNames, categoryNames, historyList, onEdit, onDelete }) {
    historyList.replaceChildren();

    if (!history.length) {
        const empty = createElement('div', 'empty-state');
        empty.appendChild(createElement('p', '', '暂无对话记录'));
        historyList.appendChild(empty);
        return;
    }

    const fragment = document.createDocumentFragment();
    history.forEach((item) => {
        const wrapper = createElement('div', 'history-item');
        wrapper.dataset.id = item.id;

        // 头部信息：时间戳 + 操作按钮
        const header = createElement('div', 'history-item-header');
        header.appendChild(createElement('span', 'timestamp', item.timestamp));
        
        // 操作按钮组
        const actions = createElement('div', 'history-item-actions');
        
        const editBtn = createElement('button', 'history-action-btn edit-btn', '✏️');
        editBtn.title = '编辑';
        editBtn.dataset.action = 'edit';
        editBtn.dataset.id = item.id;
        
        const deleteBtn = createElement('button', 'history-action-btn delete-btn', '🗑️');
        deleteBtn.title = '删除';
        deleteBtn.dataset.action = 'delete';
        deleteBtn.dataset.id = item.id;
        
        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);
        header.appendChild(actions);
        wrapper.appendChild(header);

        // 类别和难度标签
        const tagsRow = createElement('div', 'history-item-tags');
        const categoryName = categoryNames[item.card.category] || item.card.category;
        const categoryTag = createElement('span', `category-tag category-${item.card.category}`, categoryName);
        tagsRow.appendChild(categoryTag);
        
        // 对于圣经金句卡片，显示经文出处；对于问题卡片，显示级别
        if (item.card.text && item.card.reference) {
            const badge = createElement('span', 'level-badge verse-reference-badge');
            badge.textContent = item.card.reference;
            tagsRow.appendChild(badge);
        } else if (item.card.level) {
            const badge = createElement('span', `level-badge level-${item.card.level}`);
            badge.textContent = levelNames[String(item.card.level)] || `第${item.card.level}级`;
            tagsRow.appendChild(badge);
        }
        wrapper.appendChild(tagsRow);

        // 问题和回答
        wrapper.appendChild(createElement('div', 'question', item.card.question));
        wrapper.appendChild(createElement('div', 'answer', item.answer));
        
        // 如果有更新时间，显示
        if (item.updatedAt) {
            wrapper.appendChild(createElement('div', 'updated-at', `编辑于 ${item.updatedAt}`));
        }

        // 绑定事件
        if (onEdit) {
            editBtn.addEventListener('click', () => onEdit(item));
        }
        if (onDelete) {
            deleteBtn.addEventListener('click', () => onDelete(item));
        }

        fragment.appendChild(wrapper);
    });

    historyList.appendChild(fragment);
}

/**
 * 渲染筛选控件
 * @param {Object} params - 参数对象
 * @param {HTMLElement} params.container - 容器元素
 * @param {Object} params.categoryNames - 类别名称映射
 * @param {Function} params.onFilterChange - 筛选变化回调
 */
export function renderHistoryFilters({ container, categoryNames, onFilterChange }) {
    container.replaceChildren();
    
    const wrapper = createElement('div', 'history-filters');
    
    // 日期筛选
    const dateFilterGroup = createElement('div', 'filter-group');
    dateFilterGroup.appendChild(createElement('label', '', '时间：'));
    
    const dateSelect = createElement('select', 'filter-select');
    dateSelect.dataset.filterType = 'date';
    const dateOptions = [
        { value: 'all', label: '全部时间' },
        { value: 'today', label: '今天' },
        { value: 'week', label: '最近7天' },
        { value: 'month', label: '最近30天' },
        { value: 'year', label: '最近一年' }
    ];
    dateOptions.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.label;
        dateSelect.appendChild(option);
    });
    dateFilterGroup.appendChild(dateSelect);
    wrapper.appendChild(dateFilterGroup);
    
    // 类别筛选
    const categoryFilterGroup = createElement('div', 'filter-group');
    categoryFilterGroup.appendChild(createElement('label', '', '类别：'));
    
    const categorySelect = createElement('select', 'filter-select');
    categorySelect.dataset.filterType = 'category';
    const categoryOptions = [
        { value: 'all', label: '全部类别' },
        ...Object.entries(categoryNames).map(([key, name]) => ({ value: key, label: name }))
    ];
    categoryOptions.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.label;
        categorySelect.appendChild(option);
    });
    categoryFilterGroup.appendChild(categorySelect);
    wrapper.appendChild(categoryFilterGroup);
    
    // 绑定事件
    if (onFilterChange) {
        dateSelect.addEventListener('change', (e) => {
            onFilterChange({ date: e.target.value, category: categorySelect.value });
        });
        categorySelect.addEventListener('change', (e) => {
            onFilterChange({ date: dateSelect.value, category: e.target.value });
        });
    }
    
    container.appendChild(wrapper);
}

/**
 * 渲染导出控件
 * @param {Object} params - 参数对象
 * @param {HTMLElement} params.container - 容器元素
 * @param {Function} params.onExportJSON - 导出JSON回调
 * @param {Function} params.onExportImage - 导出图片回调
 * @param {Function} params.onExportAlbum - 导出纪念册回调
 * @param {Function} params.onShowStats - 显示统计回调
 * @param {Function} params.onShowReport - 显示报告回调
 */
export function renderExportControls({ container, onExportJSON, onExportImage, onExportAlbum, onShowStats, onShowReport }) {
    container.replaceChildren();
    
    const wrapper = createElement('div', 'export-controls');
    
    const exportBtn = createElement('button', 'btn btn-secondary export-btn', '📤 导出');
    exportBtn.title = '导出历史记录';
    
    const dropdown = createElement('div', 'export-dropdown');
    dropdown.style.display = 'none';
    
    const jsonOption = createElement('div', 'export-option', '📄 导出为 JSON');
    jsonOption.dataset.exportType = 'json';
    
    const imageOption = createElement('div', 'export-option', '🖼️ 导出为图片');
    imageOption.dataset.exportType = 'image';
    
    const albumOption = createElement('div', 'export-option', '📖 生成纪念册');
    albumOption.dataset.exportType = 'album';
    
    const statsOption = createElement('div', 'export-option', '📊 数据统计');
    statsOption.dataset.exportType = 'stats';
    
    const reportOption = createElement('div', 'export-option', '📋 我的报告');
    reportOption.dataset.exportType = 'report';
    
    dropdown.appendChild(jsonOption);
    dropdown.appendChild(imageOption);
    dropdown.appendChild(albumOption);
    dropdown.appendChild(statsOption);
    dropdown.appendChild(reportOption);
    
    wrapper.appendChild(exportBtn);
    wrapper.appendChild(dropdown);
    
    // 切换下拉菜单显示
    exportBtn.addEventListener('click', () => {
        const isVisible = dropdown.style.display !== 'none';
        dropdown.style.display = isVisible ? 'none' : 'block';
    });
    
    // 点击外部关闭下拉菜单
    document.addEventListener('click', (e) => {
        if (!wrapper.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });
    
    // 绑定导出事件
    if (onExportJSON) {
        jsonOption.addEventListener('click', () => {
            onExportJSON();
            dropdown.style.display = 'none';
        });
    }
    if (onExportImage) {
        imageOption.addEventListener('click', () => {
            onExportImage();
            dropdown.style.display = 'none';
        });
    }
    if (onExportAlbum) {
        albumOption.addEventListener('click', () => {
            onExportAlbum();
            dropdown.style.display = 'none';
        });
    }
    if (onShowStats) {
        statsOption.addEventListener('click', () => {
            onShowStats();
            dropdown.style.display = 'none';
        });
    }
    if (onShowReport) {
        reportOption.addEventListener('click', () => {
            onShowReport();
            dropdown.style.display = 'none';
        });
    }
    
    container.appendChild(wrapper);
}
