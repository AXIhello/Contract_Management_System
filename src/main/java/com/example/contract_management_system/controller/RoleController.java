package com.example.contract_management_system.controller;

import com.example.contract_management_system.dto.RoleRequest;
import com.example.contract_management_system.util.Result;
import com.example.contract_management_system.pojo.Role;
import com.example.contract_management_system.service.RoleService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/role")
public class RoleController {
    private final RoleService roleService;

    public RoleController(RoleService roleService) {
        this.roleService = roleService;
    }


    @GetMapping("/list")
    public List<Role> getAllRoles() {
        return roleService.getAllRoles();}

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
    @GetMapping("/detail/{name}")
    public Result<RoleRequest> getRoleDetail(@PathVariable String name) {
        RoleRequest roleRequest = roleService.getRoleDetailByName(name);
        return roleRequest != null ? Result.success(roleRequest) : Result.error("角色不存在");
    }

    // 修改角色（根据 name 更新）
    @PostMapping("/update")
    public Result<String> updateRole(@RequestBody RoleRequest roleRequest) {
        if (roleRequest.getName() == null || roleRequest.getName().trim().isEmpty()) {
            return Result.error("角色名称不能为空");
        }

        boolean updated = roleService.updateRoleByName(roleRequest);
        return updated ? Result.success("修改成功") : Result.error("修改失败或角色不存在");
    }
}
