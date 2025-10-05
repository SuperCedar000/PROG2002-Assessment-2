// 配置API基础URL
const API_BASE = 'http://localhost:3000';

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 初始化事件页面...');
    loadEvents();
    loadCategories();
});

// 加载所有活动
async function loadEvents() {
    try {
        showLoading(true);
        console.log('📨 请求活动数据...');
        
        const response = await fetch(`${API_BASE}/api/events`);
        const result = await response.json();
        
        if (result.success) {
            console.log(`✅ 成功加载 ${result.data.length} 个活动`);
            displayEvents(result.data);
        } else {
            throw new Error(result.message || 'Failed to load events');
        }
    } catch (error) {
        console.error('❌ 加载活动失败:', error);
        showError('加载活动失败: ' + error.message);
    } finally {
        showLoading(false);
    }
}

// 加载分类
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE}/api/categories`);
        const result = await response.json();
        
        if (result.success) {
            console.log(`✅ 成功加载 ${result.data.length} 个分类`);
            // 如果有分类相关的功能可以在这里处理
        }
    } catch (error) {
        console.error('❌ 加载分类失败:', error);
    }
}

// 显示活动列表
function displayEvents(events) {
    const eventsGrid = document.getElementById('eventsGrid');
    if (!eventsGrid) {
        console.error('❌ 找不到eventsGrid元素');
        return;
    }
    
    if (events.length === 0) {
        eventsGrid.innerHTML = '<div class="no-events">暂无活动</div>';
        return;
    }
    
    eventsGrid.innerHTML = events.map(event => `
        <div class="event-card" onclick="toggleEventDetails(${event.id})">
            <div class="event-header">
                <h3 class="event-name">${event.name}</h3>
                <span class="event-category">${event.category_name || '未分类'}</span>
            </div>
            <div class="event-basic-info">
                <p><strong>📅 日期:</strong> ${formatDate(event.event_date)}</p>
                <p><strong>📍 地点:</strong> ${event.location}</p>
                <p><strong>🏢 组织:</strong> ${event.organisation_name || '未知组织'}</p>
            </div>
            <div class="event-details" id="eventDetails-${event.id}" style="display: none;">
                <p><strong>📝 描述:</strong> ${event.description || '暂无描述'}</p>
                <p><strong>🎯 目标金额:</strong> $${event.goal_amount || 0}</p>
                <p><strong>💰 当前金额:</strong> $${event.current_amount || 0}</p>
                <p><strong>🎫 票价:</strong> $${event.ticket_price || '免费'}</p>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${calculateProgress(event.current_amount, event.goal_amount)}%"></div>
                </div>
                <button class="register-btn" onclick="registerForEvent(${event.id})">立即报名</button>
            </div>
        </div>
    `).join('');
}

// 切换活动详情显示
function toggleEventDetails(eventId) {
    const detailsElement = document.getElementById(`eventDetails-${eventId}`);
    if (detailsElement) {
        const isVisible = detailsElement.style.display !== 'none';
        detailsElement.style.display = isVisible ? 'none' : 'block';
    }
}

// 报名参加活动
function registerForEvent(eventId) {
    alert('报名功能正在开发中，即将推出！');
    console.log(`用户尝试报名活动 ID: ${eventId}`);
}

// 计算进度百分比
function calculateProgress(current, goal) {
    if (!goal || goal === 0) return 0;
    return Math.min(100, Math.round((current / goal) * 100));
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// 显示/隐藏加载指示器
function showLoading(show) {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.style.display = show ? 'flex' : 'none';
    }
}

// 显示错误信息
function showError(message) {
    const eventsGrid = document.getElementById('eventsGrid');
    if (eventsGrid) {
        eventsGrid.innerHTML = `
            <div class="error-message">
                <p>${message}</p>
                <button class="retry-button" onclick="loadEvents()">重试</button>
            </div>
        `;
    }
}