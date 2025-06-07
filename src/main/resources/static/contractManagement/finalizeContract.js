// 已有附件数组，格式示例：[{id, name, url}]
window.existingAttachments = [];

// 新上传附件数组，File对象
window.allAttachments = [];

// 要删除的附件路径数组
window.deletedAttachments = [];

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

        // 设置只读字段
        setFieldsReadonly();
    } catch (err) {
        console.error("加载合同失败", err);
        document.getElementById("finalError").innerText = "加载合同失败：" + err.message;
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

// 设置字段为只读状态
function setFieldsReadonly() {
    // 设置合同基本信息为只读
    const readonlyFields = [
        "contractName",
        "clientName",
        "startDate",
        "endDate"
    ];

    readonlyFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.readOnly = true;
            field.style.backgroundColor = '#f8f9fa';
            field.style.cursor = 'not-allowed';
            field.style.border = '1px solid #dee2e6';

            // 为只读字段添加提示
            field.title = '此字段不可修改';
        }
    });

    // 禁用日期选择器的交互
    const dateFields = document.querySelectorAll('input[type="date"]');
    dateFields.forEach(field => {
        if (readonlyFields.includes(field.id)) {
            field.disabled = true;
            field.style.backgroundColor = '#f8f9fa';
        }
    });

    // 添加只读字段标识
    addReadonlyLabels();
}

// 为只读字段添加标识
function addReadonlyLabels() {
    const readonlyFields = [
        { id: "contractName", label: "合同名称" },
        { id: "clientName", label: "客户名称" },
        { id: "startDate", label: "开始时间" },
        { id: "endDate", label: "结束时间" }
    ];

    readonlyFields.forEach(fieldInfo => {
        const field = document.getElementById(fieldInfo.id);
        if (field) {
            // 查找对应的label
            const labels = document.querySelectorAll('label');
            labels.forEach(label => {
                if (label.textContent.includes(fieldInfo.label) ||
                    label.getAttribute('for') === fieldInfo.id) {
                    // 添加只读标识
                    if (!label.querySelector('.readonly-indicator')) {
                        const indicator = document.createElement('span');
                        indicator.className = 'readonly-indicator';
                        indicator.textContent = ' (不可修改)';
                        indicator.style.color = '#6c757d';
                        indicator.style.fontSize = '0.85em';
                        indicator.style.fontWeight = 'normal';
                        label.appendChild(indicator);
                    }
                }
            });
        }
    });
}

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
            id: item.id || '',
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
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.alignItems = 'center';
        div.style.padding = '8px';
        div.style.border = '1px solid #ddd';
        div.style.marginBottom = '5px';

        // 文件信息
        const fileInfo = document.createElement('span');
        fileInfo.textContent = file.name;
        fileInfo.style.flex = '1';

        // 下载链接
        const downloadBtn = document.createElement('a');
        downloadBtn.href = `/api/contract/attachment/download?filepath=${encodeURIComponent(file.url)}`;
        downloadBtn.textContent = '下载';
        downloadBtn.target = '_blank';
        downloadBtn.rel = 'noopener noreferrer';
        downloadBtn.style.marginRight = '10px';
        downloadBtn.style.color = '#007bff';
        downloadBtn.style.textDecoration = 'none';

        // 删除按钮
        const delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.textContent = '删除';
        delBtn.onclick = () => removeExistingAttachment(idx);
        delBtn.style.background = '#dc3545';
        delBtn.style.color = 'white';
        delBtn.style.border = 'none';
        delBtn.style.padding = '2px 8px';
        delBtn.style.borderRadius = '3px';
        delBtn.style.cursor = 'pointer';

        div.appendChild(fileInfo);
        div.appendChild(downloadBtn);
        div.appendChild(delBtn);
        container.appendChild(div);
    });
}

// 删除已有附件（仅记录）
function removeExistingAttachment(index) {
    const file = window.existingAttachments[index];
    if (!file) return;

    if (confirm(`确认删除附件 "${file.name}" 吗？`)) {
        // 记录要删除的附件路径
        window.deletedAttachments.push(file.url);

        // 从展示列表中移除
        window.existingAttachments.splice(index, 1);
        renderExistingAttachments();

        console.log('标记删除附件:', file.url);
        console.log('当前待删除附件列表:', window.deletedAttachments);
    }
}

