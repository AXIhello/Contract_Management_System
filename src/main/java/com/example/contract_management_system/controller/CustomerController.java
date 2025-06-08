package com.example.contract_management_system.controller;

import com.example.contract_management_system.pojo.Customer;
import com.example.contract_management_system.service.CustomerService;
import com.example.contract_management_system.util.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/customer")
public class CustomerController {

    @Autowired
    private CustomerService customerService;
    @PreAuthorize("hasAuthority('add_client')")
    @PostMapping("/add")
    public Result<Customer> addCustomer(@RequestBody Customer customer) {
        try {
            boolean success = customerService.addCustomer(customer);
            if (success) {
                return Result.success(customer);  // 返回数据 + 默认“操作成功”
            } else {
                return Result.error("添加失败！");
            }
        } catch (Exception e) {
            return Result.error("系统异常：" + e.getMessage());
        }
    }

    @PreAuthorize("hasAuthority('query_client')")
    @GetMapping("/query")
    public Result<List<Customer>> queryCustomers(
            @RequestParam(required = false) Integer customerId,
            @RequestParam(required = false) String name) {
        try {
            List<Customer> customers = customerService.queryCustomers(customerId, name);
            return Result.success(customers);
        } catch (Exception e) {
            return Result.error("查询异常：" + e.getMessage());
        }
    }


    @PreAuthorize("hasAuthority('delete_client')")
    @DeleteMapping("/delete/{id}")
    public Result<Void> deleteCustomer(@PathVariable("id") Integer id) {
        boolean success = customerService.deleteCustomerById(id);
        return success ? Result.success() : Result.error("删除失败！");
    }


    @PreAuthorize("hasAuthority('update_client')")
    @PutMapping("/update")
    public Result<Void> updateCustomer(@RequestBody Customer customer) {
        boolean success = customerService.updateCustomer(customer);
        return success ? Result.success() : Result.error("更新失败！");
    }


}
