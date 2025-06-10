package com.example.contract_management_system.controller;

import com.example.contract_management_system.pojo.Log;
import com.example.contract_management_system.pojo.User;
import com.example.contract_management_system.service.LogService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/log")
public class LogController {

    private final LogService logService;

    public LogController(LogService logService) {
        this.logService = logService;
    }

    @GetMapping("/list")
    public List<Log> listLogs() {
        List<Log> logs = logService.getAllLogs();  // 查出所有用户

        return logs;
    }
}
