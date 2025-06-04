// 存储所有附件的数组
window.allAttachments = [];

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

    // 初始化附件上传功能
    initFileUploader();
};

// 初始化附件上传功能
function initFileUploader() {
    // 添加附件按钮点击事件
    document.getElementById('addAttachmentBtn').addEventListener('click', function() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.doc,.docx,.pdf,.jpg,.jpeg,.png,.bmp,.gif';
        fileInput.style.display = 'none';

        // 允许多文件选择
        fileInput.multiple = true;

        // 添加到文档中
        document.body.appendChild(fileInput);

        // 监听文件选择
        fileInput.addEventListener('change', function(e) {
            const files = Array.from(e.target.files);

            files.forEach(file => {
                // 检查文件是否已存在
                const exists = allAttachments.some(a => a.name === file.name && a.size === file.size);
                if (exists) {
                    alert('该文件已添加');
                    return;
                }

                // 添加到附件列表
                allAttachments.push(file);

                // 更新附件预览
                updateAttachmentsPreview();
            });

            // 移除临时文件输入框
            document.body.removeChild(fileInput);
        });

        // 触发文件选择对话框
        fileInput.click();
    });

    // 动态限制结束时间不能小于开始时间
    const startDateInput = document.getElementById("startDate");
    const endDateInput = document.getElementById("endDate");

    startDateInput.addEventListener("change", () => {
        if (startDateInput.value) {
            endDateInput.min = startDateInput.value;
            if (endDateInput.value && endDateInput.value < startDateInput.value) {
                endDateInput.value = startDateInput.value;
            }
        } else {
            endDateInput.min = "";
        }
    });
}

// 更新附件预览
function updateAttachmentsPreview() {
    const container = document.getElementById('attachmentsContainer');
    container.innerHTML = '';

    if (allAttachments && allAttachments.length > 0) {
        allAttachments.forEach((file, index) => {
            const fileSize = (file.size / (1024 * 1024)).toFixed(2);
            const fileItem = document.createElement('div');
            fileItem.className = 'attachment-item';
            fileItem.innerHTML = `
                <span>${file.name} (${fileSize} MB)</span>
                <button type="button" onclick="removeAttachment(${index})">删除</button>
            `;
            container.appendChild(fileItem);
        });
    } else {
        container.innerHTML = '<p>未选择附件</p>';
    }
}

// 删除附件
function removeAttachment(index) {
    allAttachments.splice(index, 1);
    updateAttachmentsPreview();
}

// 重置表单
window.resetForm = function() {
    document.getElementById('finalizeContractForm').reset();
    document.getElementById('finalError').textContent = '';
    allAttachments = [];
    updateAttachmentsPreview();
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
        // 创建 FormData 对象
        const formData = new FormData();

        // 添加合同数据
        formData.append('contract', JSON.stringify(updatedContract));

        // 验证
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const errorElement = document.getElementById('finalError');

        errorElement.textContent = '';

        if (!startDate || !endDate) {
            errorElement.textContent = '请填写开始时间和结束时间';
            return;
        }

        // 验证附件
        if (allAttachments.length === 0) {
            errorElement.textContent = '请至少上传一个附件';
            return;
        }

        // 添加所有附件
        allAttachments.forEach(file => {
            formData.append('contractFiles', file);
        });

        // 提交表单数据
        const response = await fetch(`/api/contract/finalize/${contractId}`, {
            method: 'PUT',
            credentials: 'include',
            body: formData
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