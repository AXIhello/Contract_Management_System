const pageSize = 5;
let currentPage = 1;
let filteredContracts = [];

async function loadApprovalContractsFromServer() {
    try {
        const response = await fetch('/api/contracts/approvalPending'); // 替换成你后台接口
        if (!response.ok) throw new Error(`HTTP错误: ${response.status}`);

        const result = await response.json();
        if (result.success) {
            filteredContracts = result.data || [];
            currentPage = 1;
            renderTable();
        } else {
            alert('加载数据失败：' + (result.message || '未知错误'));
        }
    } catch (error) {
        alert('获取待审批合同异常：' + error.message);
    }
}

function renderTable() {
    const tbody = document.getElementById('approvalContractBody');
    tbody.innerHTML = '';

    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const pageData = filteredContracts.slice(start, end);

    if (pageData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5">暂无数据</td></tr>`;
    } else {
        for (const c of pageData) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
        <td>${c.id}</td>
        <td>${c.name}</td>
        <td>${c.approver}</td>
        <td>${c.applyDate}</td>
        <td>
          <button onclick="viewContract('${c.id}')">查看</button>
          <button onclick="approveContract('${c.id}')">审批</button>
        </td>
      `;
            tbody.appendChild(tr);
        }
    }
    updatePageInfo();
}

function updatePageInfo() {
    const pageCount = Math.ceil(filteredContracts.length / pageSize) || 1;
    const info = document.getElementById('pageInfo');
    info.textContent = `共 ${pageCount} 页 ${filteredContracts.length} 条`;
}

function searchApprovalContracts() {
    const keyword = document.getElementById('searchInput').value.trim().toLowerCase();
    if (!keyword) {
        loadApprovalContractsFromServer();
    } else {
        filteredContracts = filteredContracts.filter(c =>
            c.id.toLowerCase().includes(keyword) ||
            c.name.toLowerCase().includes(keyword) ||
            c.approver.toLowerCase().includes(keyword) ||
            c.applyDate.includes(keyword)
        );
        currentPage = 1;
        renderTable();
    }
}

function goToPage(page) {
    const pageCount = Math.ceil(filteredContracts.length / pageSize) || 1;
    if (page < 1) page = 1;
    if (page > pageCount) page = pageCount;
    currentPage = page;
    renderTable();
}

function prevPage() {
    goToPage(currentPage - 1);
}

function nextPage() {
    goToPage(currentPage + 1);
}

function goToLastPage() {
    const pageCount = Math.ceil(filteredContracts.length / pageSize) || 1;
    goToPage(pageCount);
}

function viewContract(id) {
    alert('查看合同：' + id);
}

function approveContract(id) {
    alert('审批合同：' + id);
}

window.onload = function () {
    loadApprovalContractsFromServer();
};
