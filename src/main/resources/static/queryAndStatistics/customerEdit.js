// 解析 URL 参数获取客户 ID
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

const customerId = getQueryParam("id");

window.onload = () => {
    if (!customerId) {
        alert("未指定客户 ID");
        window.location.href = "customerQuery.html";
        return;
    }
    fetch(`/api/customer/query?id=${customerId}`)
        .then(res => res.json())
        .then(data => {
            if (data.success && data.data) {
                populateForm(data.data);
            } else {
                alert(data.msg || "获取客户信息失败！");
                window.location.href = "customerQuery.html";
            }
        })
        .catch(err => {
            console.error(err);
            alert("系统异常！");
            window.location.href = "customerQuery.html";
        });

    const form = document.getElementById("editForm");
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const customer = {
            id: customerId,
            name: document.getElementById("name").value.trim(),
            address: document.getElementById("address").value.trim(),
            tel: document.getElementById("tel").value.trim(),
            fax: document.getElementById("fax").value.trim(),
            code: document.getElementById("code").value.trim(),
            bank: document.getElementById("bank").value.trim(),
            account: document.getElementById("account").value.trim(),
            note: document.getElementById("note").value.trim(),
        };

        fetch("/api/customer/update", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(customer)
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    alert("客户信息更新成功！");
                    window.location.href = "customerQuery.html";
                } else {
                    alert(data.msg || "更新失败！");
                }
            })
            .catch(err => {
                console.error(err);
                alert("请求异常！");
            });
    });
};

function populateForm(c) {
    document.getElementById("id").value = c.id;
    document.getElementById("name").value = c.name ?? "";
    document.getElementById("address").value = c.address ?? "";
    document.getElementById("tel").value = c.tel ?? "";
    document.getElementById("fax").value = c.fax ?? "";
    document.getElementById("code").value = c.code ?? "";
    document.getElementById("bank").value = c.bank ?? "";
    document.getElementById("account").value = c.account ?? "";
    document.getElementById("note").value = c.note ?? "";
}
