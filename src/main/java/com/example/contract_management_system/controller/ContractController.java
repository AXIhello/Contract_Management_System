package com.example.contract_management_system.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.example.contract_management_system.dto.ContractDTO;
import com.example.contract_management_system.dto.ContractPendingDTO;
import com.example.contract_management_system.dto.AssignContractRequest;
import com.example.contract_management_system.pojo.*;
import com.example.contract_management_system.service.*;
import com.example.contract_management_system.util.Result;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.*;

import org.springframework.web.multipart.MultipartFile;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/contract")
public class ContractController {
    private static final Logger logger = LoggerFactory.getLogger(ContractController.class);

    private final ContractService contractService;
    private final ContractProcessService contractProcessService;
    private final UserService userService;
    private final ContractAttachmentService contractAttachmentService;
    private final LogService logService;
    private final ContractStateService contractStateService;

    public ContractController(ContractService contractService,
                              ContractProcessService contractProcessService,
                              UserService userService,
                              ContractAttachmentService contractAttachmentService,
                              LogService logService,
                              ContractStateService contractStateService) {
        this.contractService = contractService;
        this.contractProcessService = contractProcessService;
        this.userService = userService;
        this.contractAttachmentService = contractAttachmentService;
        this.logService = logService;
        this.contractStateService = contractStateService;
    }

    @PostMapping
    public boolean createContract(@RequestBody Contract contract) {
        return contractService.createContract(contract);
    }

    @PreAuthorize("hasAuthority('draft_contract')")
    @PostMapping("/draft")
    public Map<String, Object> draftContract(
            @RequestParam("contractName") String contractName,
            @RequestParam("startDate") @DateTimeFormat(pattern = "yyyy-MM-dd") Date startDate,
            @RequestParam("endDate") @DateTimeFormat(pattern = "yyyy-MM-dd") Date endDate,
            @RequestParam("clientName") String clientName,
            @RequestParam("contractContent") String contractContent,
            @RequestParam(value = "contractFiles", required = false) List<MultipartFile> contractFiles
    ) {
        Map<String, Object> response = new HashMap<>();

        try {
            logger.info("contractName: {}", contractName);
            logger.info("clientName: {}", clientName);
            logger.info("contractFiles count: {}", contractFiles != null ? contractFiles.size() : 0);

            Integer userId = userService.getCurrentUserId();
            if (userId == null) {
                response.put("success", false);
                response.put("message", "用户未登录或登录已过期");
                return response;
            }

            Contract contract = new Contract();
            contract.setName(contractName);
            contract.setBeginTime(startDate);
            contract.setEndTime(endDate);
            contract.setContent(contractContent);
            contract.setUserId(userId);

            // 解析客户 ID
            try {
                int customerId = Integer.parseInt(
                        clientName.substring(clientName.lastIndexOf("（") + 1, clientName.lastIndexOf("）"))
                );
                contract.setCustomer(customerId);
            } catch (Exception e) {
                logger.error("客户信息解析失败: {}", clientName, e);
                response.put("success", false);
                response.put("message", "客户信息格式不正确");
                return response;
            }

            boolean success = contractService.draftContract(contract);
            if (success) {
                boolean attachmentSuccess = true;

                if (contractFiles != null && !contractFiles.isEmpty()) {
                    logger.info("开始处理 {} 个附件", contractFiles.size());
                    for (MultipartFile file : contractFiles) {
                        if (!file.isEmpty()) {
                            logger.info("上传附件: {}", file.getOriginalFilename());
                            boolean result = contractAttachmentService.uploadAndSaveAttachment(contract.getNum(), file);

                            if (!result) {
                                attachmentSuccess = false;
                                break;
                            }

                            boolean logSuccess = logService.addLog(userId, 1, "ConTractAttachment", "ContractName: " + contract.getName()+ ", AttachName: " + file.getOriginalFilename());
                            if (!logSuccess) {
                                response.put("success", false);
                                response.put("message", "合同起草成功，但日志记录失败");
                            }
                        }
                    }
                }

                if (attachmentSuccess) {
                    response.put("success", true);
                    response.put("message", "合同起草成功" +
                            (contractFiles != null && !contractFiles.isEmpty() ? "，附件已上传" : ""));
                    response.put("contractId", contract.getNum());
                } else {
                    response.put("success", true);
                    response.put("message", "合同起草成功，但部分或全部附件上传失败");
                    response.put("contractId", contract.getNum());
                }

                boolean logSuccess = logService.addLog(userId, 1, "ConTract","ContractName: " + contractName);
                if (!logSuccess) {
                    response.put("success", false);
                    response.put("message", "合同起草成功，但日志记录失败");
                }

            } else {
                response.put("success", false);
                response.put("message", "合同起草失败");
            }
        } catch (Exception e) {
            logger.error("合同起草过程中发生错误", e);
            response.put("success", false);
            response.put("message", "系统繁忙，请稍后重试");
        }

        return response;
    }

