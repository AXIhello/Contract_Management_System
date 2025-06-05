// 全局存储所有附件的数组
window.allAttachments = [];

// 页面加载时初始化
window.onload = async function () {
    const contractId = new URLSearchParams(window.location.search).get("id");
    if (!contractId) {
        document.getElementById("finalError").innerText = "未提供合同 ID。";
        return;
    }

    try {
        // 获取合同数据
        const response = await fetch(`/api/contract/${contractId}`, {
            method: 'GET',
            credentials: 'include'
        });
        if (!response.ok) throw new Error("获取合同失败");

        const result = await response.json();
        if (result.code !== 200) throw new Error(result.msg);

        const contract = result.data;

        // 填充表单字段
        document.getElementById("contractName").value = contract.name || "";
        document.getElementById("clientName").value = contract.customer || "";
        document.getElementById("startDate").value = contract.beginTime ? contract.beginTime.split("T")[0] : "";
        document.getElementById("endDate").value = contract.endTime ? contract.endTime.split("T")[0] : "";
        document.getElementById("contractContent").value = contract.content || "";

        // 加载会签意见
        try {
            const countersignRes = await fetch(`/api/countersign/contents/${contractId}`, {
                method: 'GET',
                credentials: 'include'
            });

            if (!countersignRes.ok) throw new Error("会签意见请求失败");

            const countersignResult = await countersignRes.json();

            const container = document.getElementById("countersignContent");
            if (!countersignResult || countersignResult.length === 0) {
                container.innerHTML = "<p>暂无会签意见。</p>";
            } else {
                let html = "";
                countersignResult.forEach(item => {
                    html += `<p><strong>${item.username}：</strong>${item.content}</p>`;
                });
                container.innerHTML = html;
            }
        } catch (countersignErr) {
            document.getElementById("countersignContent").innerHTML =
                "<p style='color:red;'>加载会签意见失败。</p>";
            console.error("加载会签意见失败", countersignErr);
        }
    } catch (err) {
        console.error("加载合同失败", err);
        document.getElementById("finalError").innerText = "加载合同失败：" + err.message;
    }

    // 初始化附件上传功能
    initFileUploader();
};

// 切换标签页
function switchTab(tabId, button) {
    const tabs = document.querySelectorAll('.tab-content');
    const buttons = document.querySelectorAll('.tab-buttons button');

    tabs.forEach(tab => tab.classList.remove('active'));
    buttons.forEach(btn => btn.classList.remove('active'));

    document.getElementById(tabId).classList.add('active');
    button.classList.add('active');
}

// 初始化附件上传
function initFileUploader() {
    document.getElementById('addAttachmentBtn').addEventListener('click', function () {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.doc,.docx,.pdf,.jpg,.jpeg,.png,.bmp,.gif';
        fileInput.style.display = 'none';

        fileInput.onchange = () => {
            if (fileInput.files.length > 0) {
                for (const file of fileInput.files) {
                    addAttachment(file);
                }
            }
        };

        document.body.appendChild(fileInput);
        fileInput.click();
        fileInput.remove();
    });

    renderAttachments();
}

// 添加附件到列表
function addAttachment(file) {
    // 限制单文件大小，例如5MB
    const maxSizeMB = 5;
    if (file.size > maxSizeMB * 1024 * 1024) {
        alert(`文件 ${file.name} 大小超过${maxSizeMB}MB限制`);
        return;
    }

    // 防止重复上传同名文件（可选）
    if (window.allAttachments.some(f => f.name === file.name && f.size === file.size)) {
        alert(`文件 ${file.name} 已经添加过`);
        return;
    }

    window.allAttachments.push(file);
    renderAttachments();
}

// 删除附件
function removeAttachment(index) {
    window.allAttachments.splice(index, 1);
    renderAttachments();
}

// 渲染附件列表
function renderAttachments() {
    const container = document.getElementById('attachmentsContainer');
    container.innerHTML = '';

    if (window.allAttachments.length === 0) {
        container.innerHTML = '<p>未选择附件</p>';
        return;
    }

    window.allAttachments.forEach((file, idx) => {
        const div = document.createElement('div');
        div.className = 'attachment-item';

        const span = document.createElement('span');
        span.title = file.name;
        span.textContent = file.name;

        const btn = document.createElement('button');
        btn.textContent = '删除';
        btn.type = 'button';
        btn.onclick = () => removeAttachment(idx);

        div.appendChild(span);
        div.appendChild(btn);
        container.appendChild(div);
    });
}

// 重置表单及附件
function resetForm() {
    document.getElementById('finalizeContractForm').reset();
    window.allAttachments = [];
    renderAttachments();
}

// 提交表单
document.getElementById('finalizeContractForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    document.getElementById('finalError').innerText = '';

    // 简单表单验证
    const startDate = document.getElementById('startDate').value.trim();
    const endDate = document.getElementById('endDate').value.trim();

    if (!startDate || !endDate) {
        document.getElementById('finalError').innerText = '开始时间和结束时间不能为空';
        return;
    }
    if (startDate > endDate) {
        document.getElementById('finalError').innerText = '结束时间不能早于开始时间';
        return;
    }

    // 构造FormData提交
    const formData = new FormData();
    const contractId = new URLSearchParams(window.location.search).get("id");

    formData.append('beginTime', startDate);
    formData.append('endTime', endDate);
    formData.append('content', document.getElementById('contractContent').value.trim());
    formData.append('id', contractId);

    // 添加附件文件
    window.allAttachments.forEach((file, idx) => {
        formData.append('attachments', file);
    });

    try {
        const res = await fetch('/api/contract/finalize', {
            method: 'POST',
            body: formData,
            credentials: 'include',
        });
        const data = await res.json();

        if (res.ok && data.code === 200) {
            alert("定稿提交成功！");
            // 可选跳转或刷新页面
            // window.location.href = "/contracts/list";
        } else {
            throw new Error(data.msg || '提交失败');
        }
    } catch (err) {
        document.getElementById('finalError').innerText = "提交失败：" + err.message;
    }
});
