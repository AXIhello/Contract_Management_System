let contracts = [];  // 先空着

let currentPage = 1;
const itemsPerPage = 5;

function renderTable(data) {
    const body = document.getElementById("contractBody");
    body.innerHTML = "";

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageData = data.slice(start, end);

    for (const contract of pageData) {
        const row = `<tr>
            <td>${contract.num}</td>
            <td>${contract.name}</td>
            <td>${contract.userId}</td>
            <td>${contract.beginTime}</td>
            <td><a href="/contractManagement/assign.html?id=${contract.num}">分配</a></td>
        </tr>`;
        body.insertAdjacentHTML("beforeend", row);
    }

    document.getElementById("pageInfo").textContent =
        `共 ${Math.ceil(data.length / itemsPerPage)} 页 ${data.length} 条`;
}

function searchContracts() {
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

function goToPage(page) {
    const maxPage = Math.ceil(contracts.length / itemsPerPage);
    if (page >= 1 && page <= maxPage) {
        currentPage = page;
        renderTable(contracts);
    }
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderTable(contracts);
    }
}

function nextPage() {
    const maxPage = Math.ceil(contracts.length / itemsPerPage);
    if (currentPage < maxPage) {
        currentPage++;
        renderTable(contracts);
    }
}

function goToLastPage() {
    currentPage = Math.ceil(contracts.length / itemsPerPage);
    renderTable(contracts);
}

// 启动时请求后端接口获取数据
fetch('/api/contract/getDraft')
    .then(res => res.json())
    .then(data => {
        contracts = data;
        renderTable(contracts);
    })
    .catch(err => {
        console.error('获取合同列表失败:', err);
    });