    @PreAuthorize("hasAuthority('query_contract')")
    @GetMapping("/list")
    public List<ContractDTO> getContracts() {
        // 查询所有合同
        List<Contract> contracts = contractService.list();

        List<ContractDTO> contractDTOList = new ArrayList<>();
        for (Contract contract : contracts) {
            ContractDTO dto = new ContractDTO();
            dto.setNum(contract.getNum());
            dto.setName(contract.getName());
            dto.setCustomer(contract.getCustomer());

            ContractState state = contractStateService.getById(contract.getNum());
            if (state != null) {
                dto.setState(state.getType());
            } else {
                dto.setState(0); // 默认状态为 0
            }

            contractDTOList.add(dto);
        }

        return contractDTOList;
    }

    @DeleteMapping("/deleteAll/{contractId}")
    public Result<Void> deleteAllContractData(@PathVariable("contractId") int contractId) {
        try {
            Integer userId = userService.getCurrentUserId();
            Contract  contract = contractService.getById(contractId);
            // 1. 删除合同流程
            contractProcessService.remove(new QueryWrapper<ContractProcess>().eq("conNum", contractId));

            logService.addLog(userId, 2, "ContractProcess", "ContactName: " + contract.getName());

            // 2. 删除合同状态
            contractStateService.remove(new QueryWrapper<ContractState>().eq("conNum", contractId));

            logService.addLog(userId, 2, "ContractState", "ContactName: " + contract.getName());

            // 3. 最后删除合同本身
            contractService.removeById(contractId);

            logService.addLog(userId, 2, "Contract", "ContactName: " + contract.getName());

            return Result.success();
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("删除失败：" + e.getMessage());
        }
    }



    @GetMapping("/name")
    public Map<String, Object> getContractName(@RequestParam Integer id) {
        String name = contractService.getContractNameById(id);
        Map<String, Object> result = new HashMap<>();
        result.put("name", name != null ? name : "未知合同");
        return result;
    }

    @GetMapping("/approvalPending")
    public List<Map<String,Object>> getPendingExamineContracts() {
        Integer currentUserId = userService.getCurrentUserId();
        if (currentUserId == null) {
            throw new RuntimeException("用户未登录");
        }
        return contractProcessService.getPendingExamineContracts(currentUserId);
    }

    @GetMapping("/approvalConclude")
    public List<Map<String,Object>> getPendingConcludeContracts() {
        Integer currentUserId = userService.getCurrentUserId();
        if (currentUserId == null) {
            throw new RuntimeException("用户未登录");
        }
        return contractProcessService.getPendingConcludeContracts(currentUserId);
    }

    @GetMapping("/getDraft")
    public List<Contract> getDraftContracts() {
        return contractService.getDraftContracts();
    }

    @PutMapping("/assign/prepare/{contractId}")
    public Result<Void> prepareAssign(@PathVariable("contractId") Integer contractId) {
        // 删除流程表中该合同所有记录
        contractProcessService.remove(new QueryWrapper<ContractProcess>().eq("conNum", contractId));

        // 设置合同状态为 1
        ContractState state = contractStateService.getById(contractId);
        if (state == null) {
            state = new ContractState();
            state.setConNum(contractId);
        }
        state.setType(1);
        contractStateService.saveOrUpdate(state);

        return Result.success();
    }

