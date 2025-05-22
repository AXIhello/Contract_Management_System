package com.example.contract_management_system.service.impl;


import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.example.contract_management_system.mapper.UserMapper;
import com.example.contract_management_system.pojo.User;
import com.example.contract_management_system.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserMapper userMapper;

    @Override
    public boolean register(User user, String confirmPassword) {
//        if (user.getName() == null || user.getPassword() == null || confirmPassword == null) return false;
//        if (!user.getPassword().equals(confirmPassword)) return false;
//
//        QueryWrapper<User> query = new QueryWrapper<>();
//        query.eq("name", user.getName());
//        if (userMapper.selectOne(query) != null) return false;

        return userMapper.insert(user) > 0;
    }

    @Override
    public User login(String name, String password) {
        if (name == null || password == null) return null;

        QueryWrapper<User> query = new QueryWrapper<>();
        query.eq("name", name).eq("password", password);
        return userMapper.selectOne(query);
    }
}
