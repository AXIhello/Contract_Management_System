package com.example.contract_management_system.service;

import com.example.contract_management_system.pojo.User;

public interface UserService {
    boolean register(User user, String confirmPassword);
    User login(String username, String password);
}