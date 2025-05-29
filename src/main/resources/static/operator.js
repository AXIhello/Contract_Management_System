// 页面加载完成后统一初始化
document.addEventListener('DOMContentLoaded', () => {
    getCurrentUser();           // 获取当前用户信息
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
        const response = await fetch('/api/user/current-id');
        if (!response.ok) throw new Error('Failed to fetch user id');
        const userId = await response.json();

        document.getElementById('currentUsername').textContent = `用户${userId}`;
        document.getElementById('userFullName').textContent = `用户${userId}`;
        document.getElementById('userRole').textContent = '普通用户';
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
            const response = await fetch('/api/user/logout', { method: 'POST' });
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
