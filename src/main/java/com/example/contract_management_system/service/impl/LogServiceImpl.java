package com.example.contract_management_system.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.contract_management_system.mapper.LogMapper;
import com.example.contract_management_system.pojo.Log;
import com.example.contract_management_system.service.LogService;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class LogServiceImpl extends ServiceImpl<LogMapper, Log> implements LogService {

    private final LogMapper logMapper;

    public LogServiceImpl(LogMapper  logMapper) {
        this.logMapper = logMapper;
    }

    @Override
    public boolean addLog(int userId, int type, String object, String name, Date date) {
        String content = " ";
        switch (type) {
            case 1: {
                content = "ADD " + object + " " + name;
                break;
            }
            case 2: {
                content = "DELETE " + object + " " + name;
                break;
            }
            case 3: {
                content = "UPDATE " + object + " " + name;
                break;
            }
            default: {
                content = "UNKNOWN " + object + " " + name;
                break;
            }
        }
        return logMapper.addLog(userId, content, date);
    }

    @Override
    public boolean addLog(int userId, int type, String object, String name) {
        return addLog(userId, type, object, name, new Date(new java.util.Date().getTime()));
    }

    @Override
    public List<Log> getAllLogs() {
        return logMapper.selectList(null);
    }


}
