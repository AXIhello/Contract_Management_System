package com.example.contract_management_system.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.example.contract_management_system.mapper.RightMapper;
import com.example.contract_management_system.mapper.UserMapper;
import com.example.contract_management_system.pojo.Right;
import com.example.contract_management_system.pojo.User;
import com.example.contract_management_system.service.LogService;
import com.example.contract_management_system.service.RightService;
import org.springframework.stereotype.Service;

import java.sql.Array;
import java.util.ArrayList;
import java.util.List;

@Service
public class RightServiceImpl implements RightService {

    private final RightMapper rightMapper;
    private final LogService logService;
    private final UserMapper userMapper;

    public RightServiceImpl(RightMapper rightMapper, LogService logService, UserMapper userMapper) {
        this.rightMapper = rightMapper;
        this.logService = logService;
        this.userMapper = userMapper;
    }


    @Override
    public List<String> selectRoleNameByUserId(int id) {
        return rightMapper.selectRoleNameByUserId(id);
    }

    @Override
    public void assignRolesToUser(int userId, List<String> roleNames) {
        User user = userMapper.selectById(userId);
        for(String roleName : roleNames) {
            logService.addLog(userId, 1, "Right","UserName: " + user.getUsername() + "RoleName: " + roleName);
            rightMapper.assignRights(userId,roleName);
        }
    }

    @Override
    public List<User> selectUserWithRole(String roleName){
        List<Integer> userIds = rightMapper.selectUserWithRole(roleName);
        List<User> users = new ArrayList<>();
        for(Integer userId : userIds) {
            users.add(userMapper.selectById(userId));
        }
        return users;
    }

    @Override
    public void removeAllRolesFromUser(int userId) {
        rightMapper.deleteRolesById(userId);
    }
}
