package com.example.contract_management_system.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.contract_management_system.dto.AssignContractRequest;
import com.example.contract_management_system.pojo.Contract;
import com.example.contract_management_system.pojo.ContractProcess;

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
    
    // 获取待审批的合同列表（简化信息）
    List<Map<String, Object>> getPendingExamineContracts(Integer userId);
    
    // 提交审批意见
    boolean submitExamine(Integer contractId, String comment, Integer state);
    
    // 检查是否所有审批人都已通过
    boolean checkAllExamined(Integer contractId);
    
    // 获取合同审批相关信息
    Map<String, Object> getContractApprovalInfo(Integer contractId);
    
    // 获取当前用户ID
    Integer getCurrentUserId();
}
