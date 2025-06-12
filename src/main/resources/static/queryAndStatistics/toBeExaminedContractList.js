let contracts = [];  // 存储合同数据

const pageSize = 5;
let currentPage = 1;

// 渲染表格
function renderTable(data) {
    const tbody = document.getElementById('approvalContractBody');
    tbody.innerHTML = '';

    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const pageData = data.slice(start, end);

    if (pageData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5">暂无数据</td></tr>`;
    } else {
        for (const c of pageData) {
            const row = `<tr>
                <td>${c.id}</td>
                <td>${c.name}</td>
                <td>${c.user_id}</td>
                <td>${c.customer}</td>
                <td>
                    <a href="/contractManagement/examineContract.html?id=${c.id}">审批</a>
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
    document.getElementById('approvalPageInfo').textContent = `共 ${pageCount} 页 ${total} 条`;
}

// 搜索
function searchApprovalContracts() {
    const query = document.getElementById("searchInput").value.toLowerCase();
    const filtered = contracts.filter(c =>
        c.id.toLowerCase().includes(query) ||
        c.name.toLowerCase().includes(query) ||
        c.drafter.toLowerCase().includes(query) ||
        c.date.includes(query)
    );
    currentPage = 1;
    renderTable(filtered);
}

// 分页相关函数
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

fetch('/api/contract/approvalPending')
    .then(res => {
        return res.json().then(data => {
            return data;
        });
    })
    .then(data => {
        contracts = data;
        renderTable(contracts);
    })
    .catch(err => {
        console.error('获取待审批合同列表失败:', err);
        alert(err.message || '系统异常，获取数据失败！');
    });
