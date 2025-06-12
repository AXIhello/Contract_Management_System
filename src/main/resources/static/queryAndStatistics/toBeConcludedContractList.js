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
                <td>${c.customer}</td>
                <td>${c.beginTime?.slice(0, 10)}</td>
                <td>
                    <button onclick="viewContract('${c.id || c.contractId}')">查看</button>
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
        c.id.toLowerCase().includes(query) ||
        c.name.toLowerCase().includes(query) ||
        c.clientName.toLowerCase().includes(query) ||
        c.beginTime.includes(query)
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

// 实现查看按钮跳转逻辑
function viewContract(id) {
    if (!id) {
        alert("合同编号无效");
        return;
    }
    // 跳转到签订合同页面
    window.location.href = `/contractManagement/concludeContract.html?id=${encodeURIComponent(id)}`;
}


fetch('/api/contract/approvalConclude')
    .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
            if (data.code === 403) {
                alert("权限不足，无法起草合同");
                window.location.href = '/dashboard-user.html';
                return null;  // 停止后续执行
            } else if (data.code === 401) {
                alert("未登录或登录已过期，请重新登录");
                window.location.href = "/login.html";  // 跳登录页
                return null;
            } else {
                throw new Error(data.msg || "请求失败");
            }
        }
        return data;
    })
    .then(data => {
        if (!data) return;  // 如果之前跳转了就停止
        contracts = data;
        renderTable(contracts);
    })
    .catch(err => {
        console.error('获取待签订合同列表失败:', err);
        alert(err.message || '系统异常，获取数据失败！');
    });




