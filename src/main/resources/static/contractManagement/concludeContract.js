document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const contractId = urlParams.get("id") || "defaultId";

    // 获取合同签订信息（包括审批意见）
    fetch(`/api/contract/concludeInfo/${contractId}`)
        .then((res) => {
            if (!res.ok) throw new Error("网络响应失败");
            return res.json();
        })
        .then((data) => {
            document.getElementById("contractName").value = data.contractName || "";
            document.getElementById("clientName").value = data.customer || "";
            document.getElementById("signerName").value = data.concludeId || "";
            document.getElementById("contractInfo").value = data.contractContent || "";

            const comments = data.examineComments || [];
            const commentList = document.getElementById("examineCommentsList");
            commentList.innerHTML = "";
            if (comments.length === 0) {
                commentList.innerHTML = "<li>无</li>";
            } else {
                comments.forEach(comment => {
                    const li = document.createElement("li");
                    li.textContent = comment;
                    commentList.appendChild(li);
                });
            }
        })
        .catch((error) => {
            console.error("获取合同签订信息失败:", error);
            alert("获取信息失败，请稍后重试。");
        });

    // 表单提交逻辑
    document.getElementById("signContractForm").addEventListener("submit", (event) => {
        event.preventDefault();

        const signInfo = document.getElementById("signInfo").value.trim();
        if (!signInfo) {
            alert("请填写签订信息");
            return;
        }

        const payload = {
            contractId,
            signInfo: signInfo
        };

        fetch("/api/contract/submitSignInfo", {
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
            .then(() => {
                alert("签订信息提交成功！");
                document.getElementById("signInfo").value = "";
            })
            .catch((error) => {
                console.error("提交失败:", error);
                alert("提交失败，请稍后重试。");
            });
    });

    // 重置按钮逻辑
    document.getElementById("resetBtn").addEventListener("click", () => {
        document.getElementById("signInfo").value = "";
    });
});
