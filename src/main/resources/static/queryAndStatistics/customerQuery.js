let currentPage = 1;
const pageSize = 10;
let totalRecords = 0;
let totalPages = 0;

function searchCustomers(page = 1) {
    currentPage = page;
    const name = document.getElementById("searchInput").value.trim();

    // 设置按钮等输入状态为加载中（如果有实现）
    setInputsLoading(true);

    // 这里构造分页和查询参数
    const url = `/api/customer/query?name=${encodeURIComponent(name)}&page=${page}&pageSize=${pageSize}`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                renderTable(data.data || []);
                totalRecords = data.total || 0;
                totalPages = Math.ceil(totalRecords / pageSize);
                updatePageInfo();
            } else {
                console.error("查询失败:", data.message);
                renderTable([]);
                totalRecords = 0;
                totalPages = 0;
                updatePageInfo();
            }
        })
        .catch(err => {
            console.error("请求错误:", err);
            renderTable([]);
            totalRecords = 0;
            totalPages = 0;
            updatePageInfo();
        })
        .finally(() => {
            setInputsLoading(false);
        });
}

function renderTable(customers) {
    const tbody = document.getElementById("customerBody");
    tbody.innerHTML = "";

    if (!customers || customers.length === 0) {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td colspan="9">没有找到客户数据</td>`;
        tbody.appendChild(tr);
        return;
    }

    customers.forEach(c => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
      <td>${c.num ?? ""}</td>
      <td>${c.name ?? ""}</td>
      <td>${c.address ?? ""}</td>
      <td>${c.tel ?? ""}</td>
      <td>${c.fax ?? ""}</td>
      <td>${c.code ?? ""}</td>
      <td>${c.bank ?? ""}</td>
      <td>${c.account ?? ""}</td>
      <td>${c.note ?? ""}</td>
    `;
        tbody.appendChild(tr);
    });
}

function updatePageInfo() {
    const info = document.getElementById("pageInfo");
    info.textContent = `共 ${totalPages} 页 ${totalRecords} 条`;
}

function goToPage(page) {
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    if (page === currentPage) return;
    searchCustomers(page);
}

function prevPage() {
    if (currentPage > 1) {
        searchCustomers(currentPage - 1);
    }
}

function nextPage() {
    if (currentPage < totalPages) {
        searchCustomers(currentPage + 1);
    }
}

function goToLastPage() {
    searchCustomers(totalPages);
}

// 伪函数，加载状态的按钮禁用等
function setInputsLoading(loading) {
    const input = document.getElementById("searchInput");
    const btns = document.querySelectorAll(".search-bar button");
    input.disabled = loading;
    btns.forEach(btn => (btn.disabled = loading));
}

// 初始化页面，自动加载第一页
window.onload = () => {
    searchCustomers(1);
};

// 返回主控台按钮实现
function goToDashboard() {
    window.location.href = "/dashboard.html"; // 根据实际调整
}
