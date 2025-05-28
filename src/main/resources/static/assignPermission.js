const userid = new URLSearchParams(window.location.search).get('userid');

function renderRoleCheckboxes(selectedRoles, dynamicRoles) {
    const container = document.getElementById('roleCheckboxes');
    container.innerHTML = '';
    // 固定角色
    const fixedRoles = [
        { name: '管理员' },
        { name: '操作员' }
    ];
    fixedRoles.forEach(role => {
        const label = document.createElement('label');
        label.style.marginRight = '16px';
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.name = 'role';
        cb.value = role.name;
        if (selectedRoles && selectedRoles.includes(role.name)) cb.checked = true;
        label.appendChild(cb);
        label.appendChild(document.createTextNode(role.name));
        container.appendChild(label);
    });
    // 动态角色
    if (dynamicRoles && dynamicRoles.length > 0) {
        dynamicRoles.forEach(role => {
            const label = document.createElement('label');
            label.style.marginRight = '16px';
            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.name = 'role';
            cb.value = role.name;
            if (selectedRoles && selectedRoles.includes(role.name)) cb.checked = true;
            label.appendChild(cb);
            label.appendChild(document.createTextNode(role.name));
            container.appendChild(label);
        });
    }
}

window.addEventListener('DOMContentLoaded', async () => {
    // TODO: 后端需要实现 GET /api/permission/userinfo?userid=xxx
    let selectedRoles = [];
    fetch(`/api/permission/userinfo?userid=${userid}`)
        .then(res => res.json())
        .then(data => {
            document.getElementById('username').textContent = data.username || '未知用户';
            selectedRoles = data.roles || [];
            // 动态加载角色
            fetch('/api/role/list')
                .then(res => res.json())
                .then(roleList => {
                    // 过滤掉管理员和操作员
                    const dynamicRoles = roleList.filter(r => r.name !== '管理员' && r.name !== '操作员');
                    renderRoleCheckboxes(selectedRoles, dynamicRoles);
                })
                .catch(() => {
                    renderRoleCheckboxes(selectedRoles, []);
                });
        })
        .catch(() => {
            document.getElementById('username').textContent = '加载失败';
            renderRoleCheckboxes([], []);
        });
});

function resetForm() {
    // 重新加载当前页面
    window.location.reload();
}

// TODO: 后端需要实现 POST /api/permission/assign
function submitAssign() {
    const roles = Array.from(document.querySelectorAll('input[name=role]:checked')).map(cb => cb.value);
    if (roles.length === 0) {
        document.getElementById('errorMsg').textContent = '请至少选择一个权限';
        document.getElementById('errorMsg').style.display = 'block';
        return;
    }
    fetch('/api/permission/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userid, roles })
    })
    .then(res => res.json())
    .then(result => {
        if (result.success) {
            document.getElementById('successMsg').style.display = 'block';
            document.getElementById('errorMsg').style.display = 'none';
        } else {
            document.getElementById('errorMsg').textContent = result.message || '分配失败！';
            document.getElementById('errorMsg').style.display = 'block';
            document.getElementById('successMsg').style.display = 'none';
        }
    })
    .catch(() => {
        document.getElementById('errorMsg').textContent = '系统异常，分配失败！';
        document.getElementById('errorMsg').style.display = 'block';
        document.getElementById('successMsg').style.display = 'none';
    });
} 