    @PreAuthorize("hasAuthority('assign_countersign')")
    @PostMapping("/assign/countersign")
    public ResponseEntity<?> assignCountersign(@RequestBody AssignContractRequest request) {
        request.setType(1); // 会签类型
        return handleAssign(request);
    }

    @PreAuthorize("hasAuthority('assign_approve')")
    @PostMapping("/assign/approve")
    public ResponseEntity<?> assignApprove(@RequestBody AssignContractRequest request) {
        request.setType(2); // 审批类型
        return handleAssign(request);
    }

    @PreAuthorize("hasAuthority('assign_sign')")
    @PostMapping("/assign/sign")
    public ResponseEntity<?> assignSign(@RequestBody AssignContractRequest request) {
        request.setType(3); // 签订类型
        return handleAssign(request);
    }

    private ResponseEntity<?> handleAssign(AssignContractRequest request) {
        boolean success = contractProcessService.assignContract(request);
        if (success) {
            return ResponseEntity.ok(Map.of("success", true, "message", "分配成功"));
        } else {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("success", false, "message", "分配失败"));
        }
    }


    //定稿界面
    @GetMapping("/getToBeFinishedContracts")
    public List<ContractPendingDTO> getToBeFinishedContracts() {
        System.out.println("已进入 getToBeFinishedContracts 控制器");
        return contractService.getToBeFinishedContracts();
    }

    @PreAuthorize("hasAuthority('finalize_contract')")
    @PostMapping("/finalize/{contractNum}")
    public Result<String> finalizeContract(
            @PathVariable Integer contractNum,
            @RequestParam("content") String content,
            @RequestParam(value = "newAttachments", required = false) List<MultipartFile> newAttachments,
            @RequestParam(value = "deletedAttachments", required = false) List<String> deletedAttachments,
            @AuthenticationPrincipal UserDetails userDetails) throws JsonProcessingException {

        Contract contract = new Contract();
        contract.setNum(contractNum);
        contract.setContent(content);

        Integer userId = userService.getCurrentUserId();
        boolean success = contractService.updateContract(
                contractNum,
                userId,
                contract,
                newAttachments,
                deletedAttachments);

        return success ? Result.success("更新成功") : Result.error("更新失败");
    }

    @PreAuthorize("hasAuthority('query_contract')")
    @GetMapping("/{id}")
    public Result<Contract> getContractById(@PathVariable Integer id) {
        Contract contract = contractService.getById(id);
        if (contract == null) {
            return Result.error("未找到该合同");
        }
        return Result.success(contract);
    }


    @GetMapping("/approvalInfo/{id}")
    public Map<String, Object> getApprovalInfo(@PathVariable Integer id) {
        // 获取合同审批相关信息
        return contractProcessService.getContractApprovalInfo(id);
    }

    @GetMapping("/concludeInfo/{id}")
    public Map<String, Object> getConcludeInfoInfo(@PathVariable Integer id) {
        // 合同签订
        return contractProcessService.getContractConcludeInfo(id);
    }

    //@PreAuthorize("hasAuthority('sign_contract')")
    @PostMapping("/submitSign")
    public boolean submitSign(@RequestBody Map<String, Object> request) {
        Integer contractId = Integer.valueOf((String) request.get("contractId"));
        String concludeOpinion = (String) request.get("concludeOpinion");
        return contractProcessService.submitConclude(contractId, concludeOpinion);
    }

    //@PreAuthorize("hasAuthority('approve_contract')")
    @PostMapping("/submitApproval")
    public boolean submitApproval(@RequestBody Map<String, Object> request) {
        Integer contractId = Integer.valueOf((String) request.get("contractId"));
        String approvalOpinion = (String) request.get("approvalOpinion");
        Integer approvalResult = "approved".equals(request.get("approvalResult")) ? 1 : 2;
        return contractProcessService.submitExamine(contractId, approvalOpinion, approvalResult);
    }
}



