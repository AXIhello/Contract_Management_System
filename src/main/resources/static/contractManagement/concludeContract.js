// 已有附件数组，格式示例：[{id, name, url}]
window.existingAttachments = [];

// 页面初始化
window.onload = async function () {
    const contractId = new URLSearchParams(window.location.search).get("id");
    if (!contractId) {
        document.getElementById("errorMessage").innerText = "未提供合同 ID。";
        return;
    }

    try {
        // 获取合同信息
        const response = await fetch(`/api/contract/concludeInfo/${contractId}`, {
            method: 'GET',
            credentials: 'include'
        });

        const result = await response.json();
        if (!response.ok) {
            if (result.code === 403) {
                throw new Error("权限不足，无法起草合同");
            } else if (result.code === 401) {
                throw new Error("未登录或登录已过期，请重新登录");
            } else {
                throw new Error(result.msg || "请求失败");
            }
        }

        if (result.code !== 200) throw new Error(result.msg);
        const contract = result.data;

        // 填充合同基本信息
        document.getElementById("contractName").value = contract.contractName || "";
        document.getElementById("clientName").value = contract.customer || "";
        document.getElementById("signerName").value = contract.concludeId || "";
        document.getElementById("contractInfo").value = contract.contractContent || "";

        // 处理审批意见
        const comments = contract.examineComments || [];
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
    } catch (err) {
        console.error("加载合同失败", err);
        document.getElementById("errorMessage").innerText = "加载合同失败：" + err.message;
        return;
    }

    // 已有附件加载
    await loadExistingAttachments(contractId);
};

// 获取已有附件
async function loadExistingAttachments(contractId) {
    try {
        const res = await fetch(`/api/contract/attachment/get/${contractId}`, {
            method: 'GET',
            credentials: 'include',
        });

        const data = await res.json();
        if (!res.ok) {
            if (data.code === 403) {
                throw new Error("权限不足，无法获取附件");
            } else if (data.code === 401) {
                throw new Error("未登录或登录已过期，请重新登录");
            } else {
                throw new Error(data.msg || "请求失败");
            }
        }

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
        if (container) container.innerHTML = '<p style="color:red;">加载附件失败：' + err.message + '</p>';
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

        div.appendChild(fileInfo);
        div.appendChild(downloadBtn);
        container.appendChild(div);
    });
}

// 设置输入框加载状态
function setInputsLoading(isLoading) {
    const editableSelectors = ['#signInfo', 'button[type="submit"]'];
    editableSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            element.disabled = isLoading;
            element.style.opacity = isLoading ? '0.7' : '1';
            element.style.cursor = isLoading ? 'not-allowed' : (element.type === 'button' ? 'pointer' : 'auto');
        });
    });
}

// 重置表单
function resetForm() {
    document.getElementById('signInfo').value = '';
    document.getElementById('errorMessage').innerText = '';
    const contractId = new URLSearchParams(window.location.search).get("id");
    if (contractId) {
        loadExistingAttachments(contractId);
    }
}

// 表单提交
const form = document.getElementById('signContractForm');
if (form) {
    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const errorMessage = document.getElementById('errorMessage');
        if (errorMessage) errorMessage.innerText = '';

        setInputsLoading(true);

        const contractId = new URLSearchParams(window.location.search).get("id");
        if (!contractId) {
            if (errorMessage) errorMessage.innerText = '合同ID不能为空';
            setInputsLoading(false);
            return;
        }

        const signInfo = document.getElementById('signInfo').value.trim();
        if (!signInfo) {
            if (errorMessage) errorMessage.innerText = '签订信息不能为空';
            setInputsLoading(false);
            return;
        }

        try {
            const formData = new FormData();
            formData.append('contractId', contractId);
            formData.append('signInfo', signInfo);

            const res = await fetch('/api/contract/submitSignInfo', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            const result = await res.json();
            if (!res.ok) {
                if (result.code === 403) {
                    throw new Error("权限不足，无法提交签订信息");
                } else if (result.code === 401) {
                    throw new Error("未登录或登录已过期，请重新登录");
                } else {
                    throw new Error(result.msg || "请求失败");
                }
            }

            if (result.code !== 200) {
                throw new Error(result.msg || '提交失败');
            }

            alert('签订信息提交成功！');
            window.location.href = '/contracts/list';

        } catch (err) {
            console.error("提交失败", err);
            if (errorMessage) errorMessage.innerText = "提交失败：" + err.message;
        } finally {
            setInputsLoading(false);
        }
    });
}
