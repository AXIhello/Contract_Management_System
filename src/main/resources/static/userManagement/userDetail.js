const userId = new URLSearchParams(window.location.search).get('id');

window.addEventListener('DOMContentLoaded', () => {
    fetch(`/api/user/detail/${userId}`)
        .then(res => res.json().then(data => {
            if (!res.ok) {
                if (result.code === 403) {
                    throw new Error("权限不足，无法查询用户");
                } else if (result.code === 401) {
                    throw new Error("未登录或登录已过期，请重新登录");
                } else {
                    throw new Error(result.msg || "请求失败");
                }
            }

            document.getElementById('userId').value = data.id || '';
            document.getElementById('username').value = data.username || '';
        }))
        .catch(err => {
            document.getElementById('errorMsg').textContent = err.message || '加载用户信息失败';
            document.getElementById('errorMsg').style.display = 'block';
        });
});

function resetForm() {
    window.location.reload();
}

function submitEdit() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!username) {
        document.getElementById('errorMsg').textContent = '用户名不能为空';
        document.getElementById('errorMsg').style.display = 'block';
        return;
    }
    if (password || confirmPassword) {
        if (password !== confirmPassword) {
            document.getElementById('errorMsg').textContent = '两次输入的新密码不一致';
            document.getElementById('errorMsg').style.display = 'block';
            return;
        }
    }

    const data = { userId: userId, username };
    if (password) data.password = password;

    fetch('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
        .then(res => res.json().then(result => {
            if (!res.ok) {
                if (result.code === 403) {
                    throw new Error("权限不足，无法编辑用户");
                } else if (result.code === 401) {
                    throw new Error("未登录或登录已过期，请重新登录");
                } else {
                    throw new Error(result.msg || "请求失败");
                }
            }

            if (result.success) {
                document.getElementById('successMsg').style.display = 'block';
                document.getElementById('errorMsg').style.display = 'none';
            } else {
                document.getElementById('errorMsg').textContent = result.msg || '修改失败！';
                document.getElementById('errorMsg').style.display = 'block';
                document.getElementById('successMsg').style.display = 'none';
            }
        }))
        .catch(err => {
            document.getElementById('errorMsg').textContent = err.message || '系统异常，修改失败！';
            document.getElementById('errorMsg').style.display = 'block';
            document.getElementById('successMsg').style.display = 'none';
        });
}
