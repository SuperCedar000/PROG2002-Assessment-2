// API 基础 URL - 使用相对路径，因为现在前后端在同一域名下
const API_BASE_URL = '/api';

// DOM 元素
const eventsGrid = document.getElementById('eventsGrid');
const categoriesGrid = document.getElementById('categoriesGrid');
const categoryFilter = document.getElementById('categoryFilter');
const searchInput = document.getElementById('searchInput');
const loading = document.getElementById('loading');

// 初始化应用
document.addEventListener('DOMContentLoaded', function() {
    loadEvents();
    loadCategories();
});

// 加载所有活动
async function loadEvents() {
    showLoading();
    try {
        console.log('正在请求API:', `${API_BASE_URL}/events`);
        const response = await fetch(`${API_BASE_URL}/events`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API响应数据:', data);
        
        if (data.success) {
            displayEvents(data.data);
        } else {
            throw new Error('API返回失败状态');
        }
    } catch (error) {
        console.error('Error loading events:', error);
        eventsGrid.innerHTML = `
            <div class="error-message">
                <p>加载活动失败</p>
                <p>错误信息: ${error.message}</p>
                <p>请检查：</p>
                <ul>
                    <li>服务器是否运行 (node server.js)</li>
                    <li>API地址: ${API_BASE_URL}/events</li>
                </ul>
                <button onclick="loadEvents()" class="retry-button">重试</button>
            </div>
        `;
    } finally {
        hideLoading();
    }
}

// 加载分类
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        const data = await response.json();
        
        if (data.success) {
            displayCategories(data.data);
            populateCategoryFilter(data.data);
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// 显示活动列表（新版：展开/收起模式）
function displayEvents(events) {
    if (!events || events.length === 0) {
        eventsGrid.innerHTML = '<p class="no-events">暂无活动数据</p>';
        return;
    }

    const eventsHTML = events.map(event => `
        <div class="event-card collapsed" data-event-id="${event.id}">
            <div class="event-preview" onclick="toggleEventDetails(${event.id})">
                <div class="event-header">
                    <h3 class="event-title">${event.name}</h3>
                    <p class="event-organisation">${event.organisation_name}</p>
                </div>
                <div class="event-preview-info">
                    <div class="preview-details">
                        <div class="preview-location">
                            <span>📍</span>
                            <span>${event.location}</span>
                        </div>
                        <div class="preview-date">
                            <span>📅</span>
                            <span>${formatDate(event.event_date)} ${event.event_time}</span>
                        </div>
                    </div>
                    <div class="preview-actions">
                        <div class="ticket-price">
                            ${event.ticket_price === '0.00' ? '免费' : `$${formatCurrency(event.ticket_price)}`}
                        </div>
                    </div>
                </div>
            </div>
            <div class="event-body">
                <p class="event-description">${event.description}</p>
                <div class="event-details">
                    <div class="event-detail">
                        <span>📅</span>
                        <span>${formatDate(event.event_date)} ${event.event_time}</span>
                    </div>
                    <div class="event-detail">
                        <span>📍</span>
                        <span>${event.location}</span>
                    </div>
                    <div class="event-detail">
                        <span>🏷️</span>
                        <span>${event.category_name}</span>
                    </div>
                    <div class="event-detail">
                        <span>👥</span>
                        <span>${event.organisation_name}</span>
                    </div>
                </div>
                <div class="event-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${calculateProgress(event.current_amount, event.goal_amount)}%"></div>
                    </div>
                    <div class="progress-text">
                        <span>已筹: $${formatCurrency(event.current_amount)}</span>
                        <span>目标: $${formatCurrency(event.goal_amount)}</span>
                    </div>
                </div>
                <div class="event-footer">
                    <div class="ticket-price">
                        ${event.ticket_price === '0.00' ? '免费' : `$${formatCurrency(event.ticket_price)}`}
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
    `).join('');

    eventsGrid.innerHTML = eventsHTML;
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

// 查看活动详情（跳转到详情页或显示模态框）
function viewEventDetails(eventId) {
    // 阻止事件冒泡，避免触发toggleEventDetails
    event.stopPropagation();
    
    alert(`查看活动详情 ID: ${eventId}\n\n在实际应用中，这里会跳转到活动详情页面或显示模态框。`);
    
    // 示例：在控制台显示活动详情
    console.log(`查看活动详情: ${eventId}`);
}

// 显示分类
function displayCategories(categories) {
    const categoriesHTML = categories.map(category => `
        <div class="category-card" onclick="filterByCategory('${category.name}')">
            <h3>${category.name}</h3>
        </div>
    `).join('');

    categoriesGrid.innerHTML = categoriesHTML;
}

// 填充分类筛选下拉框
function populateCategoryFilter(categories) {
    const optionsHTML = categories.map(category => `
        <option value="${category.name}">${category.name}</option>
    `).join('');

    categoryFilter.innerHTML = '<option value="">所有分类</option>' + optionsHTML;
}

// 主页快速搜索功能
async function searchEvents() {
    const searchTerm = searchInput.value.trim();
    const selectedCategory = categoryFilter.value;

    if (!searchTerm && !selectedCategory) {
        // 如果没有搜索条件，显示所有活动
        loadEvents();
        return;
    }

    showLoading();

    try {
        const response = await fetch(`${API_BASE_URL}/events`);
        const data = await response.json();
        
        if (data.success) {
            let filteredEvents = data.data;

            // 应用搜索条件
            if (searchTerm) {
                filteredEvents = filteredEvents.filter(event => 
                    event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    event.description.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }

            // 应用分类筛选
            if (selectedCategory) {
                filteredEvents = filteredEvents.filter(event => 
                    event.category_name === selectedCategory
                );
            }

            displayEvents(filteredEvents);
            
            // 更新页面标题显示搜索结果
            const eventsTitle = document.querySelector('.events-section h2');
            if (searchTerm || selectedCategory) {
                eventsTitle.textContent = `搜索结果 (${filteredEvents.length} 个活动)`;
            } else {
                eventsTitle.textContent = '所有活动';
            }
        }
    } catch (error) {
        console.error('Error searching events:', error);
    } finally {
        hideLoading();
    }
}

// 按分类筛选
function filterByCategory(categoryName) {
    categoryFilter.value = categoryName;
    searchEvents();
}

// 工具函数
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatCurrency(amount) {
    return parseFloat(amount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function calculateProgress(current, goal) {
    const currentNum = parseFloat(current);
    const goalNum = parseFloat(goal);
    return Math.min((currentNum / goalNum) * 100, 100);
}

function showLoading() {
    loading.classList.remove('hidden');
}

function hideLoading() {
    loading.classList.add('hidden');
}

// 添加搜索输入框的键盘事件
searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchEvents();
    }
});

// 添加分类筛选的变化事件
categoryFilter.addEventListener('change', searchEvents);

// 重置搜索条件
function resetSearch() {
    searchInput.value = '';
    categoryFilter.value = '';
    loadEvents();
    document.querySelector('.events-section h2').textContent = '所有活动';
}