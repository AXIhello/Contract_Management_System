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

            console.log("输入用户名：" + username);
            console.log("输入密码：" + password);

            try {
                const res = await fetch(`/api/user/login`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    body: new URLSearchParams({ username: username, password, "remember-me": "true" }),
                    credentials: "include",
                });

                const data = await res.json();

                console.log(data);

                if (data.success) {
                    alert("登录成功，欢迎 " + username);

                    // 判断是否管理员
                    fetch(`/api/right/isAdmin`)
                        .then(res => res.text())  // 注意：返回的是文本，需要转成布尔值
                        .then(text => {
                            const isAdmin = text === "true";
                            if (isAdmin) {
                                window.location.href = "/dashboard-admin.html";
                            } else {
                                window.location.href = "/dashboard-user.html";
                            }
                        })
                        .catch(err => {
                            console.error("权限判断失败", err);
                            window.location.href = "/dashboard-user.html";
                        });

                } else {
                    error.textContent = data.msg;
                }

            } catch (err) {
                error.textContent = err.message || "网络错误，请稍后再试";
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

            const strongPasswordRegex = /^(?=.*[A-Za-z])(?=.*\d).{7,}$/;

            if (!strongPasswordRegex.test(password)) {
                error.textContent = "密码必须大于6位，且包含字母和数字";
                return;
            }


            try {
                const res = await fetch(`/api/user/register`, {
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

                const data = await res.json();

                if (!res.ok) {
                    if (data.code === 403) {
                        throw new Error("权限不足，无法起草合同");
                    } else if (data.code === 401) {
                        throw new Error("未登录或登录已过期，请重新登录");
                    } else {
                        throw new Error(data.msg || "请求失败");
                    }
                }

                if (data.success) {
                    alert("注册成功！");
                    window.location.href = "/userManagement/login.html";
                } else {
                    error.textContent = data.msg;
                }
            } catch (err) {
                error.textContent = err.message || "网络错误，请稍后再试";
                console.error(err);
            }
        });
    }
});
