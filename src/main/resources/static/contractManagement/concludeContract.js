
// 模拟从后台获取合同相关信息（改为真实接口）
// TODO: 替换为真实接口，例如：fetch(`/api/contract/info?id=xxx`)
//function loadContractData() {
  //  return {
    //    contractName: "技术服务合同B",
      //  clientName: "科技公司B",
        //signerName: "张三"
    //};
//}

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
    event.preventDefault();

    const signInfo = document.getElementById("signInfo").value.trim();
    if (!signInfo) {
        alert("请填写签订信息");
        return;
    }

    const payload = {
        contractName: document.getElementById("contractName").value,
        clientName: document.getElementById("clientName").value,
        signerName: document.getElementById("signerName").value,
        signInfo: signInfo
    };

    // TODO: 调用后端提交签订信息的接口，如：
    // fetch('/api/contract/submitSignInfo', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(payload)
    // }).then(res => res.json()).then(result => {
    //     alert("提交成功！");
    //     resetForm();
    // }).catch(err => {
    //     alert("提交失败！");
    // });

    // 示例：临时替代逻辑
    alert(
        `提交成功！\n合同名称: ${payload.contractName}\n` +
        `客户: ${payload.clientName}\n` +
        `签订员: ${payload.signerName}\n` +
        `签订信息: ${payload.signInfo}`
    );

    resetForm();
}

// 初始化函数
function init() {
    populateForm();
    document.getElementById("signContractForm").addEventListener("submit", handleSubmit);
}

window.onload = init;
