package com.example.contract_management_system.service.impl;


import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.example.contract_management_system.mapper.UserMapper;
import com.example.contract_management_system.pojo.User;
import com.example.contract_management_system.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.List;


@Service
public class UserServiceImpl implements UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;  // 注入密码编码器

    public UserServiceImpl(UserMapper userMapper, PasswordEncoder passwordEncoder) {
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
    }


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
        logger.info("当前认证信息: {}", authentication);
        
        if (authentication == null || !authentication.isAuthenticated()) {
            logger.error("用户未认证");
            return null;
        }
        
        Object principal = authentication.getPrincipal();
        logger.info("认证主体: {}", principal);
        
        if (principal instanceof UserDetails userDetails) {
            String username = userDetails.getUsername();
            logger.info("当前用户名: {}", username);
            
            QueryWrapper<User> query = new QueryWrapper<>();
            query.eq("username", username);
            User user = userMapper.selectOne(query);
            logger.info("查询到的用户信息: {}", user);
            
            return user != null ? user.getUserId() : null;
        }
        
        logger.error("认证主体不是UserDetails类型");
        return null;
    }

    @Override
    public List<User> getAllUsers(){
        return userMapper.selectList(null);
    }

    @Override
    public String getUsernameById(int userId){
        return userMapper.selectById(userId).getUsername();
    }

    @Override
    public boolean deleteUserById(int userId){
        return userMapper.deleteById(userId) > 0;
    }

    @Override
    public User getById(int userId) {
        return userMapper.selectById(userId);
    }

    @Override
    public boolean updateById(User user){
        return userMapper.updateById(user) > 0;
    }

    @Override
    public int count(QueryWrapper<User> query) {
        return Math.toIntExact(userMapper.selectCount(query));
    }

}
