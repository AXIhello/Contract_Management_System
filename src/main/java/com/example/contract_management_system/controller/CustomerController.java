package com.example.contract_management_system.controller;

import com.example.contract_management_system.pojo.Customer;
import com.example.contract_management_system.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customer")
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    // 新增客户
    @PostMapping("/add")
    public Map<String, Object> addCustomer(@RequestBody Customer customer) {
        Map<String, Object> result = new HashMap<>();


        try {
            boolean success = customerService.addCustomer(customer);
            result.put("success", success);
            result.put("message", success ? "添加成功！" : "添加失败！");
            result.put("data", customer); // 回显
        } catch (Exception e) {
            //e.printStackTrace();
            result.put("success", false);
            result.put("message", "系统异常！");
        }

        return result;
    }

    // 查询客户（模糊查询）
//    @GetMapping("/query")
    public Map<String, Object> queryCustomers(
            @RequestParam(required = false) Integer customerId,
            @RequestParam(required = false) String name) {

        Map<String, Object> result = new HashMap<>();
        try {
            List<Customer> customers = customerService.queryCustomers(customerId, name);
            result.put("success", true);
            result.put("data", customers);
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "查询异常！");
        }
        return result;
    }

}
