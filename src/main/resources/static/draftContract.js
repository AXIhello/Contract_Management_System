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

    // 5. 如果上传附件，校验格式（附件可选）
    if (contractFile) {
        const allowedExtensions = ["doc", "jpg", "jpeg", "png", "bmp", "gif"];
        const fileExt = contractFile.name.split('.').pop().toLowerCase();
        if (!allowedExtensions.includes(fileExt)) {
            error.textContent = "附件格式不正确，只允许doc、jpg、jpeg、png、bmp、gif！";
            return;
        }
    }

    // TODO: 改成合同起草接口地址，POST 或其他方法
    // TODO: 根据后端API，组装表单数据，可以用FormData传文件
    // const formData = new FormData();
    // formData.append("contractName", contractName);
    // formData.append("startDate", startDate);
    // formData.append("endDate", endDate);
    // formData.append("contractContent", contractContent);
    // formData.append("clientName", clientName);
    // if (contractFile) formData.append("contractFile", contractFile);

    // TODO: 用 fetch 或 XMLHttpRequest 发给后端
    // fetch('/api/contract/draft', {
    //     method: 'POST',
    //     body: formData
    // }).then(res => res.json())
    //   .then(data => {
    //       if(data.success){
    //           alert("起草成功！");
    //           this.reset();
    //       } else {
    //           error.textContent = data.message || "起草失败，请重试！";
    //       }
    //   }).catch(() => {
    //       error.textContent = "网络错误，提交失败！";
    //   });

    // 目前是直接弹成功
    alert("起草成功！");
    this.reset();
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
