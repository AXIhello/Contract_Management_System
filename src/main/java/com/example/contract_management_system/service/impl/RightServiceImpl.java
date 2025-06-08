package com.example.contract_management_system.service.impl;

import com.example.contract_management_system.mapper.RightMapper;
import com.example.contract_management_system.service.RightService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RightServiceImpl implements RightService {

    private final RightMapper rightMapper;

    public RightServiceImpl(RightMapper rightMapper) {
        this.rightMapper = rightMapper;
    }


    @Override
    public List<String> selectRoleNameByUserId(int id) {
        return rightMapper.selectRoleNameByUserId(id);
    }

    @Override
    public void assignRolesToUser(int userId, List<String> roleNames) {
        for(String roleName : roleNames) {
            rightMapper.assignRights(userId,roleName);
        }
    }
}
