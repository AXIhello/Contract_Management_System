const pageSize = 5;
let currentPage = 1;
let approvalContracts = []; // 原始数据
let filteredContracts = []; // 当前筛选后的数据

// 加载待审批合同数据
async function loadApprovalContractsFromServer() {
    try {
        const response = await fetch('/api/contracts/approvalPending'); // 替换为你的接口
        if (!response.ok) throw new Error(`HTTP错误: ${response.status}`);

        const result = await response.json();
        if (result.success) {
            approvalContracts = result.data || [];
            filteredContracts = approvalContracts;  // 初始化时默认不过滤
            currentPage = 1;
            renderTable(filteredContracts);
        } else {
            alert('加载数据失败：' + (result.message || '未知错误'));
        }
    } catch (error) {
        alert('获取待审批合同异常：' + error.message);
    }
}

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
                    <a href="/contractManagement/approval.html?id=${c.id}">审批</a>
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
function searchApprovalContracts() {
    const keyword = document.getElementById('searchInput').value.trim().toLowerCase();

    if (!keyword) {
        filteredContracts = approvalContracts;
    } else {
        filteredContracts = approvalContracts.filter(c =>
            c.id.toLowerCase().includes(keyword) ||
            c.name.toLowerCase().includes(keyword) ||
            c.user_id.toLowerCase().includes(keyword) ||
            c.customer.includes(keyword)
        );
    }

    currentPage = 1;
    renderTable(filteredContracts);
}

// 分页相关函数
function goToPage(page) {
    const pageCount = Math.ceil(filteredContracts.length / pageSize) || 1;
    currentPage = Math.max(1, Math.min(page, pageCount));
    renderTable(filteredContracts);
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

// 初始化加载
window.onload = function () {
    loadApprovalContractsFromServer();
};