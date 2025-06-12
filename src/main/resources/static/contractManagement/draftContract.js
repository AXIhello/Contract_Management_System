let allAttachments=[];
// 页面加载完成后获取客户列表
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM加载完成，开始加载客户列表');
    // 设置输入框为加载状态
    setInputsLoading(true);
    loadCustomers();

    // 初始化附件预览
    updateAttachmentsPreview();
});

// 设置输入框加载状态
function setInputsLoading(isLoading) {
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.disabled = isLoading;
        if (isLoading) {
            input.style.opacity = '0.7';
            input.style.cursor = 'not-allowed';
        } else {
            input.style.opacity = '1';
            input.style.cursor = 'auto';
        }
    });
}

// 加载客户列表
function loadCustomers() {
    console.log('开始加载客户列表');
    fetch('/api/customer/query')
        .then(response => {
            console.log('收到响应:', response);
            if (!response.ok) {
                // 权限不足或未登录等
                if (data.code === 403) {
                    throw new Error("权限不足，无法查询客户");
                } else if (data.code === 401) {
                    throw new Error("未登录或登录已过期，请重新登录");
                } else {
                    throw new Error(data.msg || "请求失败");
                }
            }
            return response.json();
        })
        .then(data => {
            console.log('客户数据:', data);
            if (data.success) {
                const clientList = document.getElementById('clientList');
                console.log('找到clientList元素:', clientList);
                clientList.innerHTML = '';

                if (data.data && data.data.length > 0) {
                    console.log('开始处理客户数据，数量:', data.data.length);
                    data.data.forEach((customer, index) => {
                        console.log(`处理第${index + 1}个客户:`, customer);
                        const option = document.createElement('option');
                        const optionValue = `${customer.name}（${customer.num}）`;
                        console.log('设置选项值:', optionValue);
                        option.value = optionValue;
                        clientList.appendChild(option);
                    });
                    console.log('客户列表加载完成，共加载', data.data.length, '个客户');

                    // 验证选项是否已添加
                    const options = clientList.getElementsByTagName('option');
                    console.log('当前datalist中的选项数量:', options.length);
                    for (let i = 0; i < options.length; i++) {
                        console.log(`选项${i + 1}:`, options[i].value);
                    }
                } else {
                    console.log('没有找到客户数据');
                }
            } else {
                console.error('获取客户列表失败:', data.message);
            }
        })
        .catch(error => {
            console.error('获取客户列表出错:', error);
        })
        .finally(() => {
            // 无论成功失败，都解除输入框的加载状态
            setInputsLoading(false);
        });
}

