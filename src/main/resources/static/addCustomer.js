document.getElementById("addCustomerForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const address = document.getElementById("address").value.trim();
    const tel = document.getElementById("tel").value.trim();
    const fax = document.getElementById("fax").value.trim();
    const code = document.getElementById("code").value.trim();
    const bank = document.getElementById("bank").value.trim();
    const account = document.getElementById("account").value.trim();
    const note = document.getElementById("note").value.trim();
    const result = document.getElementById("resultMessage");

    result.style.color = "red";
    result.textContent = "";

    if (!name || !tel || !address) {
        result.textContent = "请填写完整的客户信息！";
        return;
    }

    const customerData = {
        name,
        address,
        tel,
        fax,
        code,
        bank,
        account,
        note,
    };

    console.log("提交数据：", customerData);  // 调试用

    fetch("/api/customer/add", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(customerData)
    })
        .then(response => {
            if (!response.ok) throw new Error("系统异常");
            return response.json();
        })
        .then(data => {
            if (data.success) {
                result.style.color = "green";
                result.textContent = "添加成功！";
                document.getElementById("addCustomerForm").reset();
            } else {
                result.textContent = "添加失败：" + (data.message || "请检查填写内容");
            }
        })
        .catch(error => {
            console.error("系统异常：", error);
            result.textContent = "系统异常！";
        });
});
