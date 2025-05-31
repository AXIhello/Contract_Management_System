let roles = [
    { name: 'admin' },
    { name: 'operator' }
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
            <td>${role.name}</td>
            <td>
                <button onclick="window.location.href='/userManagement/roleDetail.html?name=${role.name}'">编辑</button>
            </td>
        `;
        // 右键菜单删除，admin 和 operator 不可删除
        if (role.name !== 'admin' && role.name !== 'operator') {
            row.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                if (confirm(`确定要删除角色：${role.name} 吗？`)) {
                    deleteRole(role.name);
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

// 注册时保留字检测：由后端保证不允许 admin/operator 注册

fetch('/api/role/list')
    .then(res => res.json())
    .then(data => {
        // 过滤掉 admin 和 operator，避免重复
        const dynamicRoles = data.filter(r => r.name !== 'admin' && r.name !== 'operator');
        roles = [
            { name: 'admin' },
            { name: 'operator' },
            ...dynamicRoles
        ];
        renderTable(roles);
    })
    .catch(err => { renderTable(roles); });

// 删除角色，通过 name 作为唯一标识
function deleteRole(name) {
    fetch(`/api/role/delete/${encodeURIComponent(name)}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(result => {
            if (result.success) {
                roles = roles.filter(r => r.name !== name);
                renderTable(roles);
                alert('删除成功！');
            } else {
                alert(result.message || '删除失败！');
            }
        })
        .catch(() => { alert('系统异常，删除失败！'); });
}
