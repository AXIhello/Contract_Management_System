// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM加载完成，开始初始化');

    // 设置输入框为加载状态
    setInputsLoading(true);

    // 并行加载客户列表和初始化附件功能
    Promise.all([
        loadCustomers(),
        initAttachments()
    ]).finally(() => {
        // 无论成功失败，都解除输入框的加载状态
        setInputsLoading(false);
    });

    // 设置日期联动
    setupDateValidation();

    // 设置表单提交处理
    setupFormSubmission();
});

// 设置输入框加载状态
function setInputsLoading(isLoading) {
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.disabled = isLoading;
        input.style.opacity = isLoading ? '0.7' : '1';
        input.style.cursor = isLoading ? 'not-allowed' : 'auto';
    });
}

// 加载客户列表
async function loadCustomers() {
    try {
        console.log('开始加载客户列表');
        const response = await fetch('/api/customer/query');

        if (!response.ok) {
            throw new Error('网络响应异常');
        }

        const data = await response.json();
        console.log('客户数据:', data);

        if (data.success) {
            const clientList = document.getElementById('clientList');
            clientList.innerHTML = '';

            if (data.data && data.data.length > 0) {
                console.log('开始处理客户数据，数量:', data.data.length);
                data.data.forEach((customer, index) => {
                    const option = document.createElement('option');
                    option.value = `${customer.name}（${customer.num}）`;
                    clientList.appendChild(option);
                });
                console.log('客户列表加载完成');
            } else {
                console.log('没有找到客户数据');
            }
        } else {
            console.error('获取客户列表失败:', data.message);
        }
    } catch (error) {
        console.error('获取客户列表出错:', error);
    }
}

// 初始化附件上传功能
function initAttachments() {
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
        fileInput.multiple = true; // 允许多文件选择

        // 添加到文档中
        document.body.appendChild(fileInput);

        // 监听文件选择
        fileInput.addEventListener('change', function(e) {
            const files = Array.from(e.target.files);

            files.forEach(file => {
                // 检查文件是否已存在
                if (allAttachments.some(a => a.name === file.name && a.size === file.size)) {
                    showError('该文件已添加');
                    return;
                }

                // 添加到附件列表
                allAttachments.push(file);
                updateAttachmentsPreview();
            });

            // 移除临时文件输入框
            document.body.removeChild(fileInput);
        });

        // 触发文件选择对话框
        fileInput.click();
    });
}

// 动态限制结束时间不能小于开始时间
function setupDateValidation() {
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

// 设置表单提交处理
function setupFormSubmission() {
    document.getElementById("draftContractForm").addEventListener("submit", async function (e) {
        e.preventDefault();
        const form = this;
        const error = document.getElementById("draftError");
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;

        try {
            // 设置所有输入框为禁用状态
            setInputsLoading(true);
            submitButton.disabled = true;
            submitButton.textContent = "提交中...";
            error.textContent = "";

            // 验证表单
            const formData = validateForm(form);

            // 验证附件
            validateAttachments();

            // 提交表单数据
            const response = await fetch('/api/contract/draft', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('网络响应异常');
            }

            const data = await response.json();

            if (data.success) {
                alert("合同起草成功！");
                form.reset();
                allAttachments = [];
                updateAttachmentsPreview();
                window.location.href = '/contracts';
            } else {
                throw new Error(data.message || "起草失败，请重试！");
            }
        } catch (err) {
            console.error('提交失败:', err);
            showError(err.message || "网络错误，请检查网络连接后重试！");
        } finally {
            // 恢复输入框状态
            setInputsLoading(false);
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    });
}

// 验证表单数据
function validateForm(form) {
    const contractName = document.getElementById("contractName").value.trim();
    const startDate = document.getElementById("startDate").value.trim();
    const endDate = document.getElementById("endDate").value.trim();
    const contractContent = document.getElementById("contractContent").value.trim();
    const clientName = document.getElementById("clientName").value.trim();

    if (!contractName) throw new Error("合同名称不能为空！");
    if (!startDate) throw new Error("开始时间不能为空！");
    if (!endDate) throw new Error("结束时间不能为空！");
    if (!clientName) throw new Error("客户不能为空！");
    if (!contractContent) throw new Error("合同内容不能为空！");

    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(startDate)) throw new Error("开始时间格式不正确，应为YYYY-MM-DD！");
    if (!datePattern.test(endDate)) throw new Error("结束时间格式不正确，应为YYYY-MM-DD！");
    if (endDate < startDate) throw new Error("结束时间不能早于开始时间！");

    const clientNamePattern = /^.+[（(]\d+[）)]$/;
    if (!clientNamePattern.test(clientName)) throw new Error("客户名称格式不正确，应为：客户名（编号）格式！");

    // 创建 FormData 对象
    const formData = new FormData(form);

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

    return formData;
}

// 验证附件
function validateAttachments() {
    if (allAttachments.length === 0) {
        throw new Error("请至少上传一个附件");
    }

    for (let i = 0; i < allAttachments.length; i++) {
        const file = allAttachments[i];
        const allowedExtensions = ["doc", "docx", "jpg", "jpeg", "png", "bmp", "gif", "pdf"];
        const fileExt = file.name.split('.').pop().toLowerCase();

        if (!allowedExtensions.includes(fileExt)) {
            throw new Error(`附件"${file.name}"格式不正确，只允许doc、docx、pdf、jpg、jpeg、png、bmp、gif！`);
        }

        const maxSize = 30 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new Error(`附件"${file.name}"大小不能超过30MB！`);
        }
    }
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
    document.getElementById('draftContractForm').reset();
    document.getElementById('draftError').textContent = '';
    allAttachments = [];
    updateAttachmentsPreview();
};

// 显示错误信息
function showError(message) {
    const error = document.getElementById("draftError");
    error.textContent = message;
}