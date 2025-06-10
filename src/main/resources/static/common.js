async function goToDashboard() {
    try {
        const response = await fetch('/api/user/current', {
            method: 'GET',
            credentials: 'include', // 保证 session / cookie 能带上
        });

        const data = await response.json();

        if (!response.ok) {
            // 权限不足或未登录等
            if (data.code === 403) {
                throw new Error("权限不足，无法起草合同");
            } else if (data.code === 401) {
                throw new Error("未登录或登录已过期，请重新登录");
            } else {
                throw new Error(data.msg || "请求失败");
            }
        }

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
