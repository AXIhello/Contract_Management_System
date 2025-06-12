let currentPage = 1;
const pageSize = 10;
let totalRecords = 0;
let totalPages = 0;
let allCustomers = []; // 保存所有客户数据
let num;


function searchCustomers() {
    currentPage = 1;
    const name = document.getElementById("searchInput").value.trim();

    setInputsLoading(true);

    const url = `/api/customer/query?name=${encodeURIComponent(name)}`;

    fetch(url)
        .then(res => res.json().then(data => {
            if (!res.ok) {
                if (data.code === 403) {
                    throw new Error("权限不足，无法访问用户信息");
                } else if (data.code === 401) {
                    throw new Error("未登录或登录过期，请重新登录");
                } else {
                    throw new Error(data.msg || "请求失败");
                }
            }
            return data;
        }))
        .then(data => {

            if (data.success) {
                allCustomers = data.data || [];
                totalRecords = allCustomers.length;
                totalPages = Math.ceil(totalRecords / pageSize);
                renderTable(getPageData(currentPage));
                updatePageInfo();
            } else {
                console.error("查询失败:", data.message);
                alert(data.msg || '系统异常，获取数据失败！');
                allCustomers = [];
                totalRecords = 0;
                totalPages = 0;
                renderTable([]);
                updatePageInfo();
            }
        })
        .catch(err => {
            console.error("请求错误:", err);
            alert(err.message || '系统异常，获取用户数据失败！');
            allCustomers = [];
            totalRecords = 0;
            totalPages = 0;
            renderTable([]);
            updatePageInfo();
        })
        .finally(() => {
            setInputsLoading(false);
        });
}

function getPageData(page) {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return allCustomers.slice(start, end);
}

function renderTable(customers) {
    const tbody = document.getElementById("customerBody");
    tbody.innerHTML = "";

    if (!customers || customers.length === 0) {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td colspan="10">没有找到客户数据</td>`; // 列数改为10
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
            <td>
                <button onclick="editCustomer(${c.num})">修改</button>
                <button onclick="deleteCustomer(${c.num})">删除</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function editCustomer(id) {
    window.location.href = `../customerManagement/customerEdit.html?num=${id}`;
}

function deleteCustomer(id) {
    if (!confirm("确定要删除该客户吗？")) return;

    fetch(`/api/customer/delete/${id}`, {
        method: "DELETE"
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert("删除成功！");
                searchCustomers(); // 重新加载数据
            } else {
                alert(data.msg || "删除失败！");
            }
        })
        .catch(err => {
            console.error("删除请求失败:", err);
            alert("系统异常，删除失败！");
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
    currentPage = page;
    renderTable(getPageData(currentPage));
    updatePageInfo();
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderTable(getPageData(currentPage));
        updatePageInfo();
    }
}

function nextPage() {
    if (currentPage < totalPages) {
        currentPage++;
        renderTable(getPageData(currentPage));
        updatePageInfo();
    }
}

function goToLastPage() {
    currentPage = totalPages;
    renderTable(getPageData(currentPage));
    updatePageInfo();
}

// 加载状态切换（禁用输入框与按钮）
function setInputsLoading(loading) {
    const input = document.getElementById("searchInput");
    const btns = document.querySelectorAll(".search-bar button");
    input.disabled = loading;
    btns.forEach(btn => (btn.disabled = loading));
}

// 页面加载默认查询
window.onload = () => {
    searchCustomers();
};

// 返回主控台（可选按钮）
function goToDashboard() {
    window.location.href = "/dashboard.html";
}
