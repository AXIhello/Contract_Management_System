package com.example.contract_management_system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.contract_management_system.pojo.*;
import org.apache.ibatis.annotations.Insert;
import org.springframework.data.repository.query.Param;
import java.sql.Timestamp;

public interface ContractProcessMapper extends BaseMapper<ContractProcess> {
    @Insert("INSERT INTO contract_process (conNum, type, state, user_id, content, time) " +
            "VALUES (#{conNum}, #{type}, #{state}, #{userId}, #{content}, #{time})")
    int insertContractProcess(@Param("conNum") int conNum,
                               @Param("type") int type,
                               @Param("state") int state,
                               @Param("user_id") int userId,
                               @Param("content") String content,
                               @Param("time") Timestamp time );

}