// 初始化新附件上传功能
function initFileUploader() {
    const addBtn = document.getElementById('addAttachmentBtn');
    if (!addBtn) return;

    let attachmentCounter = 0;

    addBtn.addEventListener('click', function () {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.doc,.docx,.pdf,.jpg,.jpeg,.png,.bmp,.gif';
        fileInput.id = `attachment-${attachmentCounter++}`;
        fileInput.style.display = 'none';
        fileInput.multiple = true; // 允许多选

        // 添加到文档中
        document.body.appendChild(fileInput);

        // 监听文件选择
        fileInput.addEventListener('change', function(e) {
            const files = Array.from(e.target.files);

            files.forEach(file => {
                // 检查文件是否已存在
                const exists = window.allAttachments.some(a => a.name === file.name && a.size === file.size);
                if (exists) {
                    alert(`文件 ${file.name} 已添加`);
                    return;
                }

                // 文件大小检查
                const maxSizeMB = 30;
                if (file.size > maxSizeMB * 1024 * 1024) {
                    alert(`文件 ${file.name} 大小超过${maxSizeMB}MB限制`);
                    return;
                }

                // 文件类型检查
                const allowedExtensions = ["doc", "docx", "jpg", "jpeg", "png", "bmp", "gif", "pdf"];
                const fileExt = file.name.split('.').pop().toLowerCase();
                if (!allowedExtensions.includes(fileExt)) {
                    alert(`文件 ${file.name} 格式不正确，只允许doc、docx、pdf、jpg、jpeg、png、bmp、gif！`);
                    return;
                }

                // 添加到附件列表
                window.allAttachments.push(file);
            });

            // 更新附件预览
            renderAttachments();

            // 移除临时文件输入框
            document.body.removeChild(fileInput);
        });

        // 触发文件选择对话框
        fileInput.click();
    });

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
        const fileSize = (file.size / (1024 * 1024)).toFixed(2);
        const div = document.createElement('div');
        div.className = 'attachment-item';
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.alignItems = 'center';
        div.style.padding = '8px';
        div.style.border = '1px solid #ddd';
        div.style.marginBottom = '5px';

        const span = document.createElement('span');
        span.textContent = `${file.name} (${fileSize} MB)`;
        span.style.flex = '1';

        const btn = document.createElement('button');
        btn.textContent = '删除';
        btn.type = 'button';
        btn.onclick = () => removeAttachment(idx);
        btn.style.background = '#dc3545';
        btn.style.color = 'white';
        btn.style.border = 'none';
        btn.style.padding = '2px 8px';
        btn.style.borderRadius = '3px';
        btn.style.cursor = 'pointer';

        div.appendChild(span);
        div.appendChild(btn);
        container.appendChild(div);
    });
}

// 设置输入框加载状态（只对可编辑字段生效）
function setInputsLoading(isLoading) {
    // 只对可编辑的字段和按钮设置加载状态
    const editableSelectors = [
        '#contractContent',
        '#addAttachmentBtn',
        'button[type="submit"]',
        '.attachment-item button'
    ];

    editableSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            element.disabled = isLoading;
            if (isLoading) {
                element.style.opacity = '0.7';
                element.style.cursor = 'not-allowed';
            } else {
                element.style.opacity = '1';
                element.style.cursor = element.type === 'button' ? 'pointer' : 'auto';
            }
        });
    });
}

// 重置表单及附件（只重置可编辑部分）
function resetForm() {
    // 只重置合同内容
    const contentField = document.getElementById('contractContent');
    if (contentField) {
        contentField.value = '';
    }

    // 清空新上传附件
    window.allAttachments = [];
    renderAttachments();

    // 清空删除附件记录
    window.deletedAttachments = [];

    // 重新加载已有附件
    const contractId = new URLSearchParams(window.location.search).get("id");
    if (contractId) {
        loadExistingAttachments(contractId);
    }
}

// 表单提交（简化验证，只验证可编辑字段）
const form = document.getElementById('finalizeContractForm');
if (form) {
    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const finalError = document.getElementById('finalError');
        if (finalError) finalError.innerText = '';

        setInputsLoading(true);

        const contractId = new URLSearchParams(window.location.search).get("id");
        if (!contractId) {
            if (finalError) finalError.innerText = '合同ID不能为空';
            setInputsLoading(false);
            return;
        }

        const contractContent = document.getElementById('contractContent').value.trim();
        if (!contractContent) {
            if (finalError) finalError.innerText = '合同内容不能为空';
            setInputsLoading(false);
            return;
        }

        try {
            const formData = new FormData();

            formData.append('id', contractId);
            formData.append('content', contractContent);

            // 添加删除附件路径（JSON数组字符串）
            formData.append('deletedAttachments', JSON.stringify(window.deletedAttachments));

            // 添加新上传文件
            window.allAttachments.forEach(file => {
                formData.append('attachments', file);
            });

            const res = await fetch('/api/contract/finalize/', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            const result = await res.json();
            if (result.code !== 200) {
                throw new Error(result.msg || '提交失败');
            }

            alert('合同定稿成功！');
            window.location.href = '/contracts/view?id=' + contractId;

        } catch (err) {
            console.error("提交失败", err);
            if (finalError) finalError.innerText = "提交失败：" + err.message;
        } finally {
            setInputsLoading(false);
        }
    });
}


// 移除原有的日期联动逻辑（因为日期字段已设为只读）
// 注释掉以下代码块
/*
const startDateInput = document.getElementById("startDate");
const endDateInput = document.getElementById("endDate");

if (startDateInput && endDateInput) {
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
*/

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