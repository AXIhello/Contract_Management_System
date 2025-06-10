async function goToDashboard() {
    try {
        const response = await fetch('/api/user/current', {
            method: 'GET',
            credentials: 'include', // 保证 session / cookie 能带上
        });

        const data = await response.json();

        fetch(`/right/isAdmin/${data.userId}`)
            .then(res => res.json())
            .then(isAdmin => {
                if (isAdmin) {
                    window.location.href = "/dashboard-admin.html";
                } else {
                    window.location.href = "/dashboard-user.html";
                }
            })
            .catch(err => {
                console.error("权限判断失败", err);
                // 权限判断失败也跳转普通页面或者给提示
                window.location.href = "/dashboard-user.html";
            });

    } catch (error) {
        console.error('跳转失败:', error);
        alert(error.message || '请先登录');
        window.location.href = '/userManagement/login.html';
    }
}
