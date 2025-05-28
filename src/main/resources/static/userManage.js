let users = [];
let currentPage = 1;
const itemsPerPage = 5;

function renderTable(data) {
    const body = document.getElementById("userBody");
    body.innerHTML = "";
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageData = data.slice(start, end);
    for (const user of pageData) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.username}</td>
            <td>
                <button onclick="window.location.href='userDetail.html?id=${user.id}'">编辑</button>
            </td>
        `;
        // 右键菜单删除
        row.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            if (confirm(`确定要删除用户：${user.username} 吗？`)) {
                deleteUser(user.id);
            }
        });
        body.appendChild(row);
    }
    document.getElementById("pageInfo").textContent =
        `共 ${Math.ceil(data.length / itemsPerPage)} 页 ${data.length} 条`;
}

function searchUsers() {
    const query = document.getElementById("searchInput").value.toLowerCase();
    const filtered = users.filter(u =>
        u.id.toString().includes(query) ||
        u.username.toLowerCase().includes(query)
    );
    currentPage = 1;
    renderTable(filtered);
}

function goToPage(page) {
    const maxPage = Math.ceil(users.length / itemsPerPage);
    if (page >= 1 && page <= maxPage) {
        currentPage = page;
        renderTable(users);
    }
}
function prevPage() { if (currentPage > 1) { currentPage--; renderTable(users); } }
function nextPage() { const maxPage = Math.ceil(users.length / itemsPerPage); if (currentPage < maxPage) { currentPage++; renderTable(users); } }
function goToLastPage() { currentPage = Math.ceil(users.length / itemsPerPage); renderTable(users); }

// TODO: 后端需要实现 GET /api/user/list
fetch('/api/user/list')
    .then(res => res.json())
    .then(data => { users = data; renderTable(users); })
    .catch(err => { console.error('获取用户列表失败:', err); });

// TODO: 后端需要实现 DELETE /api/user/delete/{id}
function deleteUser(id) {
    fetch(`/api/user/delete/${id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(result => {
            if (result.success) {
                users = users.filter(u => u.id !== id);
                renderTable(users);
                alert('删除成功！');
            } else {
                alert(result.message || '删除失败！');
            }
        })
        .catch(() => { alert('系统异常，删除失败！'); });
} 