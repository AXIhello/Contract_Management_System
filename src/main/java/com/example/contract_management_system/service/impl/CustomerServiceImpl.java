package com.example.contract_management_system.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.contract_management_system.mapper.CustomerMapper;
import com.example.contract_management_system.pojo.Customer;
import com.example.contract_management_system.service.CustomerService;
import com.example.contract_management_system.service.LogService;
import com.example.contract_management_system.service.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CustomerServiceImpl extends ServiceImpl<CustomerMapper, Customer> implements CustomerService {

    private final CustomerMapper customerMapper;
    private final LogService logService;
    private final UserService userService;

    public CustomerServiceImpl(CustomerMapper customerMapper, LogService logService, UserService userService) {
        this.customerMapper = customerMapper;
        this.logService = logService;
        this.userService = userService;
    }

    @Transactional
    @Override
    public boolean addCustomer(Customer customer){
        Integer userId = userService.getCurrentUserId();
        logService.addLog(userId, 1, "Customer","CustomerName: " +  customer.getName());
        return customerMapper.insert(customer) > 0;
    }


    @Override
    public List<Customer> queryCustomers( Integer customerId, String name) {
        QueryWrapper<Customer> wrapper = new QueryWrapper<>();
//        if (contractNo != null && !contractNo.trim().isEmpty()) {
//            wrapper.like("contract_no", contractNo);
//        } //待扩展：多表？
        if (customerId != null) {
            wrapper.eq("num", customerId);
        }
        if (name != null && !name.trim().isEmpty()) {
            wrapper.like("name", name);
        }
        return customerMapper.selectList(wrapper);
    }
    @Override
    public boolean deleteCustomerById(Integer num){
        Customer customer = customerMapper.selectById(num);
        Integer userId = userService.getCurrentUserId();
        logService.addLog(userId, 2, "Customer","CustomerName: " +  customer.getName());
        return customerMapper.deleteById(num)>0;
    }

    @Override
    public boolean updateCustomer(Customer customer){
        Integer userId = userService.getCurrentUserId();
        logService.addLog(userId, 3, "Customer","CustomerName: " + customer.getName());
        return customerMapper.updateById(customer)>0;
    }
}
