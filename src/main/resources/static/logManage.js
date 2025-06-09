let allLogs = []; // 全部日志
let filteredLogs = []; // 筛选后的日志
let currentPage = 1;
const pageSize = 10;

// 初始化模拟数据（实际应从后端获取）
window.onload = function () {
    // 示例数据
    allLogs = Array.from({ length: 53 }, (_, i) => ({
        userName: "用户" + ((i % 5) + 1),
        content: `执行了操作 ${i + 1}`,
        time: new Date(Date.now() - i * 3600000).toISOString().slice(0, 19).replace('T', ' ')
    }));

    filteredLogs = [...allLogs];
    renderTable();
};

function loadLogs() {
    fetch('/api/log/all')
        .then(res => res.json().then(data => {
            if (!res.ok) {
                if (data.code === 403) {
                    throw new Error("权限不足，无法访问日志信息");
                } else if (data.code === 401) {
                    throw new Error("未登录或登录过期，请重新登录");
                } else {
                    throw new Error(data.msg || "请求失败");
                }
            }
            return data;
        }))
        .then(data => {
            // 页面加载时显示全部日志
            allLogs = data;
            filteredLogs = [...allLogs];
            currentPage = 1;
            renderTable();  // 重新渲染日志表格
        })
        .catch(err => {
            console.error('日志数据获取失败:', err);
            alert(err.message || '系统异常，获取日志失败！');
        });
}


function renderTable() {
    const tbody = document.getElementById('logTableBody');
    tbody.innerHTML = "";

    const start = (currentPage - 1) * pageSize;
    const pageData = filteredLogs.slice(start, start + pageSize);

    pageData.forEach(log => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${log.userName}</td>
            <td>${log.content}</td>
            <td>${log.time}</td>
        `;
        tbody.appendChild(row);
    });

    const pageInfo = document.getElementById("pageInfo");
    pageInfo.textContent = `第 ${currentPage} 页 / 共 ${Math.ceil(filteredLogs.length / pageSize)} 页`;
}

function searchLogs() {
    const userInput = document.getElementById('userName').value.trim().toLowerCase();
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;

    filteredLogs = allLogs.filter(log => {
        const matchesUser = !userInput || log.userName.toLowerCase().includes(userInput);
        const matchesStart = !startTime || log.time >= startTime.replace("T", " ");
        const matchesEnd = !endTime || log.time <= endTime.replace("T", " ");
        return matchesUser && matchesStart && matchesEnd;
    });

    currentPage = 1;
    renderTable();
}

function resetSearch() {
    document.getElementById('userName').value = '';
    document.getElementById('startTime').value = '';
    document.getElementById('endTime').value = '';

    filteredLogs = [...allLogs];
    currentPage = 1;
    renderTable();
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderTable();
    }
}

function nextPage() {
    const totalPages = Math.ceil(filteredLogs.length / pageSize);
    if (currentPage < totalPages) {
        currentPage++;
        renderTable();
    }
}

function goToLastPage() {
    currentPage = Math.ceil(filteredLogs.length / pageSize);
    renderTable();
}

function exportLogs() {
    if (filteredLogs.length === 0) {
        alert("无可导出的日志数据！");
        return;
    }

    const csvRows = [
        "操作人,操作内容,操作时间",
        ...filteredLogs.map(log =>
            `"${log.userName}","${log.content}","${log.time}"`
        )
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `日志导出_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 页面加载时自动执行
window.addEventListener('DOMContentLoaded', loadLogs);