package com.example.contract_management_system.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.contract_management_system.dto.AssignContractRequest;
import com.example.contract_management_system.dto.CountersignDTO;
import com.example.contract_management_system.pojo.Contract;
import com.example.contract_management_system.pojo.ContractProcess;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

public interface ContractProcessService extends IService<ContractProcess> {
    boolean assignContract(AssignContractRequest request);
    
    // 获取待会签的合同列表
    List<Contract> getPendingCountersignContracts(Integer userId);
    
    // 根据ID获取合同信息
    Contract getContractById(Integer id);
    
    // 提交会签意见
    boolean submitCountersign(Integer contractId, String comment);

    //获取待定稿合同的会签意见（包含会签人）
    List<CountersignDTO> getCountersignContent(Integer contractNum);

    // 获取待审批的合同列表（简化信息）
    List<Map<String, Object>> getPendingExamineContracts(Integer userId);

    List<Map<String, Object>> getPendingConcludeContracts(Integer userId);

    @Transactional
    boolean submitConclude(Integer contractId, String comment);

    // 提交审批意见
    boolean submitExamine(Integer contractId, String comment, Integer state);
    
    // 检查是否所有审批人都已通过
    boolean checkAllExamined(Integer contractId);

    boolean checkAllConclude(Integer contractId);

    // 获取合同审批相关信息
    Map<String, Object> getContractApprovalInfo(Integer contractId);

    Map<String, Object> getContractConcludeInfo(Integer contractId);

    // 获取当前用户ID
    Integer getCurrentUserId();
}
