async function goToDashboard() {
    try {
        const response = await fetch('/api/user/current', {
            method: 'GET',
            credentials: 'include', // 保证 session / cookie 能带上
        });

        if (!response.ok) throw new Error('未登录或无法获取用户信息');

        const user = await response.json();

        const username = user.username ?? '';

        if (username === 'admin') {
            window.location.href = '/dashboard-admin.html';
        } else {
            window.location.href = '/dashboard-user.html';
        }

    } catch (error) {
        console.error('跳转失败:', error);
        alert('请先登录');
        window.location.href = '/userManagement/login.html';
    }
}
