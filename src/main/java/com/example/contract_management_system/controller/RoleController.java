package com.example.contract_management_system.controller;

import com.example.contract_management_system.dto.RoleRequest;
import com.example.contract_management_system.util.Result;
import com.example.contract_management_system.pojo.Role;
import com.example.contract_management_system.service.RoleService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/role")
public class RoleController {
    private final RoleService roleService;

    public RoleController(RoleService roleService) {
        this.roleService = roleService;
    }

    @PreAuthorize("hasAuthority('query_role')")
    @GetMapping("/list")
    public List<Role> getAllRoles() {
        return roleService.getAllRoles();}

    @GetMapping("/{name}")
    public Result<Role> getRoleByName(@PathVariable("name") String name) {
        Role role = roleService.getByName(name);  // 你需要确保 roleService 有这个方法
        if (role != null) {
            return Result.success(role);
        } else {
            return Result.error("未找到该角色");
        }
    }
    @PreAuthorize("hasAuthority('add_role')")
    @PostMapping("/add")
    public Result<String> addRole(@RequestBody RoleRequest roleRequest) {
        String name = roleRequest.getName();
        String desc = roleRequest.getDesc();
        List<String> perms = roleRequest.getPerms();

        if ("admin".equalsIgnoreCase(name) || "operator".equalsIgnoreCase(name)) {
            return Result.error("该名称为保留角色，无法添加！");
        }

        if (roleService.exists(name)) {
            return Result.error("角色名称已存在！");
        }

        boolean success = roleService.addRole(name, desc, perms);
        return success ? Result.success("添加成功") : Result.error("添加失败！");
    }

    @PreAuthorize("hasAuthority('delete_role')")
    @DeleteMapping("/delete/{name}")
    public Result<String> deleteByName(@PathVariable("name") String name) {
        boolean success = roleService.deleteByName(name);
        if (success) {
            return com.example.contract_management_system.util.Result.success("删除成功！");
        } else {
            return com.example.contract_management_system.util.Result.error("删除失败，用户不存在！");
        }
    }
    // 获取角色详情（根据 name）
    @PreAuthorize("hasAuthority('query_role')")
    @GetMapping("/detail/{name}")
    public Result<RoleRequest> getRoleDetail(@PathVariable String name) {
        RoleRequest roleRequest = roleService.getRoleDetailByName(name);
        return roleRequest != null ? Result.success(roleRequest) : Result.error("角色不存在");
    }

    //更新用户
    @PreAuthorize("hasAuthority('edit_role')")
    @PostMapping("/update")
    public Result<String> updateRole(@RequestBody RoleRequest roleRequest) {
        String newName = roleRequest.getName();
        String oldName = roleRequest.getOldName();

        if (newName == null || newName.trim().isEmpty()) {
            return Result.error("角色名称不能为空");
        }

        // 名称没变，直接更新
        if (newName.equals(oldName)) {
            boolean updated = roleService.updateRoleByName(roleRequest);
            return updated ? Result.success("修改成功") : Result.error("修改失败或角色不存在");
        } else {
            // 名称变了，先删除旧的，再插入新的
            boolean deleted = roleService.deleteByName(oldName);
            if (!deleted) {
                return Result.error("原角色不存在，无法重命名");
            }

            boolean added = roleService.addRole(newName, roleRequest.getDesc(), roleRequest.getPerms());
            return added ? Result.success("重命名并保存成功") : Result.error("保存新角色失败");
        }
    }

}
