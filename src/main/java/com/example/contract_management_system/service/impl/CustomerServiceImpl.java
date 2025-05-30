package com.example.contract_management_system.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.example.contract_management_system.mapper.CustomerMapper;
import com.example.contract_management_system.pojo.Customer;
import com.example.contract_management_system.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@Service
public class CustomerServiceImpl implements CustomerService {

    @Autowired
    private CustomerMapper customerMapper;

    @Override
    @Transactional
    public boolean addCustomer(Customer customer){
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

}
