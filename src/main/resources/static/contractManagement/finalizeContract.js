// 附件管理变量
window.existingAttachments = [];
window.newAttachments = [];
window.deletedAttachments = [];

window.onload = async function () {
    console.log('页面开始初始化');

    const contractId = new URLSearchParams(window.location.search).get("id");
    if (!contractId) {
        document.getElementById("finalError").innerText = "未提供合同 ID。";
        return;
    }

    try {
        // 获取合同信息
        const response = await fetch(`/api/contract/${contractId}`, {
            method: 'GET',
            credentials: 'include'
        });
        const result = await response.json();

        if (!response.ok) {
            if (result.code === 403) {
                throw new Error("权限不足，无法查询合同");
            } else if (result.code === 401) {
                throw new Error("未登录或登录已过期，请重新登录");
            } else {
                throw new Error(result.msg || "请求失败");
            }
        }

        if (!response.ok || result.code !== 200) throw new Error(result.msg || "获取合同失败");
        const contract = result.data;

        document.getElementById("contractName").value = contract.name || "";
        document.getElementById("clientName").value = contract.customer || "";
        document.getElementById("startDate").value = contract.beginTime?.split("T")[0] || "";
        document.getElementById("endDate").value = contract.endTime?.split("T")[0] || "";
        document.getElementById("contractContent").value = contract.content || "";

        setFieldsReadonly();
    } catch (err) {
        console.error("加载合同失败", err);
        document.getElementById("finalError").innerText = "加载合同失败：" + err.message;
        return;
    }

    // 会签意见
    try {
        const res = await fetch(`/api/countersign/contents/${contractId}`, {
            method: 'GET',
            credentials: 'include'
        });
        const data = await res.json();
        if (!res.ok) {
            if (data.code === 403) {
                throw new Error("权限不足，无法查看会签意见");
            } else if (data.code === 401) {
                throw new Error("未登录或登录已过期，请重新登录");
            } else {
                throw new Error(data.msg || "请求失败");
            }
        }
        const container = document.getElementById("countersignContent");

        if (!res.ok || !Array.isArray(data)) {
            throw new Error("会签数据异常");
        }

        if (data.length === 0) {
            container.innerHTML = "<p>暂无会签意见。</p>";
        } else {
            container.innerHTML = data.map(item =>
                `<p><strong>${item.username}：</strong>${item.content}</p>`).join("");
        }
    } catch (err) {
        console.error("加载会签意见失败", err);
        document.getElementById("countersignContent").innerHTML =
            "<p style='color:red;'>加载会签意见失败。</p>";
    }

    // 加载已有附件
    await loadExistingAttachments(contractId);

    // 初始化上传控件
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFileUploader);
    } else {
        initFileUploader();
    }

    // 提交逻辑
    const form = document.getElementById('finalizeContractForm');
    if (form) {
        handleFormSubmit(form, contractId);
    }

    console.log('页面初始化完成');
};

function setFieldsReadonly() {
    const fields = ["contractName", "clientName", "startDate", "endDate"];
    fields.forEach(id => {
        const field = document.getElementById(id);
        if (field) {
            field.readOnly = true;
            field.disabled = true;
            field.style.backgroundColor = '#f8f9fa';
            field.title = '此字段不可修改';
        }
    });
    addReadonlyLabels();
}

function addReadonlyLabels() {
    const labels = [
        { id: "contractName", label: "合同名称" },
        { id: "clientName", label: "客户名称" },
        { id: "startDate", label: "开始时间" },
        { id: "endDate", label: "结束时间" }
    ];
    labels.forEach(({ id, label }) => {
        const el = document.getElementById(id);
        if (el) {
            const labelEl = document.querySelector(`label[for="${id}"]`);
            if (labelEl && !labelEl.querySelector('.readonly-indicator')) {
                const span = document.createElement('span');
                span.textContent = ' (不可修改)';
                span.className = 'readonly-indicator';
                span.style.color = '#6c757d';
                span.style.fontSize = '0.85em';
                labelEl.appendChild(span);
            }
        }
    });
}

async function loadExistingAttachments(contractId) {
    try {
        const res = await fetch(`/api/contract/attachment/get/${contractId}`, {
            method: 'GET',
            credentials: 'include'
        });
        const data = await res.json();
        if (!res.ok) {
            if (data.code === 403) {
                throw new Error("权限不足，无法查看会签意见");
            } else if (data.code === 401) {
                throw new Error("未登录或登录已过期，请重新登录");
            } else {
                throw new Error(data.msg || "请求失败");
            }
        }
        window.existingAttachments = data.map(item => ({
            id: item.id,
            name: item.fileName,
            url: item.fileUrl
        }));
        renderExistingAttachments();
    } catch (err) {
        document.getElementById("existingAttachmentsContainer").innerHTML =
            '<p style="color:red;">加载附件失败</p>';
    }
}

