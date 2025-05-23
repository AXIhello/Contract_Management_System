document.getElementById("addCustomerForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("customerName").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const address = document.getElementById("address").value.trim();
    const fax = document.getElementById("fax").value.trim();
    const email = document.getElementById("email").value.trim();
    const bankName = document.getElementById("bankName").value.trim();
    const bankAccount = document.getElementById("bankAccount").value.trim();
    const notes = document.getElementById("notes").value.trim();
    const result = document.getElementById("resultMessage");

    result.style.color = "red";
    result.textContent = "";

    // 1. 必填项逐条检查
    if (!name) {
        result.textContent = "客户名称不能为空！";
        return;
    }
    if (!phone) {
        result.textContent = "电话不能为空！";
        return;
    }
    if (!address) {
        result.textContent = "地址不能为空！";
        return;
    }

    // 2. 邮箱格式校验（如果填写了邮箱）
    if (email && !/^[\w.-]+@[\w.-]+\.\w+$/.test(email)) {
        result.textContent = "邮箱格式不正确！";
        return;
    }

    // 3. 构造数据
    const customerData = {
        name,
        phone,
        address,
        fax,
        email,
        bankName,
        bankAccount,
        notes,
    };

    // TODO: 接入真实添加客户接口
    // fetch("/api/customers/add", {
    //     method: "POST",
    //     headers: {
    //         "Content-Type": "application/json"
    //     },
    //     body: JSON.stringify(customerData)
    // })
    // .then(response => {
    //     if (!response.ok) throw new Error("系统异常");
    //     return response.json();
    // })
    // .then(data => {
    //     if (data.success) {
    //         result.style.color = "green";
    //         result.textContent = "添加成功！";
    //     } else {
    //         result.textContent = "添加失败：" + (data.message || "请检查填写内容");
    //     }
    // })
    // .catch(error => {
    //     console.error("系统异常：", error);
    //     window.location.href = "/error.html";
    // });
    // ================================

    // 当前仅模拟成功
    alert("客户添加成功！");
    this.reset(); // 清空表单
});
