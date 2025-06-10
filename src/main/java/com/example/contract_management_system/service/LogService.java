package com.example.contract_management_system.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.contract_management_system.pojo.Log;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;


public interface LogService extends IService<Log> {
    boolean addLog(int userId, int type, String object, String name, Date date);
    default boolean addLog(int userId, int type, String object, String name) {
        return addLog(userId, type, object, name, new Date());
    }

    List<Log> getAllLogs();
}
