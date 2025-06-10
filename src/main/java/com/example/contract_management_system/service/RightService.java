package com.example.contract_management_system.service;


import com.example.contract_management_system.pojo.User;

import java.util.List;


public interface RightService {
    List<String> selectRoleNameByUserId(int id);

    void assignRolesToUser(int userId, List<String> roleNames);

    List<User> selectUserWithRole(String roleName);

    void removeAllRolesFromUser(int userId);
}
