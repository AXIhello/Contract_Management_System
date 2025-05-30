function resetForm() {
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('confirmPassword').value = '';
}

function submitUser() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();

    // 输入校验
    if (!username || !password || !confirmPassword) {
        alert('所有字段均为必填项');
        return;
    }

    if (password !== confirmPassword) {
        alert('两次输入的密码不一致');
        return;
    }

    fetch('/api/user/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            username: username,
            password: password,
            confirmPassword: confirmPassword
        })
    })
        .then(async (res) => {
            const rawText = await res.text();
            let result;
            try {
                result = JSON.parse(rawText);
            } catch (err) {
                console.error('返回内容不是合法 JSON：', rawText);
                throw new Error('响应格式错误，服务器可能未返回 JSON');
            }

            if (res.ok && result.code === 200) {
                alert(result.msg || '添加成功！');
                resetForm();
            } else {
                alert(result.msg || result.message || '添加失败，请联系管理员');
            }
        })
        .catch((err) => {
            console.error('提交错误:', err);
            alert('无法连接服务器，或服务器异常，请稍后重试');
        });
}
