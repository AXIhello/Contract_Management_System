const pageSize = 5;
let currentPage = 1;
let filteredContracts = []; // 过滤后数据

// 从后台接口获取数据并初始化
async function loadContractsFromServer() {
    try {
        // 假设接口返回格式: { success: true, data: [合同数组] }
        const response = await fetch('/api/contracts/pending'); // 替换成你的真实接口地址
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const result = await response.json();
        if (result.success) {
            filteredContracts = result.data || [];
            currentPage = 1;
            renderTable();
        } else {
            alert('加载数据失败：' + (result.message || '未知错误'));
        }
    } catch (error) {
        alert('获取合同列表异常：' + error.message);
    }
}

function renderTable() {
    const tbody = document.getElementById('pendingContractBody');
    tbody.innerHTML = '';

    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const pageData = filteredContracts.slice(start, end);

    if (pageData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6">暂无数据</td></tr>`;
    } else {
        for (const c of pageData) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
        <td>${c.id}</td>
        <td>${c.name}</td>
        <td>${c.customer}</td>
        <td>${c.signer}</td>
        <td>${c.date}</td>
        <td>
          <button onclick="viewContract('${c.id}')">查看</button>
          <button onclick="editContract('${c.id}')">编辑</button>
          <button onclick="signContract('${c.id}')">签订</button>
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

function searchPendingContracts() {
    const keyword = document.getElementById('searchInput').value.trim().toLowerCase();
    if (!keyword) {
        // 如果搜索为空，则重新请求服务器或使用当前所有数据
        loadContractsFromServer();
    } else {
        filteredContracts = filteredContracts.filter(c =>
            c.id.toLowerCase().includes(keyword) ||
            c.name.toLowerCase().includes(keyword) ||
            c.customer.toLowerCase().includes(keyword) ||
            c.signer.toLowerCase().includes(keyword) ||
            c.date.includes(keyword)
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

// 操作按钮示例
function viewContract(id) {
    alert('查看合同：' + id);
}

function editContract(id) {
    alert('编辑合同：' + id);
}

function signContract(id) {
    alert('签订合同：' + id);
}

window.onload = function () {
    loadContractsFromServer();
};
