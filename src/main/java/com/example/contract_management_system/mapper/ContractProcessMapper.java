package com.example.contract_management_system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.contract_management_system.pojo.ContractProcess;
import org.apache.ibatis.annotations.*;

import java.sql.Timestamp;
import java.util.Date;
import java.util.List;

@Mapper
public interface ContractProcessMapper extends BaseMapper<ContractProcess> {

    @Insert("INSERT INTO contract_process (conNum, type, state, user_id, content, time) " +
            "VALUES (#{conNum}, #{type}, #{state}, #{userId}, #{content}, #{time})")
    int insertContractProcess(@Param("conNum") int conNum,
                              @Param("type") int type,
                              @Param("state") int state,
                              @Param("userId") int userId,
                              @Param("content") String content,
                              @Param("time") Timestamp time );

    @Select("SELECT conNum FROM contract_process " +
            "WHERE user_id  = #{userId} AND type = 1 AND state = 0")
    List<Integer> getPendingCountersignContracts(@Param("userId") Integer userId);

    @Select("SELECT * FROM contract_process " +
            "WHERE conNum = #{contractId} AND user_id = #{userId} AND type = #{type}")
    ContractProcess getContractProcess(@Param("contNum") Integer conNum,
                                     @Param("userId") Integer userId,
                                     @Param("type") Integer type);

    @Update("UPDATE contract_process " +
            "SET state = #{state}, content = #{content}, time = #{time} " +
            "WHERE conNum = #{contractId} AND user_id  = #{userId} AND type = #{type}")
    int updateContractProcess(@Param("contNum") Integer contractId,
                            @Param("userId") Integer userId,
                            @Param("type") Integer type,
                            @Param("state") Integer state,
                            @Param("content") String content,
                            @Param("time") Date time);

    @Select("SELECT COUNT(*) = (SELECT COUNT(*) FROM contract_process " +
            "WHERE conNum = #{contractId} AND type = 1) " +
            "FROM contract_process " +
            "WHERE conNum = #{contractId} AND type = 1 AND state = 1")
    boolean checkAllCountersigned(@Param("contNum") Integer contractId);
}
