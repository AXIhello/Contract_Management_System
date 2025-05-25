package com.example.contract_management_system.controller;

import com.example.contract_management_system.pojo.Contract;
import com.example.contract_management_system.service.ContractService;
import com.example.contract_management_system.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import com.example.contract_management_system.service.ContractAttachmentService;
import org.springframework.web.multipart.MultipartFile;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/contract")
@CrossOrigin(origins = "*") // 允许跨域请求
public class DraftController {

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

        try {
            // 获取当前登录用户的ID
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
            contract.setUserId(userId); // 设置用户ID而不是用户名

            // 解析clientName格式：张三（1） -> 提取括号内的数字1作为客户编号保存
            int customerId;
            try {
                // 使用正则表达式提取括号内的数字
                java.util.regex.Pattern pattern = java.util.regex.Pattern.compile(".*（(\\d+)）$");
                java.util.regex.Matcher matcher = pattern.matcher(clientName);

                if (matcher.find()) {
                    // 找到括号内的数字
                    customerId = Integer.parseInt(matcher.group(1));
                } else {
                    // 如果格式不匹配，尝试直接解析为数字（兼容性处理）
                    customerId = Integer.parseInt(clientName);
                }

                contract.setCustomer(customerId); // 保存客户编号
            } catch (NumberFormatException e) {
                response.put("success", false);
                response.put("message", "客户信息格式错误，应为：客户名（编号）格式");
                return response;
            }

            // 先保存合同信息
            boolean success = contractService.draftContract(contract);
            if (success) {
                // 合同保存成功后，处理文件上传
                boolean attachmentSuccess = true;
                if (contractFile != null && !contractFile.isEmpty()) {
                    attachmentSuccess = contractAttachmentService.uploadAndSaveAttachment(
                            contract.getNum(), contractFile);
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
                response.put("success", false);
                response.put("message", "合同起草失败");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "系统错误：" + e.getMessage());
        }

        return response;
    }
}