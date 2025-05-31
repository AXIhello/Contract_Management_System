package com.example.contract_management_system.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.contract_management_system.dto.RoleRequest;
import com.example.contract_management_system.mapper.RoleMapper;
import com.example.contract_management_system.pojo.Role;
import com.example.contract_management_system.service.RoleService;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Service
public class RoleServiceImpl extends ServiceImpl<RoleMapper, Role> implements RoleService {
    private  final RoleMapper roleMapper;

    public RoleServiceImpl(RoleMapper roleMapper) {
        this.roleMapper = roleMapper;
    }

    @Override
    public List<Role> getAllRoles() {
        return roleMapper.selectList(null);
    }

    @Override
    public boolean deleteByName(String name){
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

        return roleMapper.updateByName(existing) > 0;
    }


}
