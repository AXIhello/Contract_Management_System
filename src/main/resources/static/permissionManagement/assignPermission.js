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
        if (!userRes.ok) {
            if (userData.code === 403) throw new Error("权限不足，无法起草合同");
            else if (userData.code === 401) throw new Error("未登录或登录已过期，请重新登录");
            else throw new Error(userData.msg || "请求失败");
        }

        document.getElementById('username').textContent = userData.username || '未知用户';
        selectedRoles = userData.roleNames || [];

        const roleRes = await fetch('/api/role/list');
        const roleList = await roleRes.json();
        if (!roleRes.ok) {
            if (roleList.code === 403) throw new Error("权限不足，无法起草合同");
            else if (roleList.code === 401) throw new Error("未登录或登录已过期，请重新登录");
            else throw new Error(roleList.msg || "请求失败");
        }

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
        .then(res => {
            return res.json().then(data => {
                if (!res.ok) {
                    if (data.code === 403) {
                        throw new Error("权限不足，无法起草合同");
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
                alert('分配成功！');
            } else {
                alert(result.message || '分配失败！');
            }
        })
        .catch(err => {
            alert(err.message || '系统异常，分配失败！');
        });

}
