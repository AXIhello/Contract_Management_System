let contracts = [];  // 所有合同数据
let currentPage = 1;
const pageSize = 5;

// 统一获取合同数据
function loadContracts() {
    fetch('/api/contract/list')
        .then(res => res.json().then(data => {
            if (!res.ok) {
                if (data.code === 403) {
                    throw new Error("权限不足，无法访问合同信息");
                } else if (data.code === 401) {
                    throw new Error("未登录或登录过期，请重新登录");
                } else {
                    throw new Error(data.msg || "请求失败");
                }
            }
            return data;
        }))
        .then(data => {
            //页面加载时显示全部合同
            contracts = data;
            currentPage = 1;
            renderTable(contracts);
        })
        .catch(err => {
            console.error('合同数据获取失败:', err);
            alert(err.message || '系统异常，获取数据失败！');
        });
}

// 显示合同列表
function renderTable(data) {
    const tbody = document.querySelector("#contractTable tbody");
    tbody.innerHTML = "";

    const start = (currentPage - 1) * pageSize;
    const pageData = data.slice(start, start + pageSize);

    if (pageData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4">暂无数据</td></tr>`;
    } else {
        for (const contract of pageData) {
            const row = `
                <tr>
                    <td>${contract.num}</td>
                    <td>${contract.name}</td>
                    <td>${contract.state}</td>
                    <td>
                        <a href="/contractManagement/finalizeContract.html?id=${contract.num}">修改</a>
                        <button onclick="deleteContract('${contract.num}')">删除</button>
                    </td>
                </tr>`;
            tbody.insertAdjacentHTML('beforeend', row);
        }
    }
    updatePageInfo(data.length);
}

// 分页显示更新
function updatePageInfo(total) {
    const pageCount = Math.ceil(total / pageSize) || 1;
    document.getElementById('pageInfo').textContent = `共 ${pageCount} 页 ${total} 条`;
}

// 模糊查询合同名称
function searchContracts() {
    const nameInput = document.getElementById('contractName').value.trim().toLowerCase();
    const statusInput = document.getElementById('contractStatus').value;

    const filtered = contracts.filter(contract => {
        const matchesName = !nameInput || contract.name.toLowerCase().includes(nameInput);
        const matchesStatus = !statusInput || contract.status === statusInput;
        return matchesName && matchesStatus;
    });

    currentPage = 1;
    renderTable(filtered);
}

// 重置查询
function resetSearch() {
    document.getElementById("contractName").value = "";
    document.getElementById("contractStatus").value = "";
    currentPage = 1;
    renderTable(contracts);
}

// 分页跳转函数
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

// 新增合同（跳转或弹窗）
function addContract() {
    location.href = '/contractManagement/draftContract.html';
}


// 删除合同
async function deleteContract(contractId) {
    if (!confirm(`确认删除合同 ${contractId} 吗？`)) return;

    try {
        const response = await fetch(`/api/contract/deleteAll/${contractId}`, {
            method: 'DELETE',
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.msg || "删除失败");
        }

        // 从前端列表中移除已删除合同
        contracts = contracts.filter(c => c.id !== contractId);
        renderTable(contracts);
        alert(`合同 ${contractId} 删除成功`);
        location.reload();

    } catch (err) {
        console.error('删除失败:', err);
        alert(`删除失败: ${err.message}`);
    }
}

// 页面加载时自动执行
window.addEventListener('DOMContentLoaded', loadContracts);


