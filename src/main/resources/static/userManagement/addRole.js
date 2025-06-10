function resetForm() {
    document.getElementById('roleName').value = '';
    document.getElementById('roleDesc').value = '';
    document.querySelectorAll('input[name=perm]').forEach(cb => cb.checked = false);
    // 不再处理页面上的提示元素
}

function submitRole() {
    const name = document.getElementById('roleName').value.trim();
    const desc = document.getElementById('roleDesc').value.trim();
    const perms = Array.from(document.querySelectorAll('input[name=perm]:checked')).map(cb => cb.value);

    if (!name) {
        alert('角色名称不能为空');
        return;
    }

    const data = { name, desc, perms };

    fetch('/api/role/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
        .then(res => {
            return res.json().then(data => {
                if (!res.ok) {
                    if (data.code === 403) {
                        throw new Error("权限不足，无法新增用户");
                    } else if (data.code === 401) {
                        throw new Error("未登录或登录已过期，请重新登录");
                    } else {
                        throw new Error(data.msg || "请求失败");
                    }
                }
                return data;
            });
        })
        .then(result => {
            if (result.success) {
                alert('角色添加成功！');
                resetForm(); // 可选：添加成功后清空表单
            } else {
                alert(result.msg || '添加失败！');
            }
        })
        .catch(err => {
            alert(err.message || '系统异常，添加失败！');
        });
}
