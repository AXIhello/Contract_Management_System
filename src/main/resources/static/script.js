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

            try {
                const res = await fetch("/api/user/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    body: new URLSearchParams({ username: username, password }),
                });

                const result = await res.json();

                if (result.code === 200) {
                    const user = result.data;
                    alert("登录成功，欢迎 " + user.username);
                    // 根据用户身份跳转（示例：根据用户名判断）
                    if (user.username === "admin") {
                        window.location.href = "/admin.html";
                    } else {
                        window.location.href = "/operator.html";
                    }
                } else {
                    error.textContent = result.msg;
                }
            } catch (err) {
                error.textContent = "网络错误，请稍后再试";
                console.error(err);
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

            try {
                const res = await fetch("/api/user/register", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    body: new URLSearchParams({
                        username: username,
                        password,
                        confirmPassword: confirm,
                    }),
                });

                const result = await res.json();

                if (result.code === 200) {
                    alert("注册成功！");
                    window.location.href = "/login.html";
                } else {
                    error.textContent = result.msg;
                }
            } catch (err) {
                error.textContent = "网络错误，请稍后再试";
                console.error(err);
            }
        });
    }
});
