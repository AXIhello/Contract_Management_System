package com.example.contract_management_system.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.contract_management_system.dto.ContractPendingDTO;
import com.example.contract_management_system.mapper.*;
import com.example.contract_management_system.pojo.*;
import com.example.contract_management_system.service.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ContractServiceImpl extends ServiceImpl<ContractMapper, Contract> implements ContractService {
    private static final Logger logger = LoggerFactory.getLogger(ContractServiceImpl.class);

    private final ContractMapper contractMapper;
    private final ContractStateMapper contractStateMapper;
    private final ContractStateService contractStateService;
    private final ContractAttachmentService contractAttachmentService;
    private final LogService logService;
    private final UserService userService;

    public ContractServiceImpl(ContractMapper contractMapper, ContractStateMapper contractStateMapper, ContractStateService contractStateService, ContractProcessMapper contractProcessMapper, ContractAttachmentService contractAttachmentService, LogService logService, UserService userService) {
        this.contractMapper = contractMapper;
        this.contractStateMapper = contractStateMapper;
        this.contractStateService = contractStateService;
        this.contractAttachmentService = contractAttachmentService;
        this.logService = logService;
        this.userService = userService;
    }

    @Override
    @Transactional
    public boolean draftContract(Contract contract) {
        logger.info("开始验证合同信息: {}", contract);

        if (contract == null) {
            logger.error("合同对象为空");
            return false;
        }

        if (contract.getName() == null) {
            logger.error("合同名称为空");
            return false;
        }

        if (contract.getCustomer() <= 0) {
            logger.error("客户编号无效: {}", contract.getCustomer());
            return false;
        }

        if (contract.getUserId() <= 0) {
            logger.error("用户ID无效: {}", contract.getUserId());
            return false;
        }

        logger.info("合同信息验证通过，开始保存");
        int result = contractMapper.insert(contract);
        logger.info("合同保存结果: {}", result > 0);
        
        if (result > 0) {
            // 创建合同状态记录
            ContractState contractState = new ContractState();
            contractState.setConNum(contract.getNum());
            contractState.setConName(contract.getName());
            contractState.setType(1); // 1表示起草状态
            contractState.setTime(new Date());
            
            boolean stateSaved = contractStateService.save(contractState);
            logger.info("合同状态保存结果: {}", stateSaved);
            return stateSaved;
        }
        
        return false;
    }

    //获取起草状态的合同
    @Override
    public List<Contract> getDraftContracts() {
        List<Integer> list = contractStateMapper.selectContractsByState(1); // 1 = 起草状态
        List<Contract>  contracts = new ArrayList<>(List.of());
        for(Integer id : list){
            contracts.add(contractMapper.selectById(id));
        }
        return contracts;
    }

    @Override
    public String getContractNameById(Integer id) {
        return contractMapper.findContractNameById(id);
    }



    @Override
    @Transactional
    public boolean createContract(Contract contract) {
        // 保存合同信息
        boolean saved = save(contract);
        if (!saved) {
            return false;
        }

        // 创建合同状态记录
        ContractState contractState = new ContractState();
        contractState.setConNum(contract.getNum());
        contractState.setConName(contract.getName());
        contractState.setType(1); // 1表示起草状态
        contractState.setTime(new Date());

        return contractStateService.save(contractState);

    }

    @Override
    public boolean existsByNum(Integer contractNum) {
        return contractMapper.selectById(contractNum) != null;
    }


    @Override
    public String getContractContentById(Integer id) {
        Contract contract = this.getById(id);
        return contract != null ? contract.getContent() : null;
    }

    @Override
    @Transactional
    public boolean updateContract(Integer contractNum, Integer userId, Contract updatedContract,
                                  List<MultipartFile> newAttachments, List<String> deletedAttachments) {
        logger.info("开始更新合同内容, 合同编号: {}, 用户ID: {}", contractNum, userId);

        // （1）数据验证
        if (updatedContract == null) {
            logger.error("未获取到更新的合同");
            return false;
        }
//        if(updatedContract.getName() == null){
//            logger.error("缺少合同名称");
//            return false;
//        }
//        if(updatedContract.getName().trim().isEmpty()) {
//            logger.error("反正是个空");
//            return false;
//        }

        // （2）查询合同状态，判断是否为“待定稿”状态
        ContractState state = contractStateService.getContractState(contractNum);
        if (state == null || state.getType() != 2) {
            logger.error("合同不处于待定稿状态，无法更新。当前状态: {}", state != null ? state.getType() : "null");
            return false;
        }

        // （3）查询原始合同
        Contract existingContract = contractMapper.selectById(contractNum);
        if (existingContract == null) {
            logger.error("未找到编号为 {} 的合同", contractNum);
            return false;
        }

        // （4）更新合同基本信息
        updatedContract.setNum(contractNum); // 确保是同一合同编号
        updatedContract.setUserId(userId);   // 更新者ID

        UpdateWrapper<Contract> updateWrapper = new UpdateWrapper<>();
        updateWrapper.eq("num", contractNum);
        int rows = contractMapper.update(updatedContract, updateWrapper);
        logger.info("合同更新结果: {}", rows > 0);

        if (rows > 0) {
            // （5）处理附件删除
            if (deletedAttachments != null && !deletedAttachments.isEmpty()) {
                for (String path : deletedAttachments) {
                    boolean deleted = contractAttachmentService.deleteAttachment(path);
                    logger.info("删除附件 [{}] 结果: {}", path, deleted);
                }
            }

            // （6）处理附件新增

            if (newAttachments != null && !newAttachments.isEmpty()) {
                logger.info("开始处理 {} 个附件", newAttachments.size());
                for (MultipartFile file : newAttachments) {
                    if (!file.isEmpty()) {
                        logger.info("上传附件: {}", file.getOriginalFilename());
                        boolean result = contractAttachmentService.uploadAndSaveAttachment(contractNum, file);
                        if (!result) {
                            break;
                        }
                    }
                }
            }
            // （7）保存合同定稿状态（3 = 定稿完成）
            ContractState finalState = new ContractState();
            finalState.setConNum(contractNum);
            finalState.setConName(updatedContract.getName());
            finalState.setType(3);
            finalState.setTime(new Date());

            boolean stateSaved = contractStateService.updateById(finalState);
            logger.info("合同定稿状态保存结果: {}", stateSaved);

            Contract contract = contractMapper.selectById(contractNum);
            logService.addLog(userId, 3,"Contract", "ContarctName: " + contract.getName());

            return stateSaved;
        }

        return false;
    }

    @Override
    public List<ContractPendingDTO> getToBeFinishedContracts() {
        // 先查状态为2的合同编号列表
        QueryWrapper<ContractState> stateQuery = new QueryWrapper<>();
        stateQuery.eq("type", 2);
        List<ContractState> stateList = contractStateMapper.selectList(stateQuery);

        // 从状态列表中提取合同编号
        List<Integer> contractNums = stateList.stream()
                .map(ContractState::getConNum)
                .collect(Collectors.toList());

        if (contractNums.isEmpty()) {
            return Collections.emptyList();
        }

        // 当前用户id
        Integer userId = userService.getCurrentUserId();

        // 再从合同表查：合同编号在contractNums内，且user_id = 当前用户id
        QueryWrapper<Contract> contractQuery = new QueryWrapper<>();
        contractQuery.in("num", contractNums)
                .eq("user_id", userId);

        List<Contract> contracts = contractMapper.selectList(contractQuery);

        // 转换为DTO返回
        return contracts.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        //TODO:显示附件列表，提供下载功能
    }



    private ContractPendingDTO convertToDTO(Contract contract) {
        ContractPendingDTO dto = new ContractPendingDTO();
        dto.setId(contract.getNum());
        dto.setName(contract.getName());
        dto.setDrafter(contract.getUserId().toString());//目前只获取用户ID
        dto.setDraftDate(contract.getBeginTime().toString());
        // 其他字段映射
        return dto;
    }

}





