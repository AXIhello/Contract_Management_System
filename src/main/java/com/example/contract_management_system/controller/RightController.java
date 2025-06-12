package com.example.contract_management_system.controller;

import com.example.contract_management_system.pojo.*;
import com.example.contract_management_system.service.*;
import com.example.contract_management_system.util.Result;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/right")
public class RightController {

    private final UserService userService;
    private final RightService rightService;
    private final RoleService roleService;

    public RightController(UserService userService, RightService rightService, RoleService roleService) {
        this.userService = userService;
        this.rightService = rightService;
        this.roleService = roleService;
    }

    // 控制器
    @GetMapping("/list")
    public List<Map<String, Object>> listUsersWithRoles() {
        List<User> users = userService.getAllUsers();  // 查出所有用户
        List<Map<String, Object>> result = new ArrayList<>();

        for (User user : users) {
            Map<String, Object> map = new HashMap<>();
            map.put("userId", user.getUserId());
            map.put("username", user.getUsername());

            // 查用户的所有角色名
            List<String> roleNames = rightService.selectRoleNameByUserId(user.getUserId());

            // 如果为空列表，则设置为“无”
            String joined = (roleNames == null || roleNames.isEmpty()) ? "无" : String.join(",", roleNames);
            map.put("roleNames", joined);

            result.add(map);
        }

        return result;
    }

    // 获取有对应权限的user
    @GetMapping("/list/countersign")
    public List<User> listUsers_countersign() {
        List<String> roleNames = roleService.selectRoleNamesWithRight("countersign_contract");

        // 使用 HashSet 来去重

        Set<User> userSet = new HashSet<>();

        for (String roleName : roleNames) {
            List<User> usersWithRole = rightService.selectUserWithRole(roleName);
            userSet.addAll(usersWithRole); // 将当前角色下的用户添加到 Set 中
        }
        // 返回去重后的用户列表
        return new ArrayList<>(userSet);
    }

    @GetMapping("/list/approve")
    public List<User> listUsers_approve() {
        List<String> roleNames = roleService.selectRoleNamesWithRight("approve_contract");

        // 使用 HashSet 来去重

        Set<User> userSet = new HashSet<>();

        for (String roleName : roleNames) {
            List<User> usersWithRole = rightService.selectUserWithRole(roleName);
            userSet.addAll(usersWithRole); // 将当前角色下的用户添加到 Set 中
        }
        // 返回去重后的用户列表
        return new ArrayList<>(userSet);
    }

    @GetMapping("/list/sign")
    public List<User> listUsers_sign() {
        List<String> roleNames = roleService.selectRoleNamesWithRight("sign_contract");

        // 使用 HashSet 来去重

        Set<User> userSet = new HashSet<>();

        for (String roleName : roleNames) {
            List<User> usersWithRole = rightService.selectUserWithRole(roleName);
            userSet.addAll(usersWithRole); // 将当前角色下的用户添加到 Set 中
        }
        // 返回去重后的用户列表
        return new ArrayList<>(userSet);
    }

    // 获取用户的用户名和角色
    @PreAuthorize("hasAuthority('query_user')")
    @GetMapping("/userinfo/{userId}")
    public Map<String, Object> getUserInfo(@PathVariable("userId") int userId) {
        Map<String, Object> result = new HashMap<>();

        User user = userService.getById(userId);
        if (user == null) {
            result.put("username", "未知用户1");
            result.put("roleNames", Collections.emptyList());
            return result;
        }

        List<String> roleNames = rightService.selectRoleNameByUserId(userId);
        result.put("username", user.getUsername());
        result.put("roleNames", roleNames != null ? roleNames : Collections.emptyList());
        return result;
    }

    @GetMapping("/isAdmin")
    public boolean isAdmin() {
        int userId = userService.getCurrentUserId();
        boolean result = false;
        User user = userService.getById(userId);
        if (user == null) return result;

        List<String> roleNames = rightService.selectRoleNameByUserId(userId);
        for (String roleName : roleNames) {
            if (roleName.equals("管理员")) {
                result = true;
                break;
            }
        }
        return result;
    }

    // 分配角色给用户
    @PreAuthorize("hasAuthority('assign_perm')")
    @PostMapping("/assign")
    public Result<String> assignRoles(@RequestBody Map<String, Object> payload) {
        int userId = Integer.parseInt(payload.get("userId").toString());
        List<String> roleNames = (List<String>) payload.get("roles");

        try {
            // 先删除该用户已有的所有角色记录
            rightService.removeAllRolesFromUser(userId);
            rightService.assignRolesToUser(userId, roleNames);
            return Result.success("用户权限分配成功");
        } catch (Exception e) {
            return Result.error("用户权限分配失败");
        }

    }

}
