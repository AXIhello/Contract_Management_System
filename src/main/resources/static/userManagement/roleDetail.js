// 获取URL参数，添加调试信息
const roleName = new URLSearchParams(window.location.search).get('name');
console.log('URL参数 roleName:', roleName);
console.log('完整URL:', window.location.href);

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
    console.log('渲染权限，selectedPerms:', selectedPerms);

    const permList = document.getElementById('permList');
    permList.innerHTML = '';
    allPerms.forEach(group => {
        const groupDiv = document.createElement('div');
        groupDiv.innerHTML = `<span style="font-weight: bold;">${group.group}：</span><br>`;
        group.perms.forEach(perm => {
            const label = document.createElement('label');
            label.style.marginRight = '15px';
            label.style.display = 'inline-block';
            label.style.marginBottom = '5px';

            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.name = 'perm';
            cb.value = perm.value;
            cb.style.marginRight = '5px';

            if (selectedPerms && selectedPerms.includes(perm.value)) {
                cb.checked = true;
            }

            label.appendChild(cb);
            label.appendChild(document.createTextNode(perm.label));
            groupDiv.appendChild(label);
        });
        groupDiv.style.marginBottom = '15px';
        permList.appendChild(groupDiv);
    });
}

window.addEventListener('DOMContentLoaded', () => {
    // 检查是否有roleName参数
    if (!roleName) {
        document.getElementById('errorMsg').textContent = 'URL参数错误：缺少角色名称参数';
        document.getElementById('errorMsg').style.display = 'block';
        return;
    }

    console.log('开始获取角色详情，roleName:', roleName);

    // 对roleName进行URL编码
    const encodedRoleName = encodeURIComponent(roleName);
    const apiUrl = `/api/role/detail/${encodedRoleName}`;

    console.log('请求URL:', apiUrl);

    fetch(apiUrl)
        .then(async res => {
            console.log('响应状态:', res.status);
            console.log('响应头:', res.headers);

            const data = await res.json();
            console.log('响应数据:', data);

            if (!res.ok) {
                if (data.code === 403) {
                    throw new Error("权限不足，无法查询角色");
                } else if (data.code === 401) {
                    throw new Error("未登录或登录已过期，请重新登录");
                } else {
                    throw new Error(data.msg || `请求失败，状态码: ${res.status}`);
                }
            }
            return data;
        })
        .then(response => {
            console.log('开始填充表单，响应:', response);

            // 从响应中提取实际数据
            const data = response.data;
            console.log('实际数据:', data);

            // 填充角色名称
            const roleNameInput = document.getElementById('roleName');
            if (roleNameInput) {
                roleNameInput.value = data.name || '';
                console.log('设置角色名称:', data.name);
            }

            // 填充角色描述
            const roleDescInput = document.getElementById('roleDesc');
            if (roleDescInput) {
                roleDescInput.value = data.desc || '';
                console.log('设置角色描述:', data.desc);
            }

            // 渲染权限
            renderPerms(data.perms || []);

            console.log('表单填充完成');
        })
        .catch(err => {
            console.error('获取角色详情失败:', err);
            document.getElementById('errorMsg').textContent = err.message || '加载角色信息失败';
            document.getElementById('errorMsg').style.display = 'block';
        });
});

function resetForm() {
    window.location.reload();
}

async function submitEdit() {
    const name = document.getElementById('roleName').value.trim();
    const desc = document.getElementById('roleDesc').value.trim();
    const perms = Array.from(document.querySelectorAll('input[name=perm]:checked')).map(cb => cb.value);

    if (!name) {
        document.getElementById('errorMsg').textContent = '角色名称不能为空';
        document.getElementById('errorMsg').style.display = 'block';
        return;
    }

    // 确保 roleName 不为空
    const originalRoleName = new URLSearchParams(window.location.search).get('name');
    console.log('原始角色名称:', originalRoleName);
    console.log('原始角色名称长度:', originalRoleName ? originalRoleName.length : 'null');
    console.log('原始角色名称字符码:', originalRoleName ? Array.from(originalRoleName).map(c => c.charCodeAt(0)) : 'null');
    console.log('新角色名称:', name);
    console.log('新角色名称长度:', name.length);
    console.log('新角色名称字符码:', Array.from(name).map(c => c.charCodeAt(0)));

    if (!originalRoleName) {
        document.getElementById('errorMsg').textContent = 'URL参数错误：无法获取原始角色名称';
        document.getElementById('errorMsg').style.display = 'block';
        return;
    }

    const data = { oldName: originalRoleName, name, desc, perms };
    console.log('提交数据:', data);

    try {
        const res = await fetch('/api/role/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await res.json();
        console.log('提交结果:', result);

        if (!res.ok) {
            if (result.code === 403) {
                throw new Error("权限不足，无法编辑角色");
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
        console.error('提交失败:', err);
        document.getElementById('errorMsg').textContent = err.message || '系统异常，修改失败！';
        document.getElementById('errorMsg').style.display = 'block';
        document.getElementById('successMsg').style.display = 'none';
    }
}