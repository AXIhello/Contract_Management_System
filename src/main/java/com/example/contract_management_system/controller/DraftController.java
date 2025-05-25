package com.example.contract_management_system.controller;

import com.example.contract_management_system.pojo.Contract;
import com.example.contract_management_system.service.ContractService;
import com.example.contract_management_system.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import com.example.contract_management_system.service.ContractAttachmentService;
import org.springframework.web.multipart.MultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/contract")
@CrossOrigin(origins = "*") // 允许跨域请求
public class DraftController {
    private static final Logger logger = LoggerFactory.getLogger(DraftController.class);

    @Autowired
    private ContractService contractService;

    @Autowired
    private ContractAttachmentService contractAttachmentService;

    @Autowired
    private UserService userService;

    @PostMapping("/draft")
    public Map<String, Object> draftContract(
            @RequestParam("contractName") String contractName,
            @RequestParam("startDate") @DateTimeFormat(pattern = "yyyy-MM-dd") Date startDate,
            @RequestParam("endDate") @DateTimeFormat(pattern = "yyyy-MM-dd") Date endDate,
            @RequestParam("contractContent") String contractContent,
            @RequestParam("clientName") String clientName, // 客户信息：客户名（编号）格式
            @RequestParam(value = "contractFile", required = false) MultipartFile contractFile // 添加文件上传支持
    ) {
        Map<String, Object> response = new HashMap<>();
        logger.info("开始处理合同起草请求 - 合同名称: {}, 客户名称: {}", contractName, clientName);

        try {
            // 获取当前登录用户的ID
            Integer userId = userService.getCurrentUserId();
            logger.info("当前用户ID: {}", userId);
            
            if (userId == null) {
                logger.error("用户未登录或登录已过期");
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

            // 解析clientName格式：张三（1） -> 提取括号内的数字1作为客户编号保存
            int customerId;
            try {
                // 使用正则表达式提取括号内的数字，同时支持中英文括号
                java.util.regex.Pattern pattern = java.util.regex.Pattern.compile(".*[（(](\\d+)[）)]$");
                java.util.regex.Matcher matcher = pattern.matcher(clientName);
                logger.info("客户名称匹配结果: {}", matcher.find());

                if (matcher.find()) {
                    // 找到括号内的数字
                    customerId = Integer.parseInt(matcher.group(1));
                    logger.info("提取的客户编号: {}", customerId);
                } else {
                    logger.error("客户信息格式错误: {}", clientName);
                    response.put("success", false);
                    response.put("message", "客户信息格式错误，应为：客户名（编号）格式");
                    return response;
                }

                contract.setCustomer(customerId);
                logger.info("设置合同客户编号: {}", customerId);
            } catch (NumberFormatException e) {
                logger.error("客户信息格式错误: {}", clientName, e);
                response.put("success", false);
                response.put("message", "客户信息格式错误，应为：客户名（编号）格式");
                return response;
            }

            // 先保存合同信息
            logger.info("开始保存合同信息: {}", contract);
            boolean success = contractService.draftContract(contract);
            logger.info("合同保存结果: {}", success);

            if (success) {
                // 合同保存成功后，处理文件上传
                boolean attachmentSuccess = true;
                if (contractFile != null && !contractFile.isEmpty()) {
                    logger.info("开始处理附件上传");
                    attachmentSuccess = contractAttachmentService.uploadAndSaveAttachment(
                            contract.getNum(), contractFile);
                    logger.info("附件上传结果: {}", attachmentSuccess);
                }

                if (attachmentSuccess) {
                    response.put("success", true);
                    response.put("message", "合同起草成功" +
                            (contractFile != null && !contractFile.isEmpty() ? "，附件已上传" : ""));
                    response.put("contractId", contract.getNum());
                } else {
                    response.put("success", true);
                    response.put("message", "合同起草成功，但附件上传失败");
                    response.put("contractId", contract.getNum());
                }
            } else {
                logger.error("合同保存失败");
                response.put("success", false);
                response.put("message", "合同起草失败");
            }
        } catch (Exception e) {
            logger.error("合同起草过程发生异常", e);
            response.put("success", false);
            response.put("message", "系统错误：" + e.getMessage());
        }

        return response;
    }
}