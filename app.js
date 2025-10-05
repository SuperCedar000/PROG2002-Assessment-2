// API 基础 URL - 使用相对路径，因为现在前后端在同一域名下
const API_BASE_URL = '/api';

// DOM 元素
const eventsGrid = document.getElementById('eventsGrid');
const categoriesGrid = document.getElementById('categoriesGrid');
const categoryFilter = document.getElementById('categoryFilter');
const searchInput = document.getElementById('searchInput');
const loading = document.getElementById('loading');

// 全局变量存储当前活动数据
let currentEvents = [];

// 初始化应用
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 应用初始化...');
    
    // 检查URL参数，判断是否需要显示特定活动详情
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('eventId');
    
    if (eventId) {
        console.log(`📋 检测到活动ID参数: ${eventId}`);
        loadEventDetail(eventId);
    } else {
        console.log('📋 加载所有活动列表');
        loadEvents();
    }
    
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
            currentEvents = data.data; // 保存活动数据
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

// 加载特定活动详情
async function loadEventDetail(eventId) {
    showLoading();
    try {
        console.log(`📨 加载活动详情 ID: ${eventId}`);
        const response = await fetch(`${API_BASE_URL}/events/${eventId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('活动详情响应:', data);
        
        if (data.success) {
            displayEventDetail(data.data);
        } else {
            throw new Error(data.message || '活动未找到');
        }
    } catch (error) {
        console.error('Error loading event detail:', error);
        eventsGrid.innerHTML = `
            <div class="error-message">
                <p>加载活动详情失败</p>
                <p>错误信息: ${error.message}</p>
                <button onclick="backToEventList()" class="retry-button">返回活动列表</button>
            </div>
        `;
    } finally {
        hideLoading();
    }
}

// 显示活动详情页面
function displayEventDetail(event) {
    const eventDetailHTML = `
        <div class="event-detail-view">
            <div class="detail-header">
                <button onclick="backToEventList()" class="back-button">← Back to All Activities</button>
                <h2>Activity Details</h2>
            </div>
            
            <div class="event-detail-card">
                <div class="event-header">
                    <h1 class="event-title">${event.name || 'Untitled Event'}</h1>
                    <p class="event-organisation">${event.organisation_name || 'Unknown Organization'}</p>
                </div>
                
                <p class="event-description">${event.description || 'No description available.'}</p>
                
                <div class="event-details-grid">
                    <div class="detail-item">
                        <span>📅</span>
                        <span><strong>Date & Time:</strong> ${formatDate(event.event_date)} ${event.event_time || ''}</span>
                    </div>
                    <div class="detail-item">
                        <span>📍</span>
                        <span><strong>Location:</strong> ${event.location || 'Location unknown'}</span>
                    </div>
                    <div class="detail-item">
                        <span>🏷️</span>
                        <span><strong>Category:</strong> ${event.category_name || 'Uncategorized'}</span>
                    </div>
                    <div class="detail-item">
                        <span>👥</span>
                        <span><strong>Organization:</strong> ${event.organisation_name || 'Unknown Organization'}</span>
                    </div>
                    <div class="detail-item">
                        <span>💰</span>
                        <span><strong>Ticket Price:</strong> ${event.ticket_price === '0.00' ? 'Free' : '$' + formatCurrency(event.ticket_price)}</span>
                    </div>
                </div>
                
                <div class="progress-section">
                    <h3>Fundraising Progress</h3>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${calculateProgress(event.current_amount, event.goal_amount)}%"></div>
                    </div>
                    <div class="progress-text">
                        <span>Raised: $${formatCurrency(event.current_amount)}</span>
                        <span>Goal: $${formatCurrency(event.goal_amount)}</span>
                    </div>
                </div>
                
                <div class="action-buttons">
                    <button class="register-button" onclick="registerForEvent(${event.id})">
                        Register for this Activity
                    </button>
                </div>
            </div>
        </div>
    `;
    
    eventsGrid.innerHTML = eventDetailHTML;
    
    // 更新页面标题
    document.querySelector('.events-section h2').textContent = 'Activity Details';
}

// 返回活动列表
function backToEventList() {
    // 清除URL参数
    window.history.replaceState({}, '', 'index.html');
    // 重新加载活动列表
    loadEvents();
    // 恢复页面标题
    document.querySelector('.events-section h2').textContent = 'All activities (Click on the activity card to expand and display all information)';
}

// 显示活动列表（新版：展开/收起模式）
function displayEvents(events) {
    if (!events || events.length === 0) {
        eventsGrid.innerHTML = '<p class="no-events">No activity data available</p>';
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
                            ${event.ticket_price === '0.00' ? 'free' : `$${formatCurrency(event.ticket_price)}`}
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
                        <span>Already prepared: $${formatCurrency(event.current_amount)}</span>
                        <span>Planned goals: $${formatCurrency(event.goal_amount)}</span>
                    </div>
                </div>
                <div class="event-footer">
                    <div class="ticket-price">
                        ${event.ticket_price === '0.00' ? 'free' : `$${formatCurrency(event.ticket_price)}`}
                    </div>
                    <div>
                        <button class="view-details expanded" onclick="toggleEventDetails(${event.id})">
                          Collapse  
                        </button>
                        <button class="view-details" onclick="viewEventDetails(${event.id})">
                            more
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

// 查看活动详情（跳转到详情页）
function viewEventDetails(eventId) {
    // 阻止事件冒泡，避免触发toggleEventDetails
    if (window.event) {
        window.event.stopPropagation();
        window.event.preventDefault();
    }
    
    console.log(`🔍 查看活动详情 ID: ${eventId}`);
    
    // 在当前页面跳转，添加eventId参数
    window.location.href = `index.html?eventId=${eventId}`;
}

// 注册活动
function registerForEvent(eventId) {
    alert(`Registering for Activity ID: ${eventId}\n\nIn a real application, this would open a registration form.`);
    // 在实际应用中，这里会打开注册表单
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

// 显示分类
function displayCategories(categories) {
    if (!categoriesGrid) return;
    
    const categoriesHTML = categories.map(category => `
        <div class="category-card" onclick="filterEventsByCategory('${category.name}')">
            <h3>${category.name}</h3>
        </div>
    `).join('');

    categoriesGrid.innerHTML = categoriesHTML;
}

// 按分类筛选活动 - 修复版本：使用搜索API
async function filterEventsByCategory(categoryName) {
    showLoading();
    try {
        console.log(`🏷️ 筛选分类: ${categoryName}`);
        
        // 使用搜索API来按分类筛选
        const response = await fetch(`${API_BASE_URL}/events/search?category=${encodeURIComponent(categoryName)}`);
        const data = await response.json();
        
        if (data.success) {
            displayEvents(data.data);
            
            // 更新页面标题显示筛选结果
            const eventsTitle = document.querySelector('.events-section h2');
            eventsTitle.textContent = `${categoryName} Category (${data.data.length} activities)`;
            
            console.log(`✅ Filter completed: ${data.data.length} activities`);
        } else {
            console.error('❌ API returned failure');
            displayEvents([]);
        }
    } catch (error) {
        console.error('❌ Filtering activities failed:', error);
        displayEvents([]);
    } finally {
        hideLoading();
    }
}

// 重置筛选，显示所有活动
function resetCategoryFilter() {
    loadEvents();
    const eventsTitle = document.querySelector('.events-section h2');
    eventsTitle.textContent = 'All activities (Click on the activity card to expand and display all information)';
    console.log('🔄 Reset filter, display all activities');
}

// 填充分类筛选下拉框
function populateCategoryFilter(categories) {
    if (!categoryFilter) return;
    
    const optionsHTML = categories.map(category => `
        <option value="${category.name}">${category.name}</option>
    `).join('');

    categoryFilter.innerHTML = '<option value="">All categories</option>' + optionsHTML;
}

// 工具函数
function formatDate(dateString) {
    if (!dateString) return 'Date unknown';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
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
    if (loading) loading.classList.remove('hidden');
}

function hideLoading() {
    if (loading) loading.classList.add('hidden');
}

// 重置搜索条件
function resetSearch() {
    if (searchInput) searchInput.value = '';
    if (categoryFilter) categoryFilter.value = '';
    loadEvents();
    document.querySelector('.events-section h2').textContent = 'All activities (Click on the activity card to expand and display all information)';
}