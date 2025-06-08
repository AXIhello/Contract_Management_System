// 已有附件数组，格式示例：[{id, name, url}]
window.existingAttachments = [];

document.addEventListener("DOMContentLoaded", () => {
    // const urlParams = new URLSearchParams(window.location.search);
    // const contractId = urlParams.get("id") || "defaultId"; // 从URL获取合同ID

    const contractId = new URLSearchParams(window.location.search).get("id");
    if (!contractId) {
        document.getElementById("finalError").innerText = "未提供合同 ID。";
        return;
    }

    // 获取合同审批信息
    fetch(`/api/contract/approvalInfo/${contractId}`, {
        method: 'GET',
        credentials: 'include',
    })
        .then(async (res) => {
            const data = await res.json();
            if (!res.ok) {
                if (data.code === 403) {
                    throw new Error("权限不足，无法访问该资源");
                } else if (data.code === 401) {
                    throw new Error("未登录或登录已过期，请重新登录");
                } else {
                    throw new Error(data.msg || "请求失败");
                }
            }
            return data;
        })
        .then((data) => {
            document.getElementById("contractName").value = data.contractName || "";
            document.getElementById("approverName").value = data.approverName || "";
        })
        .catch((error) => {
            console.error("获取审批信息失败:", error);
            alert(error.message);
        });

    // 获取并渲染附件列表
    fetch(`/api/contract/attachment/get/${contractId}`)
        .then(async (res) => {
            const data = await res.json();
            if (!res.ok) {
                if (data.code === 403) {
                    throw new Error("权限不足，无法访问该资源");
                } else if (data.code === 401) {
                    throw new Error("未登录或登录已过期，请重新登录");
                } else {
                    throw new Error(data.msg || "请求失败");
                }
            }
            return data;
        })
        .then((attachments) => {
            if (!Array.isArray(attachments)) {
                throw new Error("附件数据格式异常");
            }

            window.existingAttachments = attachments.map(item => ({
                id: item.id || '',
                name: item.fileName || '',
                url: item.fileUrl || '',
            }));

            renderAttachments();
        })
        .catch((error) => {
            console.error("获取附件失败:", error);
            document.getElementById("attachmentsList").innerHTML =
                `<li><span style='color: red;'>${error.message}</span></li>`;
        });

    // 渲染附件列表
    function renderAttachments() {
        const container = document.getElementById('attachmentsList');
        if (!container) return;

        container.innerHTML = '';

        if (window.existingAttachments.length === 0) {
            container.innerHTML = '<li><span>无已上传附件</span></li>';
            return;
        }

        window.existingAttachments.forEach(file => {
            const li = document.createElement('li');
            li.className = 'attachment-item';

            // 文件信息
            const fileInfo = document.createElement('span');
            fileInfo.textContent = file.name;

            // 下载链接
            const downloadBtn = document.createElement('a');
            downloadBtn.href = `/api/contract/attachment/download?filepath=${encodeURIComponent(file.url)}`;
            downloadBtn.textContent = '下载';
            downloadBtn.target = '_blank';
            downloadBtn.rel = 'noopener noreferrer';
            downloadBtn.style.color = '#007bff';
            downloadBtn.style.textDecoration = 'none';

            li.appendChild(fileInfo);
            li.appendChild(downloadBtn);
            container.appendChild(li);
        });
    }

    // 提交审批
    document.getElementById("approvalForm").addEventListener("submit", (e) => {
        e.preventDefault(); // 阻止表单默认提交

        const approvalResult = document.querySelector('input[name="approvalResult"]:checked');
        const approvalOpinion = document.getElementById("approvalComments").value.trim();

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
            .then(async (res) => {
                const data = await res.json();
                if (!res.ok) {
                    if (data.code === 403) {
                        throw new Error("权限不足，无法提交审批");
                    } else if (data.code === 401) {
                        throw new Error("未登录或登录已过期，请重新登录");
                    } else {
                        throw new Error(data.msg || "请求失败");
                    }
                }
                return data;
            })
            .then((data) => {
                alert("审批提交成功！");
                window.location.href = "/queryAndStatistics/toBeExaminedContractList.html";
            })
            .catch((error) => {
                console.error("审批提交失败:", error);
                alert(error.message);
            });
    });

    // 重置按钮
    document.getElementById("resetBtn").addEventListener("click", () => {
        // 复位审批结果（单选按钮）
        const checkedRadio = document.querySelector('input[name="approvalResult"]:checked');
        if (checkedRadio) checkedRadio.checked = false;

        // 清空审批意见
        document.getElementById("approvalComments").value = "";
    });
});