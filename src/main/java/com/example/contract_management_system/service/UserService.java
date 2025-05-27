package com.example.contract_management_system.service;

import com.example.contract_management_system.pojo.User;

import java.util.List;

public interface UserService {
    boolean register(User user, String confirmPassword);
    Integer getCurrentUserId();
    List<User>  getAllUsers();
    String getUsernameById(int userId);
}