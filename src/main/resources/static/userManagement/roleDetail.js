const roleName = new URLSearchParams(window.location.search).get('name');

const allPerms = [
    { group: '合同管理', perms: [
        { value: 'draft_contract', label: '起草合同' },
        { value: 'finalize_contract', label: '定稿合同' },
        { value: 'query_contract', label: '查询合同' },
        { value: 'delete_contract', label: '删除合同' },
    ]},
    { group: '流程管理', perms: [
        { value: 'countersign_contract', label: '会签合同' },
        { value: 'approve_contract', label: '审批合同' },
        { value: 'sign_contract', label: '签订合同' },
        { value: 'assign_countersign', label: '分配会签' },
        { value: 'assign_approve', label: '分配审批' },
        { value: 'assign_sign', label: '分配签订' },
        { value: 'query_process', label: '流程查询' },
    ]},
    { group: '用户管理', perms: [
        { value: 'add_user', label: '新增用户' },
        { value: 'edit_user', label: '编辑用户' },
        { value: 'query_user', label: '查询用户' },
        { value: 'delete_user', label: '删除用户' },
    ]},
    { group: '角色管理', perms: [
        { value: 'add_role', label: '新增角色' },
        { value: 'edit_role', label: '编辑角色' },
        { value: 'query_role', label: '查询角色' },
        { value: 'delete_role', label: '删除角色' },
    ]},
    { group: '功能操作', perms: [
        { value: 'add_func', label: '新增功能' },
        { value: 'edit_func', label: '编辑功能' },
        { value: 'query_func', label: '查询功能' },
        { value: 'delete_func', label: '删除功能' },
    ]},
    { group: '权限管理', perms: [
        { value: 'assign_perm', label: '配置权限' },
    ]},
    { group: '客户管理', perms: [
        { value: 'add_client', label: '新增客户' },
        { value: 'edit_client', label: '编辑客户' },
        { value: 'query_client', label: '查询客户' },
        { value: 'delete_client', label: '删除客户' },
    ]},
];

function renderPerms(selectedPerms) {
    const permList = document.getElementById('permList');
    permList.innerHTML = '';
    allPerms.forEach(group => {
        const groupDiv = document.createElement('div');
        groupDiv.innerHTML = `<span>${group.group}：</span>`;
        group.perms.forEach(perm => {
            const label = document.createElement('label');
            label.style.marginRight = '10px';
            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.name = 'perm';
            cb.value = perm.value;
            if (selectedPerms && selectedPerms.includes(perm.value)) cb.checked = true;
            label.appendChild(cb);
            label.appendChild(document.createTextNode(perm.label));
            groupDiv.appendChild(label);
        });
        permList.appendChild(groupDiv);
    });
}

window.addEventListener('DOMContentLoaded', () => {
    fetch(`/api/role/detail/${roleName}`)
        .then(async res => {
            const data = await res.json();
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
        })
        .then(data => {
            document.getElementById('roleName').value = data.name || '';
            document.getElementById('roleDesc').value = data.desc || '';
            renderPerms(data.perms || []);
        })
        .catch(err => {
            document.getElementById('errorMsg').textContent = err.message || '加载角色信息失败';
            document.getElementById('errorMsg').style.display = 'block';
        });
});

function resetForm() {
    window.location.reload();
}

// TODO: 后端需要实现 POST /api/role/update
async function submitEdit() {
    const name = document.getElementById('roleName').value.trim();
    const desc = document.getElementById('roleDesc').value.trim();
    const perms = Array.from(document.querySelectorAll('input[name=perm]:checked')).map(cb => cb.value);
    if (!name) {
        document.getElementById('errorMsg').textContent = '角色名称不能为空';
        document.getElementById('errorMsg').style.display = 'block';
        return;
    }
    const data = { name, desc, perms };
    try {
        const res = await fetch('/api/role/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await res.json();
        if (!res.ok) {
            if (result.code === 403) {
                throw new Error("权限不足，无法起草合同");
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
            document.getElementById('errorMsg').textContent = result.message || '修改失败！';
            document.getElementById('errorMsg').style.display = 'block';
            document.getElementById('successMsg').style.display = 'none';
        }
    } catch (err) {
        document.getElementById('errorMsg').textContent = err.message || '系统异常，修改失败！';
        document.getElementById('errorMsg').style.display = 'block';
        document.getElementById('successMsg').style.display = 'none';
    }
}