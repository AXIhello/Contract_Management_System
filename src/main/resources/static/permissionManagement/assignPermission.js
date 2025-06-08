const userId = new URLSearchParams(window.location.search).get('userId');

function renderRoleCheckboxes(selectedRoles, dynamicRoles) {
    const container = document.getElementById('roleCheckboxes');
    container.innerHTML = '';

    if (dynamicRoles && dynamicRoles.length > 0) {
        dynamicRoles.forEach(role => {
            const label = document.createElement('label');
            label.style.marginRight = '16px';

            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.name = 'role';
            cb.value = role.name;

            if (selectedRoles && selectedRoles.includes(role.name)) {
                cb.checked = true;
            }

            label.appendChild(cb);
            label.appendChild(document.createTextNode(role.name));
            container.appendChild(label);
        });
    }
}

window.addEventListener('DOMContentLoaded', async () => {
    let selectedRoles = [];

    try {
        const userRes = await fetch(`/api/right/userinfo/${userId}`);
        const userData = await userRes.json();

        document.getElementById('username').textContent = userData.username || '未知用户';
        selectedRoles = userData.roleNames || [];

        const roleRes = await fetch('/api/role/list');
        const roleList = await roleRes.json();

        renderRoleCheckboxes(selectedRoles, roleList);
    } catch (error) {
        document.getElementById('username').textContent = '加载失败';
        renderRoleCheckboxes([], []);
    }
});

function resetForm() {
    window.location.reload();
}

function submitAssign() {
    const roles = Array.from(document.querySelectorAll('input[name=role]:checked')).map(cb => cb.value);

    if (roles.length === 0) {
        alert('请至少选择一个权限');
        return;
    }

    fetch('/api/right/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, roles })
    })
        .then(res => res.json())
        .then(result => {
            if (result.success) {
                alert('分配成功！');
            } else {
                alert(result.message || '分配失败！');
            }
        })
        .catch(() => {
            alert('系统异常，分配失败！');
        });
}
