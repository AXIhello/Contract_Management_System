let draftContracts = []; // 所有待定稿合同数据
let currentPage = 1;
const pageSize = 10;

// 页面加载时初始化
window.onload = function () {
    loadDraftContracts();
};

// 模拟从后端获取待定稿合同数据
function loadDraftContracts() {
    fetch("/api/contract/getToBeFinishedContracts")
        .then(response => {
            if (!response.ok) {
                throw new Error("网络响应失败");
            }
            return response.json();
        })
        .then(data => {
            draftContracts = data;
            renderDraftContractsTable(); // 根据你已有逻辑渲染
            updatePageInfo();            // 更新页码信息
        })
        .catch(error => {
            console.error("获取合同数据失败：", error)
        });
}

// 渲染表格
function renderDraftContractsTable() {
    const tbody = document.getElementById("draftContractBody");
    tbody.innerHTML = "";

    if (draftContracts.length === 0) {
        // 表格中显示一行提示“无待定稿合同”
        const row = document.createElement("tr");
        row.innerHTML = `<td colspan="5" style="text-align:center;">无待定稿合同</td>`;
        tbody.appendChild(row);
        return; // 结束，不渲染其他行
    }

    const start = (currentPage - 1) * pageSize;
    const end = Math.min(start + pageSize, draftContracts.length);
    const pageData = draftContracts.slice(start, end);

    pageData.forEach(contract => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${contract.id}</td>
            <td>${contract.name}</td>
            <td>${contract.drafter}</td>
            <td>${contract.draftDate}</td>
            <td><button onclick="viewContract('${contract.id}')">查看</button></td>
        `;
        tbody.appendChild(row);
    });
}

// 更新页码信息
function updatePageInfo() {
    const totalPages = Math.ceil(draftContracts.length / pageSize);
    document.getElementById("pageInfo").innerText = `共 ${totalPages} 页 ${draftContracts.length} 条`;
}

// 搜索合同
function searchDraftContracts() {
    const keyword = document.getElementById("searchInput").value.trim().toLowerCase();

    // 模拟过滤
    const filtered = draftContracts.filter(c =>
        c.id.toLowerCase().includes(keyword) ||
        c.name.toLowerCase().includes(keyword) ||
        c.drafter.toLowerCase().includes(keyword) ||
        c.draftDate.includes(keyword)
    );

    // 重置页码和数据
    currentPage = 1;
    draftContracts = filtered;
    renderDraftContractsTable();
    updatePageInfo();
}

// 分页逻辑
function nextPage() {
    const totalPages = Math.ceil(draftContracts.length / pageSize);
    if (currentPage < totalPages) {
        currentPage++;
        renderDraftContractsTable();
        updatePageInfo();
    }
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderDraftContractsTable();
        updatePageInfo();
    }
}

function goToPage(page) {
    const totalPages = Math.ceil(draftContracts.length / pageSize);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        renderDraftContractsTable();
        updatePageInfo();
    }
}

function goToLastPage() {
    currentPage = Math.ceil(draftContracts.length / pageSize);
    renderDraftContractsTable();
    updatePageInfo();
}

// 查看按钮事件（可跳转或弹窗）
function viewContract(id) {
    alert("查看合同：" + id);
    // 你可以跳转到详情页，或弹出合同信息等
}

// 模拟数据生成函数（可删除）
function generateMockDraftContracts(count) {
    const contracts = [];
    for (let i = 1; i <= count; i++) {
        contracts.push({
            id: `DRAFT-${1000 + i}`,
            name: `示例合同 ${i}`,
            drafter: `拟稿人${i % 5 + 1}`,
            draftDate: `2025-05-${(i % 28 + 1).toString().padStart(2, '0')}`
        });
    }
    return contracts;
}
