package com.example.contract_management_system.service.impl;


import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.example.contract_management_system.mapper.UserMapper;
import com.example.contract_management_system.pojo.User;
import com.example.contract_management_system.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;



@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserMapper userMapper;
    @Autowired
    private PasswordEncoder passwordEncoder;  // 注入密码编码器


    @Override
    public boolean register(User user, String confirmPassword) {
        if (user.getUsername() == null || user.getPassword() == null || confirmPassword == null) return false;
        if (!user.getPassword().equals(confirmPassword)) return false;

        QueryWrapper<User> query = new QueryWrapper<>();
        query.eq("username", user.getUsername());
        if (userMapper.selectOne(query) != null) return false;

        // 加密密码
        String encodedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(encodedPassword);

        return userMapper.insert(user) > 0;
    }
    @Override
    public Integer getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails userDetails) {
            String username = userDetails.getUsername();
            QueryWrapper<User> query = new QueryWrapper<>();
            query.eq("username", username);
            User user = userMapper.selectOne(query);
            return user != null ? user.getUser_id() : null;
        }
        return null;
    }
}
