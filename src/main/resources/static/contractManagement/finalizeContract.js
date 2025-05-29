window.onload = function () {
    // 模拟从URL或接口获取合同信息
    const contract = {
        contractName: "示例合同 ABC123",
        finalizer: "张三",
        clientName: "北京客户有限公司",
        startDate: "2025-06-01",
        endDate: "2025-12-01",
        content: "这是该合同的初步内容，可进行编辑定稿。"
    };

    // 填充到表单
    document.getElementById("contractName").value = contract.contractName;
    document.getElementById("finalizer").value = contract.finalizer;
    document.getElementById("clientName").value = contract.clientName;
    document.getElementById("startDate").value = contract.startDate;
    document.getElementById("endDate").value = contract.endDate;
    document.getElementById("contractContent").value = contract.content;
};

// 表单提交处理
document.getElementById("finalizeContractForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const errorDiv = document.getElementById("finalError");
    errorDiv.innerText = "";

    const formData = new FormData(this);

    // TODO: 将 formData 发送到后端（使用 fetch/ajax）
    console.log("提交定稿合同：", Object.fromEntries(formData.entries()));
    alert("定稿提交成功！");
});
