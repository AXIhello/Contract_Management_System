package com.example.contract_management_system.controller;


import com.example.contract_management_system.pojo.User;
import com.example.contract_management_system.service.UserService;
import com.example.contract_management_system.util.Result;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;

import com.example.contract_management_system.util.Result;

import java.util.UUID;

@RestController
@RequestMapping("/api/user")
public class LoginController {

    @Autowired
    private UserService userService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @PostMapping("/register")
    public Result<String> register(@RequestParam String username,
                                   @RequestParam String password,
                                   @RequestParam String confirmPassword) {
        User user = new User();
        user.setUsername(username);
        user.setPassword(password);


        boolean success = userService.register(user, confirmPassword);
        if (success) {
            return Result.success("注册成功");
        } else {
            return Result.error("用户名已存在！");
        }
    }

    @PostMapping("/login")
    public Result<String> login(@RequestParam String username,
                                @RequestParam String password,
                                HttpSession session) {
        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(username, password);
        try {
            Authentication authentication = authenticationManager.authenticate(authToken);
            // 登录成功，将认证信息存入Security上下文和session
            SecurityContextHolder.getContext().setAuthentication(authentication);
            session.setAttribute("SPRING_SECURITY_CONTEXT", SecurityContextHolder.getContext());

            return Result.success("登录成功");
        } catch (AuthenticationException e) {
            return Result.error("用户名或密码错误");
        }
    }

//TODO:改用SpringSecurity的登出机制；

//    @PostMapping("/logout")
//    public Result<String> logout(HttpSession session) {
//        session.invalidate(); // 清除当前用户所有会话数据
//        return Result.success("登出成功");
//    }


}


