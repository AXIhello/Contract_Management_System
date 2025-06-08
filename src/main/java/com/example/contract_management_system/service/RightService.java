package com.example.contract_management_system.service;


import java.util.List;


public interface RightService {
    List<String> selectRoleNameByUserId(int id);

    void assignRolesToUser(int userId, List<String> roleNames);
}
