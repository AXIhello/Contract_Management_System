window.onload = function () {
    // 模拟从URL或接口获取合同信息
    const urlParams = new URLSearchParams(window.location.search);
    const contractId = urlParams.get("id");

    if (!contractId) {
       // document.getElementById("finalError").innerText = "未提供合同 ID。";
        return;
    }

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
