function resetForm() {
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('confirmPassword').value = '';
    document.getElementById('errorMsg').style.display = 'none';
    document.getElementById('successMsg').style.display = 'none';
}

function submitUser() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();
    const errorMsg = document.getElementById('errorMsg');
    const successMsg = document.getElementById('successMsg');

    // 输入校验
    if (!username || !password || !confirmPassword) {
        errorMsg.textContent = '所有字段均为必填项';
        errorMsg.style.display = 'block';
        successMsg.style.display = 'none';
        return;
    }

    if (password !== confirmPassword) {
        errorMsg.textContent = '两次输入的密码不一致';
        errorMsg.style.display = 'block';
        successMsg.style.display = 'none';
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
            let result;
            try {
                result = await res.json();
            } catch (err) {
                throw new Error('响应格式错误，服务器可能未返回 JSON');
            }

            if (res.ok && result.code === 200) {
                successMsg.textContent = '添加成功！';
                successMsg.style.display = 'block';
                errorMsg.style.display = 'none';
                resetForm();
            } else {
                // 显示后端返回的错误信息
                const msg = result.msg || result.message || '添加失败，请联系管理员';
                errorMsg.textContent = msg;
                errorMsg.style.display = 'block';
                successMsg.style.display = 'none';
            }
        })
        .catch((err) => {
            console.error('提交错误:', err);
            errorMsg.textContent = '无法连接服务器，或服务器异常，请稍后重试';
            errorMsg.style.display = 'block';
            successMsg.style.display = 'none';
        });
}
