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
            <td>${user.userId}</td>
            <td>${user.username}</td>
            <td>
                <button onclick="window.location.href='userDetail.html?id=${user.userId}'">编辑</button>
                <button onclick="confirmDelete(${user.userId}, '${user.username}')"
                        style="margin-left: 10px; background-color: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                    删除
                </button>
            </td>
        `;
        body.appendChild(row);
    }

    document.getElementById("pageInfo").textContent =
        `共 ${Math.ceil(data.length / itemsPerPage)} 页 ${data.length} 条`;
}


function confirmDelete(id, username) {
    if (confirm(`确定要删除用户：${username} 吗？`)) {
        deleteUser(id);
    }
}

function searchUsers() {
    const query = document.getElementById("searchInput").value.toLowerCase();
    const filtered = users.filter(u =>
        u.userId.toString().includes(query) ||
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

fetch('/api/user/list')
    .then(res => res.json().then(data => {
        if (!res.ok) {
            if (data.code === 403) {
                throw new Error("权限不足，无法起草合同");
            } else if (data.code === 401) {
                throw new Error("未登录或登录已过期，请重新登录");
            } else {
                throw new Error(data.msg || "请求失败");
            }
        }
        users = data;
        renderTable(users);
    }))
    .catch(err => {
        console.error('获取用户列表失败:', err.message || err);
        alert(err.message || '获取用户列表失败');
    });

function deleteUser(id) {
    fetch(`/api/user/delete/${id}`, { method: 'DELETE' })
        .then(res => res.json().then(result => {
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
                users = users.filter(u => u.userId !== id);  // 注意 userId 而不是 id
                renderTable(users);
                alert('删除成功！');
            } else {
                alert(result.message || '删除失败！');
            }
        }))
        .catch(err => {
            alert(err.message || '系统异常，删除失败！');
        });
}
