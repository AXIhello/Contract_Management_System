package com.example.contract_management_system.controller;


import com.example.contract_management_system.pojo.User;
import com.example.contract_management_system.service.UserService;
import com.example.contract_management_system.util.Result;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class LoginController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public Result<String> register(@RequestParam String username,
                                   @RequestParam String password,
                                   @RequestParam String confirmPassword) {
        User user = new User();
        user.setName(username);
        user.setPassword(password);


        boolean success = userService.register(user, confirmPassword);
        if (success) {
            return Result.success("注册成功");
        } else {
            return Result.error("用户名已存在！");
        }
    }

    @PostMapping("/login")
    public Result<User> login(@RequestParam String username,
                              @RequestParam String password,
                              HttpSession session) {
        User user = userService.login(username, password);
        if (user == null) {
            return Result.error("用户名或密码错误！");
        }
        session.setAttribute("loginUser", user);
        return Result.success(user); // 或 Result.success("登录成功")
    }
}


