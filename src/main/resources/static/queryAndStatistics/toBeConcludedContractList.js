let contracts = [];  // 存储待签订合同数据

const pageSize = 5;
let currentPage = 1;

// 渲染表格
function renderTable(data) {
    const tbody = document.getElementById('toBeSignedBody');
    tbody.innerHTML = '';

    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const pageData = data.slice(start, end);

    if (pageData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5">暂无待签订合同</td></tr>`;
    } else {
        for (const c of pageData) {
            const row = `<tr>
                <td>${c.id || c.contractId}</td>
                <td>${c.name || c.contractName}</td>
                <td>${c.party || c.partyName}</td>
                <td>${c.date || (c.createTime?.split('T')[0] || '')}</td>
                <td>
                    <button onclick="viewContract('${c.id || c.contractId}')">查看</button>
                    <button onclick="signContract('${c.id || c.contractId}')">签署</button>
                </td>
            </tr>`;
            tbody.insertAdjacentHTML("beforeend", row);
        }
    }

    updatePageInfo(data.length);
}

// 更新页码显示
function updatePageInfo(total) {
    const pageCount = Math.ceil(total / pageSize) || 1;
    document.getElementById('pageInfo').textContent = `共 ${pageCount} 页 ${total} 条`;
}

// 搜索
function searchToBeSignedContracts() {
    const query = document.getElementById("searchInput").value.toLowerCase();
    const filtered = contracts.filter(c =>
        (c.id || c.contractId || '').toLowerCase().includes(query) ||
        (c.name || c.contractName || '').toLowerCase().includes(query) ||
        (c.party || c.partyName || '').toLowerCase().includes(query) ||
        (c.date || c.createTime || '').toLowerCase().includes(query)
    );
    currentPage = 1;
    renderTable(filtered);
}

// 分页函数
function goToPage(page) {
    const pageCount = Math.ceil(contracts.length / pageSize) || 1;
    currentPage = Math.max(1, Math.min(page, pageCount));
    renderTable(contracts);
}

function prevPage() {
    goToPage(currentPage - 1);
}

function nextPage() {
    goToPage(currentPage + 1);
}

function goToLastPage() {
    const pageCount = Math.ceil(contracts.length / pageSize) || 1;
    goToPage(pageCount);
}

// 查看/签署按钮逻辑
function viewContract(id) {
    alert(`查看合同：${id}`);
}

function signContract(id) {
    alert(`签署合同：${id}`);
}

// 页面加载时获取数据
fetch('/api/contract/approvalConclude')
    .then(res => res.json())
    .then(data => {
        contracts = data;
        renderTable(contracts);
    })
    .catch(err => {
        console.error('获取待签订合同列表失败:', err);
    });


