// 模拟合同数据（实际中应通过后端 API 获取）
const allContracts = [
    { id: "HT202501", name: "购销合同A", party: "中企A", date: "2025-05-01" },
    { id: "HT202502", name: "技术服务合同B", party: "科技公司B", date: "2025-05-03" },
    { id: "HT202503", name: "采购合同C", party: "供应商C", date: "2025-05-04" },
    { id: "HT202504", name: "项目合作协议D", party: "合作方D", date: "2025-05-05" },
    // ... 可添加更多数据
];

// 分页参数
let currentPage = 1;
const pageSize = 5;
let filteredContracts = [...allContracts];

// 渲染表格数据
function renderTable() {
    const tbody = document.getElementById("toBeSignedBody");
    tbody.innerHTML = "";

    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const pageData = filteredContracts.slice(start, end);

    if (pageData.length === 0) {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td colspan="5">暂无待签订合同</td>`;
        tbody.appendChild(tr);
        return;
    }

    pageData.forEach(contract => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${contract.id}</td>
            <td>${contract.name}</td>
            <td>${contract.party}</td>
            <td>${contract.date}</td>
            <td>
                <button onclick="viewContract('${contract.id}')">查看</button>
                <button onclick="signContract('${contract.id}')">签署</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    renderPageInfo();
}

// 渲染分页信息
function renderPageInfo() {
    const totalPages = Math.ceil(filteredContracts.length / pageSize);
    const pageInfo = document.getElementById("pageInfo");
    pageInfo.textContent = `共 ${totalPages} 页 ${filteredContracts.length} 条`;
}

// 翻页函数
function goToPage(page) {
    const totalPages = Math.ceil(filteredContracts.length / pageSize);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    renderTable();
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderTable();
    }
}

function nextPage() {
    const totalPages = Math.ceil(filteredContracts.length / pageSize);
    if (currentPage < totalPages) {
        currentPage++;
        renderTable();
    }
}

function goToLastPage() {
    currentPage = Math.ceil(filteredContracts.length / pageSize);
    renderTable();
}

// 搜索功能
function searchToBeSignedContracts() {
    const keyword = document.getElementById("searchInput").value.trim().toLowerCase();
    filteredContracts = allContracts.filter(contract =>
        contract.id.toLowerCase().includes(keyword) ||
        contract.name.toLowerCase().includes(keyword) ||
        contract.party.toLowerCase().includes(keyword) ||
        contract.date.toLowerCase().includes(keyword)
    );
    currentPage = 1;
    renderTable();
}

// 示例操作按钮函数
function viewContract(id) {
    alert(`查看合同：${id}`);
}

function signContract(id) {
    alert(`签署合同：${id}`);
}

// 页面加载完自动渲染
window.onload = renderTable;
