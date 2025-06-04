package com.example.contract_management_system.service;
import com.baomidou.mybatisplus.extension.service.IService;
import com.example.contract_management_system.pojo.Customer;

import java.rmi.Remote;
import java.util.List;

public interface CustomerService extends IService<Customer> {
    boolean addCustomer(Customer customer);
    List<Customer> queryCustomers(Integer customerId, String name);

}
