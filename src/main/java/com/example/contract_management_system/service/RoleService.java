package com.example.contract_management_system.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.contract_management_system.dto.RoleRequest;
import com.example.contract_management_system.pojo.Role;

import java.util.List;

public interface RoleService extends IService<Role> {
    List<Role> getAllRoles();

    boolean deleteByName(String name);

    boolean exists(String name);

    boolean addRole(String name, String desc, List<String> perms);

    RoleRequest getRoleDetailByName(String name);

    boolean updateRoleByName(RoleRequest dto);
}
