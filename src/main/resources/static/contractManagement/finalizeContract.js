window.onload = async function () {
    const contractId = new URLSearchParams(window.location.search).get("id");
    if (!contractId) {
        document.getElementById("finalError").innerText = "未提供合同 ID。";
        return;
    }

    try {
        const response = await fetch(`/api/contract/${contractId}`, {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) throw new Error("获取合同失败");

        const result = await response.json();
        if (result.code !== 200) throw new Error(result.msg);

        const contract = result.data;

        // 填充表单
        document.getElementById("contractName").value = contract.name || "";
        document.getElementById("clientName").value = contract.customer || "";
        document.getElementById("startDate").value = contract.beginTime ? contract.beginTime.split("T")[0] : "";
        document.getElementById("endDate").value = contract.endTime ? contract.endTime.split("T")[0] : "";
        document.getElementById("contractContent").value = contract.content || "";

    } catch (err) {
        console.error("加载合同失败", err);
        document.getElementById("finalError").innerText = "加载合同失败：" + err.message;
    }
};

// 表单提交处理
document.getElementById("finalizeContractForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const contractId = new URLSearchParams(window.location.search).get("id");
    if (!contractId) {
        document.getElementById("finalError").innerText = "合同 ID 缺失，无法提交";
        return;
    }

    const updatedContract = {
        name: document.getElementById("contractName").value,
        customer: document.getElementById("clientName").value,
        beginTime: document.getElementById("startDate").value,
        endTime: document.getElementById("endDate").value,
        content: document.getElementById("contractContent").value
    };

    try {
        const response = await fetch(`/api/contract/finalize/${contractId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(updatedContract)
        });

        const result = await response.json();
        if (result.code !== 200) throw new Error(result.msg);

        alert("定稿提交成功！");
        window.location.href = "/userManagement/dashboard.html"; // 修改为你希望跳转的页面

    } catch (err) {
        console.error("提交失败", err);
        document.getElementById("finalError").innerText = "提交失败：" + err.message;
    }
});
