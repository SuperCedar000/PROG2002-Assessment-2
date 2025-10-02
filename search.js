// 搜索页面的专用 JavaScript
const API_BASE_URL = '/api';

// DOM 元素
const searchKeyword = document.getElementById('searchKeyword');
const searchCategory = document.getElementById('searchCategory');
const searchResultsGrid = document.getElementById('searchResultsGrid');
const resultsTitle = document.getElementById('resultsTitle');
const noResults = document.getElementById('noResults');
const loading = document.getElementById('loading');

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔍 搜索页面初始化');
    loadCategoriesForSearch();
    
    // 如果有 URL 参数，自动执行搜索
    const urlParams = new URLSearchParams(window.location.search);
    const keyword = urlParams.get('q');
    const category = urlParams.get('category');
    
    if (keyword) {
        searchKeyword.value = keyword;
    }
    if (category) {
        searchCategory.value = category;
    }
    
    if (keyword || category) {
        console.log('🔍 检测到URL参数，自动执行搜索:', { keyword, category });
        performSearch();
    } else {
        // 如果没有搜索条件，显示提示信息
        resultsTitle.textContent = '请输入搜索条件';
        searchResultsGrid.innerHTML = '';
        noResults.classList.add('hidden');
    }
});

// 为搜索页面加载分类
async function loadCategoriesForSearch() {
    try {
        console.log('🏷️ 加载分类数据...');
        const response = await fetch(`${API_BASE_URL}/categories`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ 分类数据加载成功');
        
        if (data.success) {
            const optionsHTML = data.data.map(category => 
                `<option value="${category.name}">${category.name}</option>`
            ).join('');
            
            searchCategory.innerHTML = '<option value="">所有分类</option>' + optionsHTML;
            console.log('🏷️ 分类下拉框已更新');
        }
    } catch (error) {
        console.error('❌ 加载分类失败:', error);
        searchCategory.innerHTML = '<option value="">加载分类失败</option>';
    }
}

// 执行搜索 - 修复版
async function performSearch() {
    const keyword = searchKeyword.value.trim();
    const category = searchCategory.value;
    
    console.log('🔍 执行搜索:', { keyword, category });
    
    // 验证搜索条件
    if (!keyword && !category) {
        resultsTitle.textContent = '请输入搜索关键词或选择分类';
        return;
    }
    
    showLoading();
    
    try {
        console.log('📡 开始获取活动数据...');
        
        const response = await fetch(`${API_BASE_URL}/events`);
        
        if (!response.ok) {
            throw new Error(`HTTP错误! 状态码: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ 成功获取活动数据，总数:', data.count);
        
        if (data.success && data.data) {
            let filteredEvents = data.data;

            // 应用关键词搜索
            if (keyword) {
                console.log(`🔤 应用关键词筛选: "${keyword}"`);
                filteredEvents = filteredEvents.filter(event => {
                    const nameMatch = event.name && event.name.toLowerCase().includes(keyword.toLowerCase());
                    const descMatch = event.description && event.description.toLowerCase().includes(keyword.toLowerCase());
                    const locationMatch = event.location && event.location.toLowerCase().includes(keyword.toLowerCase());
                    return nameMatch || descMatch || locationMatch;
                });
                console.log(`🔤 关键词筛选后: ${filteredEvents.length} 个活动`);
            }

            // 应用分类筛选
            if (category) {
                console.log(`🏷️ 应用分类筛选: "${category}"`);
                filteredEvents = filteredEvents.filter(event => 
                    event.category_name === category
                );
                console.log(`🏷️ 分类筛选后: ${filteredEvents.length} 个活动`);
            }

            console.log(`📊 最终搜索结果: ${filteredEvents.length} 个活动`);
            displaySearchResults(filteredEvents, keyword, category);
            updateURLParams(keyword, category);
        } else {
            throw new Error('API返回数据格式错误');
        }
    } catch (error) {
        console.error('❌ 搜索失败:', error);
        displayError('搜索失败: ' + error.message);
    } finally {
        hideLoading();
    }
}

// 显示搜索结果（新版：展开/收起模式）
function displaySearchResults(events, keyword, category) {
    console.log('📊 显示搜索结果:', events);
    
    if (!events || events.length === 0) {
        searchResultsGrid.innerHTML = '';
        noResults.classList.remove('hidden');
        
        let message = '没有找到匹配的活动';
        if (keyword || category) {
            message += '：';
            if (keyword) message += ` 关键词"${keyword}"`;
            if (category) message += ` 分类"${category}"`;
        }
        noResults.querySelector('p').textContent = message;
        
        return;
    }

    noResults.classList.add('hidden');
    
    // 更新结果标题
    let title = `找到 ${events.length} 个活动`;
    if (keyword || category) {
        title += '（';
        if (keyword) title += `关键词: "${keyword}" `;
        if (category) title += `分类: "${category}"`;
        title += '）';
    }
    resultsTitle.textContent = title;

    // 显示活动卡片（使用新的展开/收起模式）
    const eventsHTML = events.map(event => {
        // 确保数据存在
        const eventName = event.name || '未命名活动';
        const organisation = event.organisation_name || '未知组织';
        const description = event.description || '暂无描述';
        const location = event.location || '地点未知';
        const categoryName = event.category_name || '未分类';
        const currentAmount = event.current_amount || '0';
        const goalAmount = event.goal_amount || '0';
        const ticketPrice = event.ticket_price || '0';
        
        return `
        <div class="event-card collapsed" data-event-id="${event.id}">
            <div class="event-preview" onclick="toggleEventDetails(${event.id})">
                <div class="event-header">
                    <h3 class="event-title">${eventName}</h3>
                    <p class="event-organisation">${organisation}</p>
                </div>
                <div class="event-preview-info">
                    <div class="preview-details">
                        <div class="preview-location">
                            <span>📍</span>
                            <span>${location}</span>
                        </div>
                        <div class="preview-date">
                            <span>📅</span>
                            <span>${formatDate(event.event_date)} ${event.event_time || ''}</span>
                        </div>
                    </div>
                    <div class="preview-actions">
                        <div class="ticket-price">
                            ${ticketPrice === '0.00' ? '免费' : `$${formatCurrency(ticketPrice)}`}
                        </div>
                    </div>
                </div>
            </div>
            <div class="event-body">
                <p class="event-description">${description}</p>
                <div class="event-details">
                    <div class="event-detail">
                        <span>📅</span>
                        <span>${formatDate(event.event_date)} ${event.event_time || ''}</span>
                    </div>
                    <div class="event-detail">
                        <span>📍</span>
                        <span>${location}</span>
                    </div>
                    <div class="event-detail">
                        <span>🏷️</span>
                        <span>${categoryName}</span>
                    </div>
                    <div class="event-detail">
                        <span>👥</span>
                        <span>${organisation}</span>
                    </div>
                </div>
                <div class="event-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${calculateProgress(currentAmount, goalAmount)}%"></div>
                    </div>
                    <div class="progress-text">
                        <span>已筹: $${formatCurrency(currentAmount)}</span>
                        <span>目标: $${formatCurrency(goalAmount)}</span>
                    </div>
                </div>
                <div class="event-footer">
                    <div class="ticket-price">
                        ${ticketPrice === '0.00' ? '免费' : `$${formatCurrency(ticketPrice)}`}
                    </div>
                    <div>
                        <button class="view-details expanded" onclick="toggleEventDetails(${event.id})">
                            收起详情
                        </button>
                        <button class="view-details" onclick="viewEventDetails(${event.id})">
                            更多信息
                        </button>
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join('');

    searchResultsGrid.innerHTML = eventsHTML;
    console.log('✅ 搜索结果渲染完成');
}

// 切换活动详情展开/收起
function toggleEventDetails(eventId) {
    const eventCard = document.querySelector(`.event-card[data-event-id="${eventId}"]`);
    if (eventCard) {
        const isExpanded = eventCard.classList.contains('expanded');
        
        if (isExpanded) {
            // 收起详情
            eventCard.classList.remove('expanded');
            eventCard.classList.add('collapsed');
        } else {
            // 展开详情
            eventCard.classList.remove('collapsed');
            eventCard.classList.add('expanded');
        }
    }
}

// 查看活动详情
function viewEventDetails(eventId) {
    // 阻止事件冒泡，避免触发toggleEventDetails
    event.stopPropagation();
    
    alert(`查看活动详情 ID: ${eventId}\n\n在实际应用中，这里会显示活动的完整信息、注册表单等。`);
}

// 显示错误信息
function displayError(message) {
    searchResultsGrid.innerHTML = `
        <div class="error-message">
            <p>${message}</p>
            <button onclick="performSearch()" class="retry-button">重试搜索</button>
        </div>
    `;
    noResults.classList.add('hidden');
}

// 更新 URL 参数
function updateURLParams(keyword, category) {
    const params = new URLSearchParams();
    if (keyword) params.set('q', keyword);
    if (category) params.set('category', category);
    
    const newURL = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
    window.history.replaceState({}, '', newURL);
    console.log('🔗 URL已更新:', newURL);
}

// 清除搜索条件
function clearSearch() {
    searchKeyword.value = '';
    searchCategory.value = '';
    searchResultsGrid.innerHTML = '';
    noResults.classList.add('hidden');
    resultsTitle.textContent = '请输入搜索条件';
    
    // 清除URL参数
    window.history.replaceState({}, '', window.location.pathname);
    console.log('🧹 搜索条件已清除');
}

// 工具函数
function formatDate(dateString) {
    try {
        if (!dateString) return '日期未知';
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        return dateString;
    }
}

function formatCurrency(amount) {
    try {
        if (!amount) return '0';
        return parseFloat(amount).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    } catch (error) {
        return amount;
    }
}

function calculateProgress(current, goal) {
    try {
        const currentNum = parseFloat(current) || 0;
        const goalNum = parseFloat(goal) || 1;
        return Math.min((currentNum / goalNum) * 100, 100);
    } catch (error) {
        return 0;
    }
}

function showLoading() {
    loading.classList.remove('hidden');
    console.log('⏳ 显示加载中...');
}

function hideLoading() {
    loading.classList.add('hidden');
    console.log('✅ 隐藏加载中');
}

// 添加键盘事件
searchKeyword.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        console.log('↵ 回车键触发搜索');
        performSearch();
    }
});

// 添加分类变化事件（自动搜索）
searchCategory.addEventListener('change', function() {
    if (searchCategory.value) {
        console.log('🏷️ 分类变化触发搜索');
        performSearch();
    }
});