// 页面加载完成后统一初始化
document.addEventListener('DOMContentLoaded',async  () => {
    await getCurrentUser();           // 获取当前用户信息
    initializeUserDropdown();   // 初始化右上角用户菜单
    initializeNavMenu();        // 初始化导航栏菜单
    initLogoutButton();         // 绑定退出按钮事件
});

// 初始化退出按钮事件
function initLogoutButton() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
}

async function getCurrentUser() {
    try {
        const response = await fetch('/api/user/current'); // ⬅️ 注意：改接口地址
        if (!response.ok) throw new Error('Failed to fetch user info');
        const user = await response.json();

        document.getElementById('currentUsername').textContent = user.username ?? '未知用户';
        document.getElementById('userFullName').textContent = user.username ?? '未知用户';
        document.getElementById('userRole').textContent = user.role ?? '未知角色';
    } catch (error) {
        console.error('Error fetching user info:', error);
        document.getElementById('currentUsername').textContent = '未登录';
        document.getElementById('userFullName').textContent = '未登录';
        document.getElementById('userRole').textContent = '未知';
    }
}

// 初始化用户下拉菜单
function initializeUserDropdown() {
    const userDropdown = document.getElementById('userDropdown');
    const userMenu = document.getElementById('userMenu');

    // 切换下拉菜单显示
    userDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
        userMenu.classList.toggle('show');
    });

    // 点击其他地方关闭下拉菜单
    document.addEventListener('click', () => {
        userMenu.classList.remove('show');
    });

    // 处理菜单项点击事件
    document.getElementById('userSettingsBtn').addEventListener('click', (e) => {
        e.preventDefault();
        // 跳转到用户设置页面
        window.location.href = '/userManagement/userDetail.html';
    });

    document.getElementById('switchUserBtn').addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = '/userManagement/login.html';
    });
}

// 初始化导航菜单
function initializeNavMenu() {
    document.querySelectorAll('.nav-item.dropdown').forEach(item => {
        let timeout;

        const menu = item.querySelector('.mega-menu');

        item.addEventListener('mouseenter', () => {
            clearTimeout(timeout);
            menu.style.display = 'block';
        });

        item.addEventListener('mouseleave', () => {
            timeout = setTimeout(() => {
                menu.style.display = 'none';
            }, 200); // 可调的延迟时间，防止闪退
        });

        // 防止移到子菜单时菜单关闭
        menu.addEventListener('mouseenter', () => {
            clearTimeout(timeout);
            menu.style.display = 'block';
        });

        menu.addEventListener('mouseleave', () => {
            timeout = setTimeout(() => {
                menu.style.display = 'none';
            }, 200);
        });
    });
}

// 登出功能
async function logout(e) {
    if (e) e.preventDefault();
    if (confirm('确定要退出登录吗？')) {
        try {
            const response = await fetch('/logout', { method: 'POST', credentials: 'include' });
            if (response.ok) {
                sessionStorage.clear();
                window.location.href = '/userManagement/login.html';
            } else {
                throw new Error('退出失败');
            }
        } catch (error) {
            console.error('退出登录失败:', error);
            alert('退出登录失败，请重试');
        }
    }
}


const notifications = [];

function addNotification(message, type, link = "#") {
    notifications.push({
        message,
        type,
        time: new Date().toLocaleString(),
        link
    });

    renderNotificationList();
    updateBadge();
    showBanner(message);
}

function showBanner(message) {
    const banner = document.getElementById("bannerNotification");
    const bannerMsg = document.getElementById("bannerMessage");
    bannerMsg.textContent = message;
    banner.style.display = "block";

    setTimeout(() => {
        banner.style.display = "none";
    }, 3000);
}

function renderNotificationList() {
    const list = document.getElementById("notificationList");
    list.innerHTML = "";

    notifications.forEach((notif) => {
        const item = document.createElement("a");
        item.className = "dropdown-item";
        item.href = notif.link || "#";  // 若有 link，点击跳转；否则无跳转
        item.innerHTML = `
            <i class="fas fa-info-circle me-2 text-${notif.type}"></i>
            ${notif.message}
            <br><small class="text-muted">${notif.time}</small>
        `;
        list.appendChild(item);
    });
}


function updateBadge() {
    const badge = document.getElementById("notificationBadge");
    if (notifications.length > 0) {
        badge.textContent = notifications.length;
        badge.style.display = "inline-block";
    } else {
        badge.style.display = "none";
    }
}

document.getElementById("notificationIcon").addEventListener("click", function () {
    const box = document.getElementById("notificationBox");
    box.style.display = box.style.display === "none" ? "block" : "none";
});


// 页面加载完后拉取待处理流程，生成通知
window.addEventListener("DOMContentLoaded", function () {
    fetch("/api/contract-process/pending")
        .then(res => res.json())
        .then(data => {
            const typeMap = {
                0: "定稿",
                1: "会签",
                2: "审批",
                3: "签订"
            };

            const uniqueTypes = [...new Set(data.map(item => item.type))];
            uniqueTypes.forEach(type => {
                const contract = data.find(item => item.type === type);
                if (contract) {
                    const message = `你有待${typeMap[type]}的合同，请尽快处理`;
                    let link;
                    switch (type){
                        case 0:{
                            link = `/queryAndStatistics/toBeFinalizedContractList.html`
                            break;
                        }
                        case 1:{
                            link = `/queryAndStatistics/toBeCountersignedContractList.html`
                            break;
                        }
                        case 2:{
                            link = `/queryAndStatistics/toBeExaminedContractList.html`
                            break;
                        }
                        case 3:{
                            link = `/queryAndStatistics/toBeConcludedContractList.html`
                            break;
                        }
                    }
                    addNotification(message, "info", link);
                }
            });

        })
        .catch(err => {
            console.error("获取待处理合同流程失败", err);
        });
});
