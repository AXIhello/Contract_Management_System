// TODO: 替换此处的模拟数据为后端返回的真实数据列表
// 后端应该返回一个 JSON 数组，格式如下：
// [
//   { id: "C001", name: "合同名称", drafter: "起草人", date: "起草时间" },
//   ...
// ]
const contracts = [
    { id: "C001", name: "XX合同1", drafter: "张三", date: "2023-12-01" },
    { id: "C002", name: "XX合同2", drafter: "李四", date: "2023-12-03" },
    { id: "C003", name: "XX合同3", drafter: "王五", date: "2023-12-05" },
    { id: "C004", name: "XX合同4", drafter: "赵六", date: "2023-12-07" },
    { id: "C005", name: "XX合同5", drafter: "钱七", date: "2023-12-09" },
    { id: "C006", name: "XX合同6", drafter: "孙八", date: "2023-12-11" },
    { id: "C007", name: "XX合同7", drafter: "周九", date: "2023-12-13" }
];

// TODO: 如果你要从后端动态拉取数据，建议这样封装接口调用逻辑
// fetch('/api/contracts/pending')
//     .then(res => res.json())
//     .then(data => {
//         contracts = data;
//         renderTable(contracts);
//     });

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
            <td>${contract.id}</td>
            <td>${contract.name}</td>
            <td>${contract.drafter}</td>
            <td>${contract.date}</td>
            <td><a href="#">分配</a></td>
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

// 初始化渲染
renderTable(contracts);
