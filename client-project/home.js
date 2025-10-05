// 配置API基础URL
const API_BASE = 'http://localhost:3000';

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 初始化首页...');
    loadOrganisations();
    loadAllEvents();
});

// 加载组织信息
function loadOrganisations() {
    // 硬编码的组织信息 - 可以改为从API获取
    const organisations = [
        {
            name: "Red Cross Australia",
            description: "Helping people in crisis, providing emergency assistance and support to vulnerable communities across Australia.",
            contact: "contact@redcross.org.au"
        },
        {
            name: "Cancer Council",
            description: "Leading cancer charity dedicated to cancer research, prevention, and support services for patients and families.",
            contact: "info@cancer.org.au"
        },
        {
            name: "World Wildlife Fund",
            description: "Conserving nature and reducing the most pressing threats to the diversity of life on Earth.",
            contact: "enquiries@wwf.org.au"
        }
    ];
    
    const organisationsGrid = document.getElementById('organisationsGrid');
    if (organisationsGrid) {
        organisationsGrid.innerHTML = organisations.map(org => `
            <div class="organisation-card">
                <h3>${org.name}</h3>
                <p>${org.description}</p>
                <div class="contact-info">Contact: ${org.contact}</div>
            </div>
        `).join('');
    }
}

// 加载所有活动并分类显示
async function loadAllEvents() {
    try {
        showLoading(true);
        
        const response = await fetch(`${API_BASE}/api/events`);
        const result = await response.json();
        
        if (result.success) {
            console.log(`✅ 成功加载 ${result.data.length} 个活动`);
            categorizeEvents(result.data);
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

// 分类显示活动
function categorizeEvents(events) {
    const now = new Date();
    const upcomingEvents = [];
    const pastEvents = [];
    const pausedEvents = [];
    
    events.forEach(event => {
        const eventDate = new Date(event.event_date);
        
        if (!event.is_active) {
            pausedEvents.push(event);
        } else if (eventDate >= now) {
            upcomingEvents.push(event);
        } else {
            pastEvents.push(event);
        }
    });
    
    displayEventsList('allEventsList', events, '所有活动');
    displayEventsList('upcomingEventsList', upcomingEvents, '即将到来活动');
    displayEventsList('pastEventsList', pastEvents, '已结束活动');
    displayEventsList('pausedEventsList', pausedEvents, '暂停活动');
}

// 显示活动列表
function displayEventsList(elementId, events, title) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    if (events.length === 0) {
        element.innerHTML = `<div class="no-events">暂无${title}</div>`;
        return;
    }
    
    element.innerHTML = events.map(event => `
        <div class="event-item" onclick="viewEventDetails(${event.id})">
            <div class="event-item-header">
                <h4>${event.name}</h4>
                <span class="event-status ${getEventStatus(event)}">${getStatusText(event)}</span>
            </div>
            <p><strong>日期:</strong> ${formatDate(event.event_date)}</p>
            <p><strong>地点:</strong> ${event.location}</p>
            <p><strong>分类:</strong> ${event.category_name || '未分类'}</p>
        </div>
    `).join('');
}

// 查看活动详情
function viewEventDetails(eventId) {
    // 跳转到活动详情页面或显示模态框
    window.location.href = `index.html?eventId=${eventId}`;
}

// 获取活动状态
function getEventStatus(event) {
    const now = new Date();
    const eventDate = new Date(event.event_date);
    
    if (!event.is_active) return 'paused';
    if (eventDate >= now) return 'upcoming';
    return 'past';
}

// 获取状态文本
function getStatusText(event) {
    const status = getEventStatus(event);
    switch(status) {
        case 'upcoming': return '即将开始';
        case 'past': return '已结束';
        case 'paused': return '已暂停';
        default: return '未知';
    }
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
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
    alert(message);
}