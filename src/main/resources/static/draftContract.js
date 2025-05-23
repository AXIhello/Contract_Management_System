document.getElementById("draftContractForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const contractName = document.getElementById("contractName").value.trim();
    const startDate = document.getElementById("startDate").value.trim();
    const endDate = document.getElementById("endDate").value.trim();
    const contractContent = document.getElementById("contractContent").value.trim();
    const clientName = document.getElementById("clientName").value.trim();
    const contractFile = document.getElementById("contractFile").files[0];
    const error = document.getElementById("draftError");
    error.textContent = "";

    // 1. 必填项逐条检查
    if (!contractName) {
        error.textContent = "合同名称不能为空！";
        return;
    }
    if (!startDate) {
        error.textContent = "开始时间不能为空！";
        return;
    }
    if (!endDate) {
        error.textContent = "结束时间不能为空！";
        return;
    }
    if (!clientName) {
        error.textContent = "客户不能为空！";
        return;
    }

    // 2. 合同内容必须填写
    if (!contractContent) {
        error.textContent = "合同内容不能为空！";
        return;
    }

    // 3. 日期格式校验
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(startDate)) {
        error.textContent = "开始时间格式不正确，应为YYYY-MM-DD！";
        return;
    }
    if (!datePattern.test(endDate)) {
        error.textContent = "结束时间格式不正确，应为YYYY-MM-DD！";
        return;
    }

    // 4. 结束时间 >= 开始时间 校验
    if (endDate < startDate) {
        error.textContent = "结束时间不能早于开始时间！";
        return;
    }

    // 5. 客户名称格式校验（客户名（编号））
    const clientNamePattern = /^.+（\d+）$/;
    if (!clientNamePattern.test(clientName)) {
        error.textContent = "客户名称格式不正确，应为：客户名（编号）格式！";
        return;
    }

    // 6. 如果上传附件，校验格式（附件可选）
    if (contractFile) {
        const allowedExtensions = ["doc", "docx", "jpg", "jpeg", "png", "bmp", "gif", "pdf"];
        const fileExt = contractFile.name.split('.').pop().toLowerCase();
        if (!allowedExtensions.includes(fileExt)) {
            error.textContent = "附件格式不正确，只允许doc、docx、pdf、jpg、jpeg、png、bmp、gif！";
            return;
        }

        // 文件大小限制（例如10MB）
        const maxSize = 30 * 1024 * 1024; // 30MB
        if (contractFile.size > maxSize) {
            error.textContent = "附件大小不能超过30MB！";
            return;
        }
    }

    // 组装表单数据
    const formData = new FormData();
    formData.append("contractName", contractName);
    formData.append("startDate", startDate);
    formData.append("endDate", endDate);
    formData.append("contractContent", contractContent);
    formData.append("clientName", clientName);

    // 获取当前用户姓名
    const userName = getCurrentUserName();
    if (!userName) {
        error.textContent = "获取用户信息失败，请重新登录！";
        return;
    }
    formData.append("userName", userName);

    if (contractFile) {
        formData.append("contractFile", contractFile);
    }

    // 显示加载状态
    const submitButton = this.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = "提交中...";

    // 发送请求到后端
    fetch('/api/contract/draft', {
        method: 'POST',
        body: formData
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('网络响应异常');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                alert("合同起草成功！");
                this.reset(); // 重置表单
                // 可选：跳转到合同列表页面
                window.location.href = '/contracts';
            } else {
                error.textContent = data.message || "起草失败，请重试！";
            }
        })
        .catch(err => {
            console.error('提交失败:', err);
            error.textContent = "网络错误，请检查网络连接后重试！";
        })
        .finally(() => {
            // 恢复按钮状态
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

// 获取当前用户姓名的函数
function getCurrentUserName() {
    // 从session中获取用户信息
    return fetch('/api/user/current')
        .then(response => response.json())
        .then(data => {
            if (data.code === 200 && data.data) {
                return data.data.name;
            }
            throw new Error('获取用户信息失败');
        })
        .catch(error => {
            console.error('获取用户信息失败:', error);
            return null;
        });
}