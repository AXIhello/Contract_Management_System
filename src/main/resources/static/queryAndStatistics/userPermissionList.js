let userPerms = [];
let currentPage = 1;
const itemsPerPage = 5;

function renderTable(data) {
    const body = document.getElementById("userPermBody");
    body.innerHTML = "";
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageData = data.slice(start, end);
    for (const item of pageData) {
        const row = `<tr>
            <td>${item.username}</td>
            <td>${item.roleNames}</td>
            <td><a href="/permissionManagement/assignPermission.html?userId=${item.userId}">授权</a></td>
        </tr>`;
        body.insertAdjacentHTML("beforeend", row);
    }
    document.getElementById("pageInfo").textContent =
        `共 ${Math.ceil(data.length / itemsPerPage)} 页 ${data.length} 条`;
}
function goToPage(page) {
    const maxPage = Math.ceil(userPerms.length / itemsPerPage);
    if (page >= 1 && page <= maxPage) {
        currentPage = page;
        renderTable(userPerms);
    }
}
function prevPage() { if (currentPage > 1) { currentPage--; renderTable(userPerms); } }
function nextPage() { const maxPage = Math.ceil(userPerms.length / itemsPerPage); if (currentPage < maxPage) { currentPage++; renderTable(userPerms); } }
function goToLastPage() { currentPage = Math.ceil(userPerms.length / itemsPerPage); renderTable(userPerms); }

fetch('/api/right/list')
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
    .then(data => {
        userPerms = data;
        renderTable(userPerms);
    })
    .catch(err => {
        console.error('获取用户权限列表失败:', err);
        alert(err.message || '系统异常，获取用户权限列表失败');
    });

window.roleListForPermission = async function() {
    let roles = [
        { id: 1, name: '管理员' },
        { id: 2, name: '操作员' }
    ];
    try {
        const res = await fetch('/api/role/list');
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

        // 过滤掉管理员和操作员，避免重复
        const dynamicRoles = data.filter(r => r.name !== '管理员' && r.name !== '操作员');
        roles = roles.concat(dynamicRoles);
    } catch (e) {
        console.error('获取角色列表失败:', e);
        // ignore, 只用默认角色
    }
    return roles;
}
