package com.example.contract_management_system.controller;


import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.example.contract_management_system.mapper.RightMapper;
import com.example.contract_management_system.mapper.RoleMapper;
import com.example.contract_management_system.mapper.UserMapper;
import com.example.contract_management_system.pojo.User;
import com.example.contract_management_system.service.UserService;
import com.example.contract_management_system.util.Result;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
    private final RightMapper rightMapper;

    public UserController(UserService userService, AuthenticationManager authenticationManager, UserMapper userMapper,RightMapper rightMapper) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
        this.userMapper = userMapper;
        this.rightMapper = rightMapper;
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

    @PreAuthorize("hasAuthority('add_user')")
    @PostMapping("/add")
    public Result<String> add(@RequestParam String username,
                                   @RequestParam String password,
                                   @RequestParam String confirmPassword) {
        User user = new User();
        user.setUsername(username);
        user.setPassword(password);


        boolean success = userService.register(user, confirmPassword);
        if (success) {
            return Result.success("添加成功");
        } else {
            return Result.error("用户名已存在！");
        }
    }

    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestParam String username,
                                             @RequestParam String password,
                                             HttpSession session) {
        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(username, password);
        try {
            Authentication authentication = authenticationManager.authenticate(authToken);
            SecurityContextHolder.getContext().setAuthentication(authentication);
            session.setAttribute("SPRING_SECURITY_CONTEXT", SecurityContextHolder.getContext());

            QueryWrapper<User> query = new QueryWrapper<>();
            query.eq("username", username);
            User user = userMapper.selectOne(query);

            // 创建返回的数据Map
            Map<String, Object> data = new HashMap<>();
            data.put("userId", user.getUserId());
            data.put("username", user.getUsername());
            data.put("message", "登录成功");

            return Result.success(data);
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

        //获取角色名
        List<String> roleNames = rightMapper.selectRoleNameByUserId(userId);

        String roleName = "未知角色"; // 默认值

        // **适配逻辑：从列表中安全地提取唯一的角色名称**
        if (roleNames != null && !roleNames.isEmpty()) {
            roleName = roleNames.get(0);

            // ⚠️ 建议：如果按业务逻辑“应该”只有一个，但实际可能出现多个，
            // 可以添加一个日志或异常处理，以防数据不一致。
            // if (roleNames.size() > 1) {
            //     System.err.println("警告：用户 " + userId + " 存在多个角色，将使用第一个：" + roleName);
            //     // 或者抛出业务异常：throw new RuntimeException("用户拥有多个角色，数据异常");
            // }
        }

        // 返回需要的信息
        Map<String, Object> result = new HashMap<>();
        result.put("userId", user.getUserId());
        result.put("username", user.getUsername());
        result.put("role", roleName);

        return ResponseEntity.ok(result);
    }
    @PreAuthorize("hasAuthority('delete_user')")
    @DeleteMapping("/delete/{id}")
    public Result<String> deleteUserById(@PathVariable("id") int userId) {
        boolean success = userService.deleteUserById(userId);
        if (success) {
            return Result.success("删除成功！");
        } else {
            return Result.error("删除失败，用户不存在！");
        }
    }
    @PreAuthorize("hasAuthority('query_user')")
    @GetMapping("/detail/{id}")
    public Result<User> getUserDetail(@PathVariable("id") int id) {
        User user = userService.getById(id);
        if (user != null) {
            return Result.success(user);
        } else {
            return Result.error("用户不存在");
        }
    }
    @PreAuthorize("hasAuthority('edit_user')")
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


