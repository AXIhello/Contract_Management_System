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
            <td>${item.rolename}</td>
            <td><a href="assignPermission.html?userid=${item.userid}">授权</a></td>
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

// TODO: 后端需要实现 GET /api/permission/userlist
fetch('/api/permission/userlist')
    .then(res => res.json())
    .then(data => { userPerms = data; renderTable(userPerms); })
    .catch(err => { console.error('获取用户权限列表失败:', err); });

// TODO: 分配权限页面需要动态获取角色列表，管理员和操作员为固定项，其他角色从/api/role/list获取
window.roleListForPermission = async function() {
    let roles = [
        { id: 1, name: '管理员' },
        { id: 2, name: '操作员' }
    ];
    try {
        const res = await fetch('/api/role/list');
        const data = await res.json();
        // 过滤掉管理员和操作员，避免重复
        const dynamicRoles = data.filter(r => r.name !== '管理员' && r.name !== '操作员');
        roles = roles.concat(dynamicRoles);
    } catch (e) {
        // ignore, 只用默认角色
    }
    return roles;
} 