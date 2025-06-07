// 已有附件数组，格式示例：[{id, name, url}]
window.existingAttachments = [];

// 新上传附件数组，File对象
window.allAttachments = [];

// 页面初始化
window.onload = async function () {
    const contractId = new URLSearchParams(window.location.search).get("id");
    if (!contractId) {
        document.getElementById("finalError").innerText = "未提供合同 ID。";
        return;
    }

    try {
        // 1. 获取合同信息
        const response = await fetch(`/api/contract/${contractId}`, {
            method: 'GET',
            credentials: 'include'
        });
        if (!response.ok) throw new Error("获取合同失败");
        const result = await response.json();
        if (result.code !== 200) throw new Error(result.msg);

        const contract = result.data;

        // 填充合同基本信息
        document.getElementById("contractName").value = contract.name || "";
        document.getElementById("clientName").value = contract.customer || "";
        document.getElementById("startDate").value = contract.beginTime ? contract.beginTime.split("T")[0] : "";
        document.getElementById("endDate").value = contract.endTime ? contract.endTime.split("T")[0] : "";
        document.getElementById("contractContent").value = contract.content || "";
    } catch (err) {
        console.error("加载合同失败", err);
        document.getElementById("finalError").innerText = "加载合同失败：" + err.message;
        // 合同信息加载失败，继续加载会签和附件也没意义，可以选择return
        return;
    }

    // 会签意见独立加载，失败不影响其他
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
        console.error("加载会签意见失败", countersignErr);
        document.getElementById("countersignContent").innerHTML =
            "<p style='color:red;'>加载会签意见失败。</p>";
    }

    // 已有附件加载
    await loadExistingAttachments(contractId);

    // 初始化新附件上传控件
    initFileUploader();
};


// 获取已有附件
async function loadExistingAttachments(contractId) {
    try {
        const res = await fetch(`/api/contract/attachment/get/${contractId}`, {
            method: 'GET',
            credentials: 'include',
        });
        if (!res.ok) throw new Error("获取附件失败");
        const data = await res.json();

        if (!Array.isArray(data)) throw new Error("附件数据格式异常");

        window.existingAttachments = data.map(item => ({
            id: item.id || '',       // 如果后端没返回id，可以留空或生成唯一值
            name: item.fileName || '',
            url: item.fileUrl || '',
        }));

        renderExistingAttachments();
    } catch (err) {
        console.error("加载已有附件失败", err);
        const container = document.getElementById('existingAttachmentsContainer');
        if (container) container.innerHTML = '<p style="color:red;">加载附件失败</p>';
    }
}


// 渲染已有附件列表
function renderExistingAttachments() {
    const container = document.getElementById('existingAttachmentsContainer');
    if (!container) return;
    container.innerHTML = '';

    if (window.existingAttachments.length === 0) {
        container.innerHTML = '<p>无已上传附件</p>';
        return;
    }

    window.existingAttachments.forEach((file, idx) => {
        const div = document.createElement('div');
        div.className = 'attachment-item';
        div.style.position = 'relative';
        div.style.paddingRight = '20px';

        // 点击下载链接
        //TODO:允许选择下载位置
        const link = document.createElement('a');
        link.href = `/api/contract/attachment/download?filepath=${encodeURIComponent(file.url)}`;
        link.textContent = file.name;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.style.marginRight = '10px';

        // 删除按钮（右上角 ×）
        const delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.textContent = '×';
        delBtn.title = '删除附件';
        delBtn.style.color = 'red';
        delBtn.style.border = 'none';
        delBtn.style.background = 'transparent';
        delBtn.style.cursor = 'pointer';
        delBtn.style.fontSize = '16px';
        delBtn.style.fontWeight = 'bold';
        delBtn.style.position = 'absolute';
        delBtn.style.right = '0';
        delBtn.style.top = '0';

        delBtn.onclick = () => {
            if (confirm(`确认删除附件 "${file.name}" 吗？`)) {
                removeExistingAttachment(idx);
            }
        };

        div.appendChild(link);
        div.appendChild(delBtn);
        container.appendChild(div);
    });
}

// 删除已有附件（调用后端接口）
async function removeExistingAttachment(index) {
    const file = window.existingAttachments[index];
    if (!file) return;
    try {
        const res = await fetch(`/api/contract/attachment/delete?path=${encodeURIComponent(file.url)}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        const data = await res.json();
        if (res.ok && data.code === 200) {
            alert(`附件 "${file.name}" 删除成功`);
            window.existingAttachments.splice(index, 1);
            renderExistingAttachments();
        } else {
            throw new Error(data.msg || '删除失败');
        }
    } catch (err) {
        alert(`删除附件失败：${err.message}`);
    }
}


// 初始化新附件上传功能
function initFileUploader() {
    const addBtn = document.getElementById('addAttachmentBtn');
    if (!addBtn) return;

    addBtn.addEventListener('click', function () {
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

// 添加新上传附件到列表
function addAttachment(file) {
    const maxSizeMB = 30;
    if (file.size > maxSizeMB * 1024 * 1024) {
        alert(`文件 ${file.name} 大小超过${maxSizeMB}MB限制`);
        return;
    }

    if (window.allAttachments.some(f => f.name === file.name && f.size === file.size)) {
        alert(`文件 ${file.name} 已经添加过`);
        return;
    }

    window.allAttachments.push(file);
    renderAttachments();
}

// 删除新上传附件
function removeAttachment(index) {
    window.allAttachments.splice(index, 1);
    renderAttachments();
}

// 渲染新上传附件列表
function renderAttachments() {
    const container = document.getElementById('attachmentsContainer');
    if (!container) return;

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
    const form = document.getElementById('finalizeContractForm');
    if (form) form.reset();
    window.allAttachments = [];
    renderAttachments();
}

// 表单提交
const form = document.getElementById('finalizeContractForm');
if (form) {
    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const finalError = document.getElementById('finalError');
        if(finalError) finalError.innerText = '';

        const startDate = document.getElementById('startDate').value.trim();
        const endDate = document.getElementById('endDate').value.trim();

        if (!startDate || !endDate) {
            if(finalError) finalError.innerText = '开始时间和结束时间不能为空';
            return;
        }
        if (startDate > endDate) {
            if(finalError) finalError.innerText = '结束时间不能早于开始时间';
            return;
        }

        const formData = new FormData();
        const contractId = new URLSearchParams(window.location.search).get("id");

        formData.append('beginTime', startDate);
        formData.append('endTime', endDate);
        formData.append('content', document.getElementById('contractContent').value.trim());
        formData.append('id', contractId);

        // 新上传附件加入 FormData
        window.allAttachments.forEach((file) => {
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
                alert("定稿提交成功");
                resetForm();
                // 页面跳转或刷新逻辑
                window.location.href = '/contract/list';
            } else {
                throw new Error(data.msg || '提交失败');
            }
        } catch (err) {
            if(finalError) finalError.innerText = `提交失败：${err.message}`;
        }
    });
}

// 切换标签示例（如果有标签页切换需求）
function switchTab(tabId) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(t => t.style.display = 'none');
    const activeTab = document.getElementById(tabId);
    if (activeTab) activeTab.style.display = 'block';
}

// 初始化默认标签显示
document.addEventListener('DOMContentLoaded', () => {
    switchTab('contractInfoTab');  // 例如默认显示合同信息标签页
});