// 表单提交处理
document.getElementById("draftContractForm").addEventListener("submit", function (e) {
    e.preventDefault();

    // 设置所有输入框为禁用状态
    setInputsLoading(true);

    const contractName = document.getElementById("contractName").value.trim();
    const startDate = document.getElementById("startDate").value.trim();
    const endDate = document.getElementById("endDate").value.trim();
    const contractContent = document.getElementById("contractContent").value.trim();
    const clientName = document.getElementById("clientName").value.trim();
    const error = document.getElementById("draftError");
    error.textContent = "";

    if (!contractName) {
        error.textContent = "合同名称不能为空！";
        setInputsLoading(false);
        return;
    }
    if (!startDate) {
        error.textContent = "开始时间不能为空！";
        setInputsLoading(false);
        return;
    }
    if (!endDate) {
        error.textContent = "结束时间不能为空！";
        setInputsLoading(false);
        return;
    }
    if (!clientName) {
        error.textContent = "客户不能为空！";
        setInputsLoading(false);
        return;
    }
    if (!contractContent) {
        error.textContent = "合同内容不能为空！";
        setInputsLoading(false);
        return;
    }

    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(startDate)) {
        error.textContent = "开始时间格式不正确，应为YYYY-MM-DD！";
        setInputsLoading(false);
        return;
    }
    if (!datePattern.test(endDate)) {
        error.textContent = "结束时间格式不正确，应为YYYY-MM-DD！";
        setInputsLoading(false);
        return;
    }

    if (endDate < startDate) {
        error.textContent = "结束时间不能早于开始时间！";
        setInputsLoading(false);
        return;
    }

    const clientNamePattern = /^.+[（(]\d+[）)]$/;
    if (!clientNamePattern.test(clientName)) {
        error.textContent = "客户名称格式不正确，应为：客户名（编号）格式！";
        setInputsLoading(false);
        return;
    }

    // 验证附件
    if (allAttachments.length > 0) {
        for (let i = 0; i < allAttachments.length; i++) {
            const file = allAttachments[i];
            const allowedExtensions = ["doc", "docx", "jpg", "jpeg", "png", "bmp", "gif", "pdf"];
            const fileExt = file.name.split('.').pop().toLowerCase();

            if (!allowedExtensions.includes(fileExt)) {
                error.textContent = `附件"${file.name}"格式不正确，只允许doc、docx、pdf、jpg、jpeg、png、bmp、gif！`;
                setInputsLoading(false);
                return;
            }

            const maxSize = 30 * 1024 * 1024;
            if (file.size > maxSize) {
                error.textContent = `附件"${file.name}"大小不能超过30MB！`;
                setInputsLoading(false);
                return;
            }
        }
    }

    // 确保所有附件被添加到表单数据
    const formData = new FormData();
    formData.append("contractName", contractName);
    formData.append("startDate", startDate);
    formData.append("endDate", endDate);
    formData.append("contractContent", contractContent);
    formData.append("clientName", clientName);

    // 移除旧的附件
    for (let key of formData.keys()) {
        if (key.startsWith('contractFiles')) {
            formData.delete(key);
        }
    }

    // 添加所有附件
    allAttachments.forEach(file => {
        formData.append('contractFiles', file);
    });

    const submitButton = this.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = "提交中...";

    console.log('[2] 添加附件后内容:');
    for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
    }

    fetch('/api/contract/draft', {
        method: 'POST',
        body: formData
    })
        .then(async response => {
            const data = await response.json();

            if (!response.ok) {
                // 权限不足或未登录等
                if (data.code === 403) {
                    throw new Error("权限不足，无法起草合同");
                } else if (data.code === 401) {
                    throw new Error("未登录或登录已过期，请重新登录");
                } else {
                    throw new Error(data.msg || "请求失败");
                }
            }

            return data;
        })
        .then(data => {
            alert("合同起草成功！");
            this.reset();
            allAttachments = [];
            updateAttachmentsPreview();

            fetch(`/api/right/isAdmin`)
                .then(res => res.text())  // 注意：返回的是文本，需要转成布尔值
                .then(text => {
                    const isAdmin = text === "true";
                    if (isAdmin) {
                        window.location.href = "/dashboard-admin.html";
                    } else {
                        window.location.href = "/dashboard-user.html";
                    }
                })
                .catch(err => {
                    console.error("权限判断失败", err);
                    window.location.href = "/dashboard-user.html";
                });
        })
        .catch(err => {
            console.error('提交失败:', err);
            error.textContent = err.message || "网络错误，请稍后重试";
            setInputsLoading(false);
        })
        .finally(() => {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        });
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

// 多附件上传功能
document.addEventListener('DOMContentLoaded', function() {
    // 存储所有附件的数组
    window.allAttachments = [];
    let attachmentCounter = 0;

    // 添加附件按钮点击事件
    document.getElementById('addAttachmentBtn').addEventListener('click', function() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.doc,.docx,.pdf,.jpg,.jpeg,.png,.bmp,.gif';
        fileInput.id = `attachment-${attachmentCounter++}`;
        fileInput.style.display = 'none';

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
});

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
    document.getElementById('draftContractForm').reset();
    document.getElementById('draftError').textContent = '';
    allAttachments = [];
    updateAttachmentsPreview();
};