function renderExistingAttachments() {
    const container = document.getElementById('existingAttachmentsContainer');
    container.innerHTML = '';
    if (window.existingAttachments.length === 0) {
        container.innerHTML = '<p>无已上传附件</p>';
        return;
    }
    window.existingAttachments.forEach((file, idx) => {
        const div = document.createElement('div');
        div.className = 'attachment-item';
        div.innerHTML = `
            <span>${file.name}</span>
            <a href="/api/contract/attachment/download?filepath=${encodeURIComponent(file.url)}" target="_blank">下载</a>
            <button type="button" onclick="removeExistingAttachment(${idx})" style="background:#dc3545;color:white;">删除</button>`;
        container.appendChild(div);
    });
}

function removeExistingAttachment(index) {
    const file = window.existingAttachments[index];
    if (confirm(`确认删除 "${file.name}" 吗？`)) {
        window.deletedAttachments.push(file.url);
        window.existingAttachments.splice(index, 1);
        renderExistingAttachments();
    }
}

function initFileUploader() {
    const addBtn = document.getElementById('addAttachmentBtn');
    if (!addBtn) return;

    const newBtn = addBtn.cloneNode(true);
    addBtn.parentNode.replaceChild(newBtn, addBtn);

    newBtn.addEventListener('click', e => {
        e.preventDefault();

        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.doc,.docx,.pdf,.jpg,.jpeg,.png,.bmp,.gif';
        input.multiple = true;
        input.style.display = 'none';

        input.addEventListener('change', e => {
            const files = Array.from(e.target.files);
            files.forEach(file => {
                const exists = window.newAttachments.some(f =>
                    f.name === file.name &&
                    f.size === file.size &&
                    f.lastModified === file.lastModified);
                if (exists) return;

                const { valid, message } = validateAttachments([file]);
                if (valid) {
                    window.newAttachments.push(file);
                } else {
                    alert(message);
                }
            });
            renderAttachments();
            input.remove();
        });

        document.body.appendChild(input);
        input.click();
    });

    renderAttachments();
}

function renderAttachments() {
    const container = document.getElementById('attachmentsContainer');
    container.innerHTML = '';
    if (window.newAttachments.length === 0) {
        container.innerHTML = '<p>暂无新上传附件</p>';
        return;
    }

    window.newAttachments.forEach((file, idx) => {
        const div = document.createElement('div');
        div.className = 'attachment-item';
        div.innerHTML = `
            <span>${file.name}</span>
            <button type="button" onclick="removeNewAttachment(${idx})" style="background:#ffc107;color:black;">删除</button>`;
        container.appendChild(div);
    });
}

function removeNewAttachment(index) {
    window.newAttachments.splice(index, 1);
    renderAttachments();
}

function validateAttachments(files) {
    const allowed = ["doc", "docx", "pdf", "jpg", "jpeg", "png", "bmp", "gif"];
    for (let file of files) {
        const ext = file.name.split('.').pop().toLowerCase();
        if (!allowed.includes(ext)) {
            return { valid: false, message: `文件 ${file.name} 格式不支持` };
        }
        if (file.size > 30 * 1024 * 1024) {
            return { valid: false, message: `文件 ${file.name} 超过30MB限制` };
        }
    }
    return { valid: true };
}

// 表单提交处理
function handleFormSubmit(form, contractId) {
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const content = document.getElementById('contractContent').value.trim();
        if (!content) {
            alert("合同内容不能为空");
            return;
        }

        const formData = new FormData();
        formData.append("content", content);
        window.deletedAttachments.forEach(filename => {
            formData.append("deletedAttachments", filename);
        });
        window.newAttachments.forEach(file => {
            formData.append("newAttachments", file);
        });

        try {
            const res = await fetch(`/api/contract/finalize/${contractId}`, {
                method: 'POST',
                credentials: 'include',
                body: formData
            });
            const result = await res.json();

            if (!res.ok) {
                if (result.code === 403) {
                    throw new Error("权限不足，无法定稿合同");
                } else if (result.code === 401) {
                    throw new Error("未登录或登录已过期，请重新登录");
                } else {
                    throw new Error(result.msg || "请求失败");
                }
            }

            if (res.ok && result.code === 200) {
                alert("提交成功");
                window.location.href = "/queryAndStatistics/toBeFinalizedContractList.html";
            } else {
                alert("提交失败：" + result.msg);
            }
        } catch (err) {
            console.error('提交出错', err);
            alert("提交出错：" + err.message);
        }
    });
}
