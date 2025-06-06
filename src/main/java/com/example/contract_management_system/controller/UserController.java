package com.example.contract_management_system.controller;


import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.example.contract_management_system.mapper.UserMapper;
import com.example.contract_management_system.pojo.User;
import com.example.contract_management_system.service.UserService;
import com.example.contract_management_system.util.Result;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;

    private final AuthenticationManager authenticationManager;

    private final UserMapper userMapper;

    public UserController(UserService userService, AuthenticationManager authenticationManager, UserMapper userMapper) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
        this.userMapper = userMapper;
    }

    @GetMapping("/list")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

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

            // 查询数据库，返回完整用户信息
            QueryWrapper<User> query = new QueryWrapper<>();
            query.eq("username", username);

            User user = userMapper.selectOne(query);

            return Result.success(user.getUsername() + user.getUserId() +"登录成功");
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

    @GetMapping("/current-id")
    public ResponseEntity<Integer> getCurrentUserId() {
        Integer userId = userService.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
        return ResponseEntity.ok(userId);
    }

    //获取完整用户信息
    @GetMapping("/current")
    public ResponseEntity<?> getCurrentUserInfo() {
        Integer userId = userService.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("未登录");
        }

        // 获取 user
        User user = userMapper.selectById(userId);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("用户不存在");
        }

        // 单独查 role name，不加在 User 类里
        //String roleName = roleMapper.selectById(Role.getRole_id()).getName();

        // 返回需要的信息
        Map<String, Object> result = new HashMap<>();
        result.put("userId", user.getUserId());
        result.put("username", user.getUsername());
        //result.put("roleName", roleName);

        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/delete/{id}")
    public Result<String> deleteUserById(@PathVariable("id") int userId) {
        boolean success = userService.deleteUserById(userId);
        if (success) {
            return Result.success("删除成功！");
        } else {
            return Result.error("删除失败，用户不存在！");
        }
    }

    @GetMapping("/detail/{id}")
    public Result<User> getUserDetail(@PathVariable("id") int id) {
        User user = userService.getById(id);
        if (user != null) {
            return Result.success(user);
        } else {
            return Result.error("用户不存在");
        }
    }

    @PostMapping("/update")
    public Result<?> updateUser(@RequestBody User user) {
        // 查找原始用户
        User original = userService.getById(user.getUserId());
        if (original == null) {
            return Result.error("用户不存在");
        }

//        // 检查用户名是否已被其他用户占用（排除当前用户）
//        QueryWrapper<User> query = new QueryWrapper<>();
//        query.eq("username", user.getUsername())
//                .ne("user_id", user.getUserId());  // user_id字段根据数据库字段名调整
//
//        int count = userService.count(query);
//        if (count > 0) {
//            return Result.error("用户名已存在，请更换其他用户名");
//        }

        // 更新用户名
        original.setUsername(user.getUsername());

        // 更新密码（如果有）
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            original.setPassword(user.getPassword()); // 建议加密处理
        }

        boolean success = userService.updateById(original);
        return success ? Result.success(null) : Result.error("更新失败");
    }



}


