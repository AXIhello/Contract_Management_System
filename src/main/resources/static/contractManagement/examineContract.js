document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const contractId = urlParams.get("id") || "defaultId"; // 从URL获取合同ID

    // 获取合同审批信息
    fetch(`/api/contract/approvalInfo/${contractId}`)
        .then((res) => {
            if (!res.ok) throw new Error("网络响应失败");
            return res.json();
        })
        .then((data) => {
            document.getElementById("contractName").value = data.contractName || "";
            document.getElementById("approverName").value = data.approverName || "";
        })
        .catch((error) => {
            console.error("获取审批信息失败:", error);
            alert("获取合同审批信息失败，请稍后重试。");
        });

    // 提交审批
    document.getElementById("submitBtn").addEventListener("click", () => {
        const approvalResult = document.querySelector('input[name="approvalResult"]:checked');
        const approvalOpinion = document.getElementById("approvalOpinion").value.trim();

        if (!approvalResult) {
            alert("请选择审批结果（通过或拒绝）");
            return;
        }

        if (approvalOpinion === "") {
            alert("请填写审批意见");
            return;
        }

        const payload = {
            contractId,
            approvalResult: approvalResult.value,
            approvalOpinion,
        };

        fetch("/api/contract/submitApproval", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        })
            .then((res) => {
                if (!res.ok) throw new Error("提交失败");
                return res.json();
            })
            .then((data) => {
                alert("审批提交成功！");
                // 可选：提交后跳转或者清空表单
                // window.location.href = "/somepage";
            })
            .catch((error) => {
                console.error("审批提交失败:", error);
                alert("审批提交失败，请稍后重试。");
            });
    });

    // 重置按钮
    document.getElementById("resetBtn").addEventListener("click", () => {
        // 复位审批结果（单选按钮）
        const checkedRadio = document.querySelector('input[name="approvalResult"]:checked');
        if (checkedRadio) checkedRadio.checked = false;

        // 清空审批意见
        document.getElementById("approvalOpinion").value = "";
    });
});
