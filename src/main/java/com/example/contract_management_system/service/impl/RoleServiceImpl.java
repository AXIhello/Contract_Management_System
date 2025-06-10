package com.example.contract_management_system.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.contract_management_system.dto.RoleRequest;
import com.example.contract_management_system.mapper.RoleMapper;
import com.example.contract_management_system.mapper.UserMapper;
import com.example.contract_management_system.pojo.Role;
import com.example.contract_management_system.pojo.User;
import com.example.contract_management_system.service.LogService;
import com.example.contract_management_system.service.RoleService;
import com.example.contract_management_system.service.UserService;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Service
public class RoleServiceImpl extends ServiceImpl<RoleMapper, Role> implements RoleService {
    private final RoleMapper roleMapper;
    private final UserService userService;
    private final LogService logService;

    public RoleServiceImpl(RoleMapper roleMapper, UserService userService, LogService logService) {
        this.roleMapper = roleMapper;
        this.userService = userService;
        this.logService = logService;
    }

    @Override
    public List<Role> getAllRoles() {
        return roleMapper.selectList(null);
    }

    @Override
    public boolean deleteByName(String name){
        Integer userId = userService.getCurrentUserId();
        logService.addLog(userId, 2, "Role","RoleName: " + name);
        return roleMapper.deleteByName(name) > 0;
    }

    @Override
    public boolean exists(String name) {
        return roleMapper.selectByName(name) != null;
    }

    @Override
    public boolean addRole(String name, String desc, List<String> perms) {
        Role role = new Role();
        role.setName(name);
        role.setDescription(desc);
        role.setFunctions(String.join(",", perms));
        Integer userId = userService.getCurrentUserId();
        logService.addLog(userId, 1, "Role","RoleName: " + name);
        int insert = roleMapper.insert(role);
        return insert > 0;
    }

    @Override
    public RoleRequest getRoleDetailByName(String name) {
        Role role = roleMapper.selectByName(name);
        if (role == null) return null;

        RoleRequest dto = new RoleRequest();
        dto.setName(role.getName());
        dto.setDesc(role.getDescription());

        // functions 字符串拆分为权限数组
        if (role.getFunctions() != null && !role.getFunctions().isEmpty()) {
            dto.setPerms(Arrays.asList(role.getFunctions().split(",")));
        } else {
            dto.setPerms(Collections.emptyList());
        }

        return dto;
    }

    @Override
    public boolean updateRoleByName(RoleRequest dto) {
        Role existing = roleMapper.selectByName(dto.getName());
        if (existing == null) return false;

        existing.setDescription(dto.getDesc());

        String functionStr = dto.getPerms() == null ? "" : String.join(",", dto.getPerms());
        existing.setFunctions(functionStr);

        Integer userId = userService.getCurrentUserId();
        logService.addLog(userId, 3, "Role","RoleName: " + dto.getName());
        return roleMapper.updateByName(existing) > 0;
    }


}
