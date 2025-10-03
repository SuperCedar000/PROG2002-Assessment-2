// 首页专用 JavaScript
const API_BASE_URL = '/api';

// DOM 元素
const organisationsGrid = document.getElementById('organisationsGrid');
const allEventsList = document.getElementById('allEventsList');
const upcomingEventsList = document.getElementById('upcomingEventsList');
const pastEventsList = document.getElementById('pastEventsList');
const loading = document.getElementById('loading');

// 存储活动数据
let allEvents = [];
let organisations = [];

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏠 首页初始化');
    loadOrganisations();
    loadEvents();
});

// 加载慈善组织信息
async function loadOrganisations() {
    try {
        console.log('🏢 加载组织信息...');
        
        // 模拟组织数据 - 在实际应用中可以从API获取
        organisations = [
            {
                id: 1,
                name: "Red Cross Australia",
                description: "The Australian Red Cross is part of the world's largest humanitarian network. We are a not-for-profit organisation helping people and communities in Australia and overseas.",
                email: "conxxx@.com",
                phone: "18xx xxx xxx",
                website: "https://www.xxx.xx.x"
            },
            {
                id: 2,
                name: "Cancer Council",
                description: "Cancer Council is Australia's leading cancer charity. We work across every area of every cancer, from research to prevention and support.",
                email: "info@.com",
                phone: "13 xxx x",
                website: "https://www.xxxx.xxx"
            },
            {
                id: 3,
                name: "World Wildlife Fund Australia",
                description: "WWF-Australia is part of the WWF International Network, the world's leading, independent conservation organization. We're creating a world where people live in harmony with nature.",
                email: "enxxiries@.com",
                phone: "1xxx xx 231",
                website: "https://.com"
            }
        ];

        displayOrganisations(organisations);
        
    } catch (error) {
        console.error('❌ 加载组织信息失败:', error);
        organisationsGrid.innerHTML = '<p class="error">加载组织信息失败</p>';
    }
}

// 显示慈善组织信息
function displayOrganisations(orgs) {
    const orgsHTML = orgs.map(org => `
        <div class="organisation-card">
            <h3>${org.name}</h3>
            <p>${org.description}</p>
            <div class="organisation-contact">
                <div class="contact-info">
                    <span>📧</span>
                    <span>${org.email}</span>
                </div>
                <div class="contact-info">
                    <span>📞</span>
                    <span>${org.phone}</span>
                </div>
                <div class="contact-info">
                    <span>🌐</span>
                    <a href="${org.website}" target="_blank" style="color: white;">${org.website}</a>
                </div>
            </div>
        </div>
    `).join('');

    organisationsGrid.innerHTML = orgsHTML;
    console.log('✅ 组织信息显示完成');
}

