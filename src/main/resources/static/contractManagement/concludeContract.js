// signContract.js

// 模拟从后台获取合同相关信息
function loadContractData() {
    return {
        contractName: "技术服务合同B",
        clientName: "科技公司B",
        signerName: "张三"
    };
}

// 页面加载时填充合同信息
function populateForm() {
    const data = loadContractData();
    document.getElementById("contractName").value = data.contractName;
    document.getElementById("clientName").value = data.clientName;
    document.getElementById("signerName").value = data.signerName;
}

// 重置签订信息输入框（不影响只读字段）
function resetForm() {
    document.getElementById("signInfo").value = "";
}

// 处理表单提交事件
function handleSubmit(event) {
    event.preventDefault(); // 阻止表单默认提交行为

    const signInfo = document.getElementById("signInfo").value.trim();
    if (!signInfo) {
        alert("请填写签订信息");
        return;
    }

    // 这里可以替换成你的 AJAX 提交逻辑
    alert(
        `提交成功！\n合同名称: ${document.getElementById("contractName").value}\n` +
        `客户: ${document.getElementById("clientName").value}\n` +
        `签订员: ${document.getElementById("signerName").value}\n` +
        `签订信息: ${signInfo}`
    );

    resetForm();
}

// 初始化，绑定事件，页面加载调用
function init() {
    populateForm();
    document.getElementById("signContractForm").addEventListener("submit", handleSubmit);
}

window.onload = init;
