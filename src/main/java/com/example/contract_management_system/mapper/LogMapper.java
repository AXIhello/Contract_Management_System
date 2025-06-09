package com.example.contract_management_system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.contract_management_system.pojo.Log;
import org.apache.ibatis.annotations.Insert;
import java.util.Date;

public interface LogMapper extends BaseMapper<Log> {
    @Insert("INSERT INTO log (user_id, content, time) " +
            "VALUES (#{userId}, #{content}, #{date})")
    boolean addLog(int userId, String content, Date date);
}
