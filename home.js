// 首页专用 JavaScript
const API_BASE_URL = '/api';

// DOM 元素
const organisationsGrid = document.getElementById('organisationsGrid');
const allEventsList = document.getElementById('allEventsList');
const upcomingEventsList = document.getElementById('upcomingEventsList');
const pastEventsList = document.getElementById('pastEventsList');
const pausedEventsList = document.getElementById('pausedEventsList');
const loading = document.getElementById('loading');

// 存储活动数据
let allEvents = [];
let organisations = [];

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏠 Home page initialization');
    loadOrganisations();
    loadEvents();
});

// 加载慈善组织信息
async function loadOrganisations() {
    try {
        console.log('🏢 Load organizational information...');
        
        
        organisations = [
            {
                id: 1,
                name: "Australian Charities",
                description: "The Australian Charities is part of the world's charitable aid network. It is a non-profit organization that helps people and communities in Australia and overseas.",
                email: "conxxx@.com",
                phone: "18xx xxx xxx",
                website: "https://www.xxx.xx.x"
            },
            {
                id: 2,
                name: "Poor Children Protection Program",
                description: "The Poor Children Protection Committee is a world-leading charity organization that helps children. The work covers every field, ranging from focusing on children's food and clothing as well as educational issues.",
                email: "info@.com",
                phone: "13 xxx x",
                website: "https://www.xxxx.xxx"
            },
            {
                id: 3,
                name: "World Foundation for Good",
                description: "The Public Welfare Foundation - is part of the World United Foundation's international network, a leading independent organization dedicated to protecting various public welfare causes. We are creating a world where people live in harmony with each other.",
                email: "enxxiries@.com",
                phone: "1xxx xx 231",
                website: "https://.com"
            }
        ];

        displayOrganisations(organisations);
        
    } catch (error) {
        console.error('❌ 加载组织信息失败:', error);
        organisationsGrid.innerHTML = '<p class="error">The loading activity failed.</p>';
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
        
        // 模拟活动数据，因为API可能不可用
        allEvents = [
            {
                id: 1,
                name: "Spring Charity Ball",
                status: "active"
            },
            {
                id: 2,
                name: "Annual Charity Auction",
                status: "active"
            },
            {
                id: 3,
                name: "Jazz Night for Hope",
                status: "active"
            },
            {
                id: 4,
                name: "Winter Charity Gala 2025",
                status: "active"
            }
        ];

        displayAllEvents(allEvents);
        updateCategorizedEvents();
        
    } catch (error) {
        console.error('❌ 加载活动失败:', error);
        allEventsList.innerHTML = '<p class="error">The loading activity failed.</p>';
    } finally {
        hideLoading();
    }
}

// 显示所有活动列表
function displayAllEvents(events) {
    if (!events || events.length === 0) {
        allEventsList.innerHTML = '<p class="empty-message">There is no activity data available for the moment</p>';
        return;
    }

    const eventsHTML = events.map(event => `
        <div class="event-item" data-event-id="${event.id}">
            <span class="event-name">${event.name}</span>
            <div class="event-actions">
                <button class="status-btn status-upcoming" onclick="moveToUpcoming(${event.id})">
                    Coming soon
                </button>
                <button class="status-btn status-past" onclick="moveToPast(${event.id})">
                    over
                </button>
                <a href="index.html#event-${event.id}" class="details-btn">
                    For details
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
                            over
                        </button>
                        <a href="index.html#event-${eventId}" class="details-btn">
                            For details
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
                            Coming soon
                        </button>
                        <a href="index.html#event-${eventId}" class="details-btn">
                            For details
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
    displayPausedEvents(); // 显示暂停活动
    updateEmptyStates();
}

// 显示暂停活动 - 修复这个函数
function displayPausedEvents() {
    console.log('🔄 显示暂停活动...');
    
    // 创建冬季越野自行车活动数据
    const pausedEvents = [
        {
            id: 'paused-001',
            name: 'Winter mountain biking',
            reason: 'Due to policy, irrelevant personnel are prohibited from entering the nature reserve'
        }
    ];

    if (pausedEvents.length === 0) {
        pausedEventsList.innerHTML = '<p class="empty-message">暂无暂停活动</p>';
        return;
    }

    const pausedHTML = pausedEvents.map(event => `
        <div class="event-item paused-event" data-event-id="${event.id}">
            <span class="event-name">${event.name}</span>
            <div class="event-reason">
                <span class="reason-text">${event.reason}</span>
            </div>
        </div>
    `).join('');
    
    pausedEventsList.innerHTML = pausedHTML;
    console.log('✅ 暂停活动显示完成');
}

// 更新空状态显示
function updateEmptyStates() {
    // 检查所有活动列表是否为空
    if (allEventsList.children.length === 0) {
        allEventsList.innerHTML = '<p class="empty-message">All activities have been classified</p>';
    }
    
    // 检查即将到来活动列表是否为空
    if (upcomingEventsList.children.length === 0) {
        upcomingEventsList.innerHTML = '<p class="empty-message">There are no upcoming events for now</p>';
    }
    
    // 检查已结束活动列表是否为空
    if (pastEventsList.children.length === 0) {
        pastEventsList.innerHTML = '<p class="empty-message">There are no concluded activities for the time being</p>';
    }
    
    // 检查暂停活动列表是否为空
    if (pausedEventsList.children.length === 0) {
        pausedEventsList.innerHTML = '<p class="empty-message">There is no suspension of activities for the time being</p>';
    }
}

// 工具函数
function showLoading() {
    loading.style.display = 'block';
    console.log('⏳ 显示加载中...');
}

function hideLoading() {
    loading.style.display = 'none';
    console.log('✅ 隐藏加载中');
}

// 在页面加载时调用
document.addEventListener('DOMContentLoaded', function() {
    loadOrganisations();
    loadEvents();
});