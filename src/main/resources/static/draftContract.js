// 页面加载完成后获取客户列表
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM加载完成，开始加载客户列表');
    loadCustomers();
});

// 加载客户列表
function loadCustomers() {
    console.log('开始加载客户列表');
    fetch('/api/customer/query')
        .then(response => {
            console.log('收到响应:', response);
            if (!response.ok) {
                throw new Error('网络响应异常');
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
        });
}

// 表单提交处理
document.getElementById("draftContractForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const contractName = document.getElementById("contractName").value.trim();
    const startDate = document.getElementById("startDate").value.trim();
    const endDate = document.getElementById("endDate").value.trim();
    const contractContent = document.getElementById("contractContent").value.trim();
    const clientName = document.getElementById("clientName").value.trim();
    const contractFile = document.getElementById("contractFile").files[0];
    const error = document.getElementById("draftError");
    error.textContent = "";

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
    if (!contractContent) {
        error.textContent = "合同内容不能为空！";
        return;
    }

    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(startDate)) {
        error.textContent = "开始时间格式不正确，应为YYYY-MM-DD！";
        return;
    }
    if (!datePattern.test(endDate)) {
        error.textContent = "结束时间格式不正确，应为YYYY-MM-DD！";
        return;
    }

    if (endDate < startDate) {
        error.textContent = "结束时间不能早于开始时间！";
        return;
    }

    const clientNamePattern = /^.+[（(]\d+[）)]$/;
    if (!clientNamePattern.test(clientName)) {
        error.textContent = "客户名称格式不正确，应为：客户名（编号）格式！";
        return;
    }

    if (contractFile) {
        const allowedExtensions = ["doc", "docx", "jpg", "jpeg", "png", "bmp", "gif", "pdf"];
        const fileExt = contractFile.name.split('.').pop().toLowerCase();
        if (!allowedExtensions.includes(fileExt)) {
            error.textContent = "附件格式不正确，只允许doc、docx、pdf、jpg、jpeg、png、bmp、gif！";
            return;
        }

        const maxSize = 30 * 1024 * 1024;
        if (contractFile.size > maxSize) {
            error.textContent = "附件大小不能超过30MB！";
            return;
        }
    }

    const formData = new FormData();
    formData.append("contractName", contractName);
    formData.append("startDate", startDate);
    formData.append("endDate", endDate);
    formData.append("contractContent", contractContent);
    formData.append("clientName", clientName);
    if (contractFile) {
        formData.append("contractFile", contractFile);
    }

    const submitButton = this.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = "提交中...";

    fetch('/api/contract/draft', {
        method: 'POST',
        body: formData
    })
        .then(response => {
            if (!response.ok) throw new Error('网络响应异常');
            return response.json();
        })
        .then(data => {
            if (data.success) {
                alert("合同起草成功！");
                this.reset();
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
