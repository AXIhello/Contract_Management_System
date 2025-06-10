// 已有附件数组，格式示例：[{id, name, url}]
window.existingAttachments = [];

document.addEventListener("DOMContentLoaded", () => {
    const contractId = new URLSearchParams(window.location.search).get("id");
    if (!contractId) {
        document.getElementById("finalError").innerText = "未提供合同 ID。";
        return;
    }

    // 获取合同结项信息
    fetch(`/api/contract/concludeInfo/${contractId}`, {
        method: 'GET',
        credentials: 'include',
    })
        .then(async (res) => {
            const data = await res.json();
            if (!res.ok) {
                if (data.code === 403) throw new Error("权限不足，无法访问该资源");
                if (data.code === 401) throw new Error("未登录或登录已过期，请重新登录");
                throw new Error(data.msg || "请求失败");
            }
            return data;
        })
        .then((data) => {
            document.getElementById("contractName").value = data.contractName || "";
            document.getElementById("clientName").value = data.customer || "";
            document.getElementById("signerName").value = data.signerName || "";
            document.getElementById("contractInfo").value = data.contractContent || "";
            document.getElementById("beginTime").value = data.beginTime?.split("T")[0] || "";
            document.getElementById("endTime").value = data.endTime?.split("T")[0] || "";
            // 🔽 修改这里，把审批意见插入 <ul>
            const commentsUl = document.getElementById("examineComments");
            commentsUl.innerHTML = ""; // 清空原有内容
            if (data.examineComments) {
                commentsUl.innerHTML = `<li>${data.examineComments}</li>`;
            }
//
            setFieldsReadonly();
        })
        .catch((error) => {
            console.error("获取结项信息失败:", error);
            alert(error.message);
        });

    // 获取附件
    fetch(`/api/contract/attachment/get/${contractId}`)
        .then(async (res) => {
            const data = await res.json();
            if (!res.ok) {
                if (data.code === 403) throw new Error("权限不足，无法查看附件");
                if (data.code === 401) throw new Error("未登录或登录已过期，请重新登录");
                throw new Error(data.msg || "请求失败");
            }
            return data;
        })
        .then((attachments) => {
            if (!Array.isArray(attachments)) throw new Error("附件数据格式异常");

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

    // 渲染附件
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

            const fileInfo = document.createElement('span');
            fileInfo.textContent = file.name;

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

    // 提交结项
    document.getElementById("concludeForm").addEventListener("submit", (e) => {
        e.preventDefault();

        const comments = document.getElementById("concludeComments").value.trim();

        if (comments === "") {
            alert("请填写结项说明");
            return;
        }

        const payload = {
            contractId,
            concludeOpinion: comments,
        };

        fetch(`/api/contract/submitSign`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        })
            .then(async (res) => {
                const data = await res.json();
                if (!res.ok) {
                    if (data.code === 403) throw new Error("权限不足，无法签订合同");
                    if (data.code === 401) throw new Error("未登录或登录已过期，请重新登录");
                    throw new Error(data.msg || "请求失败");
                }
                return data;
            })
            .then(() => {
                alert("结项提交成功！");
                window.location.href = "/queryAndStatistics/searchContractList.html";
            })
            .catch((error) => {
                console.error("结项提交失败:", error);
                alert(error.message);
            });
    });

    // 重置按钮
    document.getElementById("resetBtn").addEventListener("click", () => {
        const checkedRadio = document.querySelector('input[name="concludeResult"]:checked');
        if (checkedRadio) checkedRadio.checked = false;
        document.getElementById("concludeComments").value = "";
    });
});
