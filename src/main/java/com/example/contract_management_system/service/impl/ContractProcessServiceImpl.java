package com.example.contract_management_system.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.contract_management_system.common.exception.*;
import com.example.contract_management_system.dto.AssignContractRequest;
import com.example.contract_management_system.mapper.*;
import com.example.contract_management_system.pojo.*;
import com.example.contract_management_system.service.UserService;
import com.example.contract_management_system.service.ContractProcessService;
import jakarta.persistence.PersistenceException;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
public class ContractProcessServiceImpl extends ServiceImpl<ContractProcessMapper, ContractProcess> implements ContractProcessService {
    private final ContractProcessMapper contractProcessMapper;
    private final ContractMapper contractMapper;
    private final UserMapper userMapper;
    private final UserService userService;

    public ContractProcessServiceImpl(ContractProcessMapper contractProcessMapper, ContractMapper contractMapper, UserMapper userMapper,UserService userService) {
        this.contractProcessMapper = contractProcessMapper;
        this.contractMapper = contractMapper;
        this.userMapper = userMapper;
        this.userService=userService;
    }

    //分配合同
    @Override
    public boolean assignContract(AssignContractRequest request) {
        // 参数基础校验
        if (request == null) {
            throw new IllegalArgumentException("AssignContractRequest cannot be null");
        }

        try {
            // 1. 校验合同是否存在
            Contract contract = contractMapper.findContractById(request.getConNum());
            if (contract == null) {
                throw new BusinessException("合同 " + request.getConNum() + " 未找到！");
            }

            // 2. 校验用户是否存在
            User user = userMapper.selectById(request.getUserId());
            if (user == null) {
                throw new BusinessException("用户 " + request.getUserId() + " 未找到！");
            }

            int affectedRows = contractProcessMapper.insertContractProcess(request.getConNum(), request.getType(), 0, request.getUserId(),null, request.getTime());
            if (affectedRows != 1) {
                throw new PersistenceException("插入合同流程失败！");
            }

            return true;
        } catch (DataAccessException e) {
            // 数据库访问异常
            throw new PersistenceException("数据库操作失败：", e);
        } catch (BusinessException e) {
            // 业务异常直接抛出
            throw e;
        } catch (Exception e) {
            // 其他未预料异常
            throw new SystemException("合同分配期间发生未知错误：", e);
        }
    }

    @Override
    public List<Contract> getPendingCountersignContracts(Integer userId) {
        try {
            // 获取当前用户待会签的合同列表
            List<Integer> contractIds = contractProcessMapper.getPendingCountersignContracts(userId);
            List<Contract> contracts = new ArrayList<>();
            
            for (Integer contractId : contractIds) {
                Contract contract = contractMapper.findContractById(contractId);
                if (contract != null) {
                    contracts.add(contract);
                }
            }
            
            return contracts;
        } catch (Exception e) {
            throw new SystemException("获取待会签合同列表失败：", e);
        }
    }

    @Override
    public Contract getContractById(Integer id) {
        try {
            return contractMapper.findContractById(id);
        } catch (Exception e) {
            throw new SystemException("获取合同信息失败：", e);
        }
    }

    @Override
    @Transactional
    public boolean submitCountersign(Integer contractId, String comment) {
        try {
            // 1. 获取当前用户ID
            Integer userId = userService.getCurrentUserId();
            if (userId == null) {
                throw new BusinessException("用户未登录");
            }

            // 2. 检查合同是否存在
            Contract contract = contractMapper.findContractById(contractId);
            if (contract == null) {
                throw new BusinessException("合同不存在");
            }

            // 3. 检查用户是否有权限会签该合同
            ContractProcess process = contractProcessMapper.getContractProcess(contractId, userId, 1); // 1表示会签
            if (process == null) {
                throw new BusinessException("您没有权限会签该合同");
            }

            // 4. 更新会签状态和意见
            int affectedRows = contractProcessMapper.updateContractProcess(contractId, userId, 1, 1, comment, new Timestamp(System.currentTimeMillis()));
            if (affectedRows != 1) {
                throw new PersistenceException("更新会签状态失败");
            }
            return true;
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new SystemException("提交会签失败：", e);
        }
    }
}
