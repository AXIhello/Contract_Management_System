package com.example.contract_management_system.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.example.contract_management_system.mapper.RoleMapper;
import com.example.contract_management_system.pojo.*;
import com.example.contract_management_system.mapper.*;
import com.example.contract_management_system.pojo.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class MyUserDetailsServiceImpl implements UserDetailsService {

    private final UserMapper userMapper;
    private final RoleMapper roleMapper;
    private final RightMapper rightMapper;

    public MyUserDetailsServiceImpl(UserMapper userMapper, RoleMapper roleMapper, RightMapper rightMapper) {
        this.userMapper = userMapper;
        this.roleMapper = roleMapper;
        this.rightMapper = rightMapper;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("username", username);
        User user = userMapper.selectOne(queryWrapper);

        if (user == null) {
            throw new UsernameNotFoundException("用户不存在");
        }

        // 查询角色信息（你需要通过用户名查角色表）
        List<String> roleNames = rightMapper.selectRoleNameByUserId(user.getUserId());

        List<Role> roles = new ArrayList<>();
        if (roleNames != null && !roleNames.isEmpty()) {
            QueryWrapper<Role> wrapper = new QueryWrapper<>();
            wrapper.in("name", roleNames);
            roles = roleMapper.selectList(wrapper);
        }

        List<GrantedAuthority> authorities = new ArrayList<>();
        for (Role role : roles) {
            if (role != null && role.getFunctions() != null) {
                String[] functions = role.getFunctions().split(",");
                for (String function : functions) {
                    authorities.add(new SimpleGrantedAuthority(function.trim()));
                }
                // 可选：把角色名也当作权限
                // authorities.add(new SimpleGrantedAuthority("ROLE_" + role.getName()));
            }
        }


        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                authorities
        );
    }


    public UserDetails loadUserByUserId(int userId) throws UsernameNotFoundException {
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("id", userId);
        User user = userMapper.selectOne(queryWrapper);

        if (user == null) {
            throw new UsernameNotFoundException("用户不存在");
        }

        List<String> roleNames = rightMapper.selectRoleNameByUserId(user.getUserId());

        List<Role> roles = new ArrayList<>();
        if (roleNames != null && !roleNames.isEmpty()) {
            QueryWrapper<Role> wrapper = new QueryWrapper<>();
            wrapper.in("roleName", roleNames);
            roles = roleMapper.selectList(wrapper);
        }

        List<GrantedAuthority> authorities = new ArrayList<>();
        for (Role role : roles) {
            if (role != null && role.getFunctions() != null) {
                String[] functions = role.getFunctions().split(",");
                for (String function : functions) {
                    authorities.add(new SimpleGrantedAuthority(function.trim()));
                }
                // 可选：把角色名也当作权限
                // authorities.add(new SimpleGrantedAuthority("ROLE_" + role.getName()));
            }
        }


        System.out.println("用户名：" + user.getUsername());
        System.out.println("数据库密码：" + user.getPassword());


        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                authorities
        );
    }
}