// 加载所有活动
async function loadEvents() {
    showLoading();
    try {
        console.log('📊 加载活动数据...');
        const response = await fetch(`${API_BASE_URL}/events`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ 活动数据加载成功:', data);
        
        if (data.success) {
            allEvents = data.data;
            displayAllEvents(allEvents);
            // 初始显示：所有活动都在"所有活动"列表中
            updateCategorizedEvents();
        } else {
            throw new Error('API返回失败状态');
        }
    } catch (error) {
        console.error('❌ 加载活动失败:', error);
        allEventsList.innerHTML = '<p class="error">加载活动失败</p>';
    } finally {
        hideLoading();
    }
}

// 显示所有活动列表
function displayAllEvents(events) {
    if (!events || events.length === 0) {
        allEventsList.innerHTML = '<p class="empty-message">暂无活动数据</p>';
        return;
    }

    const eventsHTML = events.map(event => `
        <div class="event-item" data-event-id="${event.id}">
            <span class="event-name">${event.name}</span>
            <div class="event-actions">
                <button class="status-btn status-upcoming" onclick="moveToUpcoming(${event.id})">
                    即将到来
                </button>
                <button class="status-btn status-past" onclick="moveToPast(${event.id})">
                    已结束
                </button>
                <a href="index.html#event-${event.id}" class="details-btn">
                    详情
                </a>
            </div>
        </div>
    `).join('');

    allEventsList.innerHTML = eventsHTML;
    console.log('✅ 所有活动列表显示完成');
}

// 移动到即将到来活动
function moveToUpcoming(eventId) {
    const eventItem = document.querySelector(`.event-item[data-event-id="${eventId}"]`);
    if (eventItem) {
        // 从所有活动列表中移除
        eventItem.remove();
        
        // 添加到即将到来活动列表
        const event = allEvents.find(e => e.id === eventId);
        if (event) {
            const upcomingHTML = `
                <div class="event-item" data-event-id="${eventId}">
                    <span class="event-name">${event.name}</span>
                    <div class="event-actions">
                        <button class="status-btn status-past" onclick="moveToPast(${eventId})">
                            已结束
                        </button>
                        <a href="index.html#event-${eventId}" class="details-btn">
                            详情
                        </a>
                    </div>
                </div>
            `;
            upcomingEventsList.insertAdjacentHTML('beforeend', upcomingHTML);
        }
        
        updateEmptyStates();
    }
}

// 移动到已结束活动
function moveToPast(eventId) {
    const eventItem = document.querySelector(`.event-item[data-event-id="${eventId}"]`);
    if (eventItem) {
        // 从当前列表中移除
        eventItem.remove();
        
        // 添加到已结束活动列表
        const event = allEvents.find(e => e.id === eventId);
        if (event) {
            const pastHTML = `
                <div class="event-item" data-event-id="${eventId}">
                    <span class="event-name">${event.name}</span>
                    <div class="event-actions">
                        <button class="status-btn status-upcoming" onclick="moveToUpcoming(${eventId})">
                            即将到来
                        </button>
                        <a href="index.html#event-${eventId}" class="details-btn">
                            详情
                        </a>
                    </div>
                </div>
            `;
            pastEventsList.insertAdjacentHTML('beforeend', pastHTML);
        }
        
        updateEmptyStates();
    }
}

// 更新分类活动显示
function updateCategorizedEvents() {
    // 初始状态：清空分类列表
    upcomingEventsList.innerHTML = '';
    pastEventsList.innerHTML = '';
    updateEmptyStates();
}

// 更新空状态显示
function updateEmptyStates() {
    // 检查所有活动列表是否为空
    if (allEventsList.children.length === 0) {
        allEventsList.innerHTML = '<p class="empty-message">所有活动已分类</p>';
    }
    
    // 检查即将到来活动列表是否为空
    if (upcomingEventsList.children.length === 0) {
        upcomingEventsList.innerHTML = '<p class="empty-message">暂无即将到来活动</p>';
    }
    
    // 检查已结束活动列表是否为空
    if (pastEventsList.children.length === 0) {
        pastEventsList.innerHTML = '<p class="empty-message">暂无已结束活动</p>';
    }
}

// 工具函数
function showLoading() {
    loading.classList.remove('hidden');
    console.log('⏳ 显示加载中...');
}

function hideLoading() {
    loading.classList.add('hidden');
    console.log('✅ 隐藏加载中');
}
// 在 home.js 文件末尾添加这些函数

// 加载活动管理面板
async function loadEventManagement() {
    try {
        console.log('🔄 加载活动管理面板...');
        
        // 获取所有活动（不包括暂停的）
        const activeResponse = await fetch('/api/events');
        const activeData = await activeResponse.json();
        
        // 获取暂停的活动
        const pausedResponse = await fetch('/api/events/paused');
        const pausedData = await pausedResponse.json();
        
        if (activeData.success && pausedData.success) {
            displayActiveEvents(activeData.data);
            displayPausedEvents(pausedData.data);
        }
    } catch (error) {
        console.error('❌ 加载活动管理失败:', error);
    }
}

// 显示活动列表
function displayActiveEvents(events) {
    const activeEventsList = document.getElementById('activeEventsList');
    
    if (!events || events.length === 0) {
        activeEventsList.innerHTML = '<div class="no-events">暂无活动</div>';
        return;
    }
    
    const eventsHTML = events.map(event => `
        <div class="management-event-card" data-event-id="${event.id}">
            <div class="management-event-info">
                <h4>${event.name}</h4>
                <p>${event.category_name} • ${formatDate(event.event_date)}</p>
                <p>📍 ${event.location}</p>
            </div>
            <button class="pause-btn" onclick="pauseEvent(${event.id})">
                暂停
            </button>
        </div>
    `).join('');
    
    activeEventsList.innerHTML = eventsHTML;
}

// 显示暂停的活动
function displayPausedEvents(events) {
    const pausedEventsList = document.getElementById('pausedEventsList');
    
    if (!events || events.length === 0) {
        pausedEventsList.innerHTML = '<div class="no-events">暂无暂停的活动</div>';
        return;
    }
    
    const eventsHTML = events.map(event => `
        <div class="management-event-card paused-event-card" data-event-id="${event.id}">
            <div class="management-event-info">
                <h4>${event.name}</h4>
                <p>${event.category_name} • ${formatDate(event.event_date)}</p>
                <p>📍 ${event.location}</p>
            </div>
            <button class="resume-btn" onclick="resumeEvent(${event.id})">
                恢复
            </button>
        </div>
    `).join('');
    
    pausedEventsList.innerHTML = eventsHTML;
}

// 暂停活动
async function pauseEvent(eventId) {
    try {
        console.log(`⏸️  暂停活动 ID: ${eventId}`);
        
        const response = await fetch(`/api/events/${eventId}/pause`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ 活动暂停成功');
            // 重新加载活动管理面板
            loadEventManagement();
            // 重新加载首页的其他活动列表
            loadAllEvents();
        } else {
            alert('暂停失败: ' + result.message);
        }
    } catch (error) {
        console.error('❌ 暂停活动失败:', error);
        alert('暂停失败，请重试');
    }
}

// 恢复活动
async function resumeEvent(eventId) {
    try {
        console.log(`▶️  恢复活动 ID: ${eventId}`);
        
        const response = await fetch(`/api/events/${eventId}/resume`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ 活动恢复成功');
            // 重新加载活动管理面板
            loadEventManagement();
            // 重新加载首页的其他活动列表
            loadAllEvents();
        } else {
            alert('恢复失败: ' + result.message);
        }
    } catch (error) {
        console.error('❌ 恢复活动失败:', error);
        alert('恢复失败，请重试');
    }
}

// 工具函数 - 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// 在页面加载时调用
document.addEventListener('DOMContentLoaded', function() {
    // 原有的加载函数
    loadOrganisations();
    loadAllEvents();
    
    // 新增：加载活动管理面板
    loadEventManagement();
});