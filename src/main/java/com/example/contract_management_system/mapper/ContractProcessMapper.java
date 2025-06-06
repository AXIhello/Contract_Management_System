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
            "WHERE conNum = #{conNum} AND user_id = #{userId} AND type = #{type}")
    ContractProcess getContractProcess(@Param("conNum") Integer conNum,
                                       @Param("userId") Integer userId,
                                       @Param("type") Integer type);

    @Update("UPDATE contract_process " +
            "SET state = #{state}, content = #{content}, time = #{time} " +
            "WHERE conNum = #{contractId} AND user_id  = #{userId} AND type = #{type}")
    int updateContractProcess(@Param("contractId") Integer contractId,
                            @Param("userId") Integer userId,
                            @Param("type") Integer type,
                            @Param("state") Integer state,
                            @Param("content") String content,
                            @Param("time") Timestamp time);

    @Select("SELECT COUNT(*) = 0 " +
            "FROM contract_process " +
            "WHERE conNum = #{conNum} AND type = 1 AND state = 0")
    boolean checkAllCountersigned(@Param("conNum") Integer conNum);

    @Select("SELECT COUNT(*) = 0 " +
            "FROM contract_process " +
            "WHERE conNum = #{conNum} AND type = 2 AND (state = 0 OR state = 2)")
    boolean checkAllExamined(@Param("conNum") Integer conNum);

    @Select("SELECT cp.conNum " +
            "FROM contract_process cp " +
            "JOIN contract_state cs ON cp.conNum = cs.conNum " +
            "WHERE cp.user_id = #{userId} " +
            "AND cp.type = 2 " +
            "AND cp.state = 0 " +
            "AND cs.type = 3")
    List<Integer> getPendingExamineContracts(@Param("userId") Integer userId);

    @Select("SELECT cp.conNum " +
            "FROM contract_process cp " +
            "JOIN contract_state cs ON cp.conNum = cs.conNum " +
            "WHERE cp.user_id = #{userId} " +
            "AND cp.type = 3 " +
            "AND cp.state = 0 " +
            "AND cs.type = 4")
    List<Integer> getPendingConcludeContracts(@Param("userId") Integer userId);

    @Select("SELECT content " +
            "FROM contract_process " +
            "WHERE type = #{type} " +
            "AND state <> 0 " +
            "AND conNum=#{conNum}")
    List<String> getContent(@Param("conNum") Integer conNum,@Param("type")Integer type);
}
