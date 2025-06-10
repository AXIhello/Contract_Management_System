package com.example.contract_management_system.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.contract_management_system.pojo.Log;
import org.springframework.stereotype.Service;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Date;
import java.util.List;


public interface LogService extends IService<Log> {
    boolean addLog(int userId, int type, String object, String name, Date date);
    default boolean addLog(int userId, int type, String object, String name) {
        ZonedDateTime zdt = ZonedDateTime.now(ZoneId.of("Asia/Beijing"));
        Date date = Date.from(zdt.toInstant());
        return addLog(userId, type, object, name, date);
    }

    List<Log> getAllLogs();
}
