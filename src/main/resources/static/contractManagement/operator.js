// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 这里不初始化用户信息了，直接显示主界面
    // 只初始化退出按钮事件
    initLogoutButton();
});

// 初始化退出按钮事件
function initLogoutButton() {
    document.getElementById('logoutBtn').addEventListener('click', logout);
}

// 退出登录
async function logout() {
    if (confirm('确定要退出登录吗？')) {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST'
            });
            if (response.ok) {
                // 如果你之前有用 sessionStorage 储存数据，也清理一下
                sessionStorage.clear();
                window.location.href = '/login.html';
            } else {
                throw new Error('退出失败');
            }
        } catch (error) {
            console.error('退出登录失败:', error);
            alert('退出登录失败，请稍后重试');
        }
    }
}
