package com.example.contract_management_system.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.contract_management_system.common.exception.*;
import com.example.contract_management_system.dto.AssignContractRequest;
import com.example.contract_management_system.mapper.*;
import com.example.contract_management_system.pojo.*;
import com.example.contract_management_system.service.ContractProcessService;
import jakarta.persistence.PersistenceException;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

@Service
public class ContractProcessServiceImpl extends ServiceImpl<ContractProcessMapper, ContractProcess> implements ContractProcessService {
    private final ContractProcessMapper contractProcessMapper;
    private final ContractMapper contractMapper;
    private final UserMapper userMapper;

    public ContractProcessServiceImpl(ContractProcessMapper contractProcessMapper, ContractMapper contractMapper, UserMapper userMapper) {
        this.contractProcessMapper = contractProcessMapper;
        this.contractMapper = contractMapper;
        this.userMapper = userMapper;
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
}
