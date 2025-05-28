function resetForm() {
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('confirmPassword').value = '';
    document.getElementById('errorMsg').style.display = 'none';
    document.getElementById('successMsg').style.display = 'none';
}

// TODO: 后端需要实现 POST /api/user/add
function submitUser() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!username || !password || !confirmPassword) {
        document.getElementById('errorMsg').textContent = '所有字段均为必填项';
        document.getElementById('errorMsg').style.display = 'block';
        return;
    }
    if (password !== confirmPassword) {
        document.getElementById('errorMsg').textContent = '两次输入的密码不一致';
        document.getElementById('errorMsg').style.display = 'block';
        return;
    }

    // 构建请求数据
    const data = { username, password };

    fetch('/api/user/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(result => {
        if (result.success) {
            document.getElementById('successMsg').style.display = 'block';
            document.getElementById('errorMsg').style.display = 'none';
        } else {
            document.getElementById('errorMsg').textContent = result.message || '添加失败！';
            document.getElementById('errorMsg').style.display = 'block';
            document.getElementById('successMsg').style.display = 'none';
        }
    })
    .catch(() => {
        document.getElementById('errorMsg').textContent = '系统异常，添加失败！';
        document.getElementById('errorMsg').style.display = 'block';
        document.getElementById('successMsg').style.display = 'none';
    });
} 