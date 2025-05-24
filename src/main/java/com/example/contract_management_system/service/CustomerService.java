package com.example.contract_management_system.service;
import com.example.contract_management_system.pojo.Customer;

import java.util.List;

public interface CustomerService {
    boolean addCustomer(Customer customer);
    List<Customer> queryCustomers(String contractNo, Integer customerId, String name);

}
