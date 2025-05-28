let roles = [
    { id: 1, name: '管理员', fixed: true },
    { id: 2, name: '操作员', fixed: true }
];
let currentPage = 1;
const itemsPerPage = 5;

function renderTable(data) {
    const body = document.getElementById("roleBody");
    body.innerHTML = "";
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageData = data.slice(start, end);
    for (const role of pageData) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${role.id}</td>
            <td>${role.name}</td>
            <td>
                <button onclick="window.location.href='roleDetail.html?id=${role.id}'">编辑</button>
            </td>
        `;
        // 右键菜单删除，管理员和操作员不可删除
        if (!role.fixed) {
            row.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                if (confirm(`确定要删除角色：${role.name} 吗？`)) {
                    deleteRole(role.id);
                }
            });
        }
        body.appendChild(row);
    }
    document.getElementById("pageInfo").textContent =
        `共 ${Math.ceil(data.length / itemsPerPage)} 页 ${data.length} 条`;
}

function searchRoles() {
    const query = document.getElementById("searchInput").value.toLowerCase();
    const filtered = roles.filter(r =>
        r.id.toString().includes(query) ||
        r.name.toLowerCase().includes(query)
    );
    currentPage = 1;
    renderTable(filtered);
}

function goToPage(page) {
    const maxPage = Math.ceil(roles.length / itemsPerPage);
    if (page >= 1 && page <= maxPage) {
        currentPage = page;
        renderTable(roles);
    }
}
function prevPage() { if (currentPage > 1) { currentPage--; renderTable(roles); } }
function nextPage() { const maxPage = Math.ceil(roles.length / itemsPerPage); if (currentPage < maxPage) { currentPage++; renderTable(roles); } }
function goToLastPage() { currentPage = Math.ceil(roles.length / itemsPerPage); renderTable(roles); }

// TODO: 后端需要实现 GET /api/role/list
fetch('/api/role/list')
    .then(res => res.json())
    .then(data => {
        // 过滤掉管理员和操作员，避免重复
        const dynamicRoles = data.filter(r => r.name !== '管理员' && r.name !== '操作员');
        roles = [
            { id: 1, name: '管理员', fixed: true },
            { id: 2, name: '操作员', fixed: true },
            ...dynamicRoles
        ];
        renderTable(roles);
    })
    .catch(err => { renderTable(roles); });

// TODO: 后端需要实现 DELETE /api/role/delete/{id}
function deleteRole(id) {
    fetch(`/api/role/delete/${id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(result => {
            if (result.success) {
                roles = roles.filter(r => r.id !== id);
                renderTable(roles);
                alert('删除成功！');
            } else {
                alert(result.message || '删除失败！');
            }
        })
        .catch(() => { alert('系统异常，删除失败！'); });
} 