package com.example.contract_management_system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.contract_management_system.pojo.ContractProcess;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.Date;
import java.util.List;

@Mapper
public interface ContractProcessMapper extends BaseMapper<ContractProcess> {
    
    @Select("INSERT INTO contract_process (con_num, type, state, user_id, content, time) " +
            "VALUES (#{conNum}, #{type}, #{state}, #{userId}, #{content}, #{time})")
    int insertContractProcess(@Param("conNum") Integer conNum,
                            @Param("type") Integer type,
                            @Param("state") Integer state,
                            @Param("userId") Integer userId,
                            @Param("content") String content,
                            @Param("time") Date time);

    @Select("SELECT con_num FROM contract_process " +
            "WHERE user_id = #{userId} AND type = 1 AND state = 0")
    List<Integer> getPendingCountersignContracts(@Param("userId") Integer userId);

    @Select("SELECT * FROM contract_process " +
            "WHERE con_num = #{contractId} AND user_id = #{userId} AND type = #{type}")
    ContractProcess getContractProcess(@Param("contractId") Integer contractId,
                                     @Param("userId") Integer userId,
                                     @Param("type") Integer type);

    @Update("UPDATE contract_process " +
            "SET state = #{state}, content = #{content}, time = #{time} " +
            "WHERE con_num = #{contractId} AND user_id = #{userId} AND type = #{type}")
    int updateContractProcess(@Param("contractId") Integer contractId,
                            @Param("userId") Integer userId,
                            @Param("type") Integer type,
                            @Param("state") Integer state,
                            @Param("content") String content,
                            @Param("time") Date time);

    @Select("SELECT COUNT(*) = (SELECT COUNT(*) FROM contract_process " +
            "WHERE con_num = #{contractId} AND type = 1) " +
            "FROM contract_process " +
            "WHERE con_num = #{contractId} AND type = 1 AND state = 1")
    boolean checkAllCountersigned(@Param("contractId") Integer contractId);
}
