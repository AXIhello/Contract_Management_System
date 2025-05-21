document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const username = document.getElementById("username").value.trim();
            const password = document.getElementById("password").value.trim();
            const error = document.getElementById("loginError");

            if (!username || !password) {
                error.textContent = "用户名和密码不能为空";
                return;
            }

            // TODO: 替换下面这块“模拟判断逻辑”为真实后端请求
            // 比如用 fetch("/api/login", {...})
            // 提交 username 和 password，后端返回角色再做跳转
            if (username === "admin" && password === "admin") {
                window.location.href = "/admin.html"; // TODO: 也可能跳转路径需要后端返回
            } else if (username === "user" && password === "user") {
                window.location.href = "/operator.html";
            } else {
                error.textContent = "用户名或密码错误！";
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const username = document.getElementById("regUsername").value.trim();
            const password = document.getElementById("regPassword").value.trim();
            const confirm = document.getElementById("confirmPassword").value.trim();
            const error = document.getElementById("registerError");

            if (!username || !password || !confirm) {
                error.textContent = "所有字段不能为空";
                return;
            }
            if (password !== confirm) {
                error.textContent = "两次输入的密码不一致";
                return;
            }

            // TODO: 这里改成发送真实注册请求给后端
            // 比如 fetch("/api/register", { method: "POST", body: JSON.stringify({...}) })

            // 模拟注册成功提示
            alert("注册成功！");
            window.location.href = "/login.html"; // TODO: 注册成功后的跳转可根据后端返回结果调整
        });
    }
});
