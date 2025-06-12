let contracts = [];  // 存储合同数据

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
            <td>${contract.beginTime?.slice(0, 10)}</td>
            <td><a href="/contractManagement/countersign.html?id=${contract.num}">会签</a></td>
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

// TODO: 后端需要实现的接口
// GET /api/countersign/pending
// 请求参数：无
// 返回数据格式：
// [
//   {
//     "num": "合同编号",
//     "name": "合同名称",
//     "userId": "起草人ID",
//     "beginTime": "起草时间"
//   }
// ]
fetch('/api/countersign/pending')
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
        console.error('获取待会签合同列表失败:', err);
        alert(err.message || '系统异常，获取数据失败！');
    });
