package com.example.contract_management_system.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.example.contract_management_system.pojo.User;

import java.util.List;

public interface UserService {
    boolean register(User user, String confirmPassword);
    Integer getCurrentUserId();
    List<User>  getAllUsers();
    String getUsernameById(int userId);

    boolean deleteUserById(int userId);
    User getById(int id);
    boolean updateById(User user);

    int count(QueryWrapper<User> query);
}