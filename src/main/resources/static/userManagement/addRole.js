function resetForm() {
    document.getElementById('roleName').value = '';
    document.getElementById('roleDesc').value = '';
    document.querySelectorAll('input[name=perm]').forEach(cb => cb.checked = false);
    document.getElementById('errorMsg').style.display = 'none';
    document.getElementById('successMsg').style.display = 'none';
}

// TODO: 后端需要实现 POST /api/role/add
function submitRole() {
    const name = document.getElementById('roleName').value.trim();
    const desc = document.getElementById('roleDesc').value.trim();
    const perms = Array.from(document.querySelectorAll('input[name=perm]:checked')).map(cb => cb.value);

    if (!name) {
        document.getElementById('errorMsg').textContent = '角色名称不能为空';
        document.getElementById('errorMsg').style.display = 'block';
        return;
    }

    // 构建请求数据
    const data = { name, desc, perms };

    fetch('/api/role/add', {